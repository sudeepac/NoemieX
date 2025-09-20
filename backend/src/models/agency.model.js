const mongoose = require('mongoose');

const agencySchema = new mongoose.Schema({
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    required: [true, 'Account ID is required'],
    index: true
  },
  name: {
    type: String,
    required: [true, 'Agency name is required'],
    trim: true,
    maxlength: [100, 'Agency name cannot exceed 100 characters']
  },
  type: {
    type: String,
    enum: ['main', 'branch', 'partner', 'subagent'],
    default: 'main'
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
    },
    website: String
  },
  commissionSplitPercent: {
    type: Number,
    min: [0, 'Commission split cannot be negative'],
    max: [100, 'Commission split cannot exceed 100%'],
    default: 0
  },
  commissionStructure: {
    type: {
      type: String,
      enum: ['percentage', 'fixed', 'tiered'],
      default: 'percentage'
    },
    tiers: [{
      minAmount: Number,
      maxAmount: Number,
      rate: Number
    }],
    fixedAmount: Number
  },
  performance: {
    totalCommissionEarned: {
      type: Number,
      default: 0
    },
    totalOfferLetters: {
      type: Number,
      default: 0
    },
    totalTransactions: {
      type: Number,
      default: 0
    },
    lastActivityDate: Date
  },
  parentAgencyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agency',
    default: null
  },
  businessDetails: {
    registrationNumber: String,
    taxId: String,
    licenseNumber: String,
    establishedDate: Date
  },
  bankDetails: {
    accountName: String,
    accountNumber: String,
    bankName: String,
    routingNumber: String,
    swiftCode: String
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

// Compound indexes for multi-tenant queries
agencySchema.index({ accountId: 1, isActive: 1 });
agencySchema.index({ accountId: 1, name: 1 });
agencySchema.index({ accountId: 1, type: 1 });

// Virtual for sub-agencies
agencySchema.virtual('subAgencies', {
  ref: 'Agency',
  localField: '_id',
  foreignField: 'parentAgencyId'
});

// Virtual for users count
agencySchema.virtual('usersCount', {
  ref: 'User',
  localField: '_id',
  foreignField: 'agencyId',
  count: true
});

// Virtual for offer letters count
agencySchema.virtual('offerLettersCount', {
  ref: 'OfferLetter',
  localField: '_id',
  foreignField: 'agencyId',
  count: true
});

// Pre-save middleware to ensure accountId consistency
agencySchema.pre('save', async function(next) {
  if (this.parentAgencyId) {
    const parentAgency = await this.constructor.findById(this.parentAgencyId);
    if (parentAgency && parentAgency.accountId.toString() !== this.accountId.toString()) {
      throw new Error('Parent agency must belong to the same account');
    }
  }
  next();
});

const Agency = mongoose.model('Agency', agencySchema);

module.exports = Agency;