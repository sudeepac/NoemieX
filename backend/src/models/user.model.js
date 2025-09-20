const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    required: function() {
      return this.portalType !== 'superadmin';
    },
    index: true
  },
  agencyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agency',
    default: null,
    index: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  hashedPassword: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  role: {
    type: String,
    enum: ['admin', 'manager', 'user'],
    default: 'user'
  },
  portalType: {
    type: String,
    enum: ['superadmin', 'account', 'agency'],
    required: [true, 'Portal type is required']
  },
  managerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  profile: {
    phone: String,
    avatar: String,
    department: String,
    jobTitle: String,
    bio: String
  },
  permissions: [{
    resource: {
      type: String,
      required: true
    },
    actions: [{
      type: String,
      enum: ['create', 'read', 'update', 'delete']
    }]
  }],
  lastLogin: Date,
  isActive: {
    type: Boolean,
    default: true
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date
}, {
  timestamps: true,
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.hashedPassword;
      delete ret.emailVerificationToken;
      delete ret.passwordResetToken;
      delete ret.passwordResetExpires;
      return ret;
    }
  },
  toObject: { virtuals: true }
});

// Compound indexes for multi-tenant queries
userSchema.index({ accountId: 1, email: 1 });
userSchema.index({ accountId: 1, agencyId: 1, role: 1 });
userSchema.index({ accountId: 1, isActive: 1 });
userSchema.index({ portalType: 1, role: 1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for subordinates (users managed by this user)
userSchema.virtual('subordinates', {
  ref: 'User',
  localField: '_id',
  foreignField: 'managerId'
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('hashedPassword')) return next();
  
  const salt = await bcrypt.genSalt(12);
  this.hashedPassword = await bcrypt.hash(this.hashedPassword, salt);
  next();
});

// Pre-save middleware to validate agency belongs to account
userSchema.pre('save', async function(next) {
  if (this.agencyId && this.accountId) {
    const Agency = mongoose.model('Agency');
    const agency = await Agency.findById(this.agencyId);
    if (agency && agency.accountId.toString() !== this.accountId.toString()) {
      throw new Error('Agency must belong to the same account as user');
    }
  }
  next();
});

// Pre-save middleware to validate manager belongs to same account/agency
userSchema.pre('save', async function(next) {
  if (this.managerId) {
    const manager = await this.constructor.findById(this.managerId);
    if (manager) {
      if (manager.accountId.toString() !== this.accountId.toString()) {
        throw new Error('Manager must belong to the same account');
      }
      if (this.agencyId && manager.agencyId && 
          manager.agencyId.toString() !== this.agencyId.toString()) {
        throw new Error('Manager must belong to the same agency');
      }
    }
  }
  next();
});

// Instance method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.hashedPassword);
};

// Instance method to check if user has permission
userSchema.methods.hasPermission = function(resource, action) {
  const permission = this.permissions.find(p => p.resource === resource);
  return permission && permission.actions.includes(action);
};

// Static method to get role hierarchy
userSchema.statics.getRoleHierarchy = function() {
  return {
    admin: 3,
    manager: 2,
    user: 1
  };
};

// Instance method to check if user can manage another user
userSchema.methods.canManage = function(targetUser) {
  const hierarchy = this.constructor.getRoleHierarchy();
  return hierarchy[this.role] > hierarchy[targetUser.role];
};

const User = mongoose.model('User', userSchema);

module.exports = User;