const mongoose = require('mongoose');

const accountSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Account name is required'],
    trim: true,
    maxlength: [100, 'Account name cannot exceed 100 characters']
  },
  contactInfo: {
    email: {
      type: String,
      required: [true, 'Contact email is required'],
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    phone: {
      type: String,
      trim: true
    },
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String
    }
  },
  subscription: {
    plan: {
      type: String,
      enum: ['trial', 'basic', 'premium', 'enterprise'],
      default: 'trial'
    },
    status: {
      type: String,
      enum: ['active', 'trial', 'suspended', 'inactive', 'cancelled'],
      default: 'trial'
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: Date,
    trialEndDate: Date,
    billingCycle: {
      type: String,
      enum: ['monthly', 'quarterly', 'yearly'],
      default: 'monthly'
    },
    nextBillingDate: Date,
    lastPaymentDate: Date
  },
  billing: {
    status: {
      type: String,
      enum: ['current', 'overdue', 'suspended', 'cancelled'],
      default: 'current'
    },
    totalRevenue: {
      type: Number,
      default: 0
    },
    outstandingBalance: {
      type: Number,
      default: 0
    }
  },
  settings: {
    timezone: {
      type: String,
      default: 'UTC'
    },
    currency: {
      type: String,
      default: 'USD'
    },
    dateFormat: {
      type: String,
      default: 'MM/DD/YYYY'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
accountSchema.index({ 'contactInfo.email': 1 }, { unique: true });
accountSchema.index({ isActive: 1 });

// Virtual for agencies count
accountSchema.virtual('agenciesCount', {
  ref: 'Agency',
  localField: '_id',
  foreignField: 'accountId',
  count: true
});

// Virtual for users count
accountSchema.virtual('usersCount', {
  ref: 'User',
  localField: '_id',
  foreignField: 'accountId',
  count: true
});

const Account = mongoose.model('Account', accountSchema);

module.exports = Account;