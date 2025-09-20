const mongoose = require('mongoose');

const offerLetterSchema = new mongoose.Schema({
  accountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Account',
    required: [true, 'Account ID is required'],
    index: true
  },
  agencyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agency',
    required: [true, 'Agency ID is required'],
    index: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: [true, 'Student ID is required']
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course ID is required']
  },
  institutionDetails: {
    name: {
      type: String,
      required: [true, 'Institution name is required']
    },
    country: {
      type: String,
      required: [true, 'Institution country is required']
    },
    city: String,
    contactEmail: String,
    website: String
  },
  courseDetails: {
    name: {
      type: String,
      required: [true, 'Course name is required']
    },
    level: {
      type: String,
      enum: ['certificate', 'diploma', 'bachelor', 'master', 'phd'],
      required: [true, 'Course level is required']
    },
    duration: {
      value: Number,
      unit: {
        type: String,
        enum: ['months', 'years'],
        default: 'months'
      }
    },
    tuitionFee: {
      value: {
        type: Number,
        required: [true, 'Tuition fee is required'],
        min: [0, 'Tuition fee cannot be negative']
      },
      currency: {
        type: String,
        required: [true, 'Currency is required'],
        default: 'USD'
      }
    }
  },
  intake: {
    term: {
      type: String,
      enum: ['spring', 'summer', 'fall', 'winter'],
      required: [true, 'Intake term is required']
    },
    year: {
      type: Number,
      required: [true, 'Intake year is required'],
      min: [2020, 'Invalid intake year']
    },
    startDate: Date
  },
  issueDate: {
    type: Date,
    required: [true, 'Issue date is required'],
    default: Date.now
  },
  expiryDate: {
    type: Date,
    required: [true, 'Expiry date is required']
  },
  status: {
    type: String,
    enum: ['draft', 'pending', 'issued', 'accepted', 'rejected', 'expired', 'replaced', 'cancelled'],
    default: 'draft'
  },
  version: {
    type: Number,
    default: 1,
    min: 1
  },
  originalOfferLetterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'OfferLetter',
    default: null
  },
  replacedByOfferLetterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'OfferLetter',
    default: null
  },
  replacementReason: {
    type: String,
    enum: ['course_change', 'fee_update', 'intake_change', 'correction', 'upgrade', 'other'],
    default: null
  },
  lifecycle: {
    draftedAt: {
      type: Date,
      default: Date.now
    },
    issuedAt: Date,
    acceptedAt: Date,
    rejectedAt: Date,
    expiredAt: Date,
    replacedAt: Date,
    cancelledAt: Date
  },
  documents: {
    offerLetterUrl: {
      type: String,
      required: [true, 'Offer letter document URL is required']
    },
    additionalDocs: [{
      name: String,
      url: String,
      uploadDate: {
        type: Date,
        default: Date.now
      }
    }]
  },
  conditions: [{
    type: String,
    description: String,
    isMet: {
      type: Boolean,
      default: false
    }
  }],
  commissionDetails: {
    rate: {
      type: Number,
      min: [0, 'Commission rate cannot be negative'],
      max: [100, 'Commission rate cannot exceed 100%']
    },
    amount: {
      value: Number,
      currency: String
    },
    paymentTerms: String
  },
  notes: String,
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
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
offerLetterSchema.index({ accountId: 1, agencyId: 1, status: 1 });
offerLetterSchema.index({ accountId: 1, agencyId: 1, studentId: 1 });
offerLetterSchema.index({ accountId: 1, agencyId: 1, 'intake.year': 1, 'intake.term': 1 });
offerLetterSchema.index({ issueDate: 1 });
offerLetterSchema.index({ expiryDate: 1 });

// Virtual for payment schedule items
offerLetterSchema.virtual('paymentScheduleItems', {
  ref: 'PaymentScheduleItem',
  localField: '_id',
  foreignField: 'offerLetterId'
});

// Virtual for billing transactions
offerLetterSchema.virtual('billingTransactions', {
  ref: 'BillingTransaction',
  localField: '_id',
  foreignField: 'offerLetterId'
});

// Pre-save middleware to validate agency belongs to account
offerLetterSchema.pre('save', async function(next) {
  if (this.agencyId && this.accountId) {
    const Agency = mongoose.model('Agency');
    const agency = await Agency.findById(this.agencyId);
    if (agency && agency.accountId.toString() !== this.accountId.toString()) {
      throw new Error('Agency must belong to the same account');
    }
  }
  next();
});

// Pre-save middleware to set expiry date if not provided
offerLetterSchema.pre('save', function(next) {
  if (!this.expiryDate && this.issueDate) {
    // Default expiry: 6 months from issue date
    this.expiryDate = new Date(this.issueDate);
    this.expiryDate.setMonth(this.expiryDate.getMonth() + 6);
  }
  next();
});

// Instance method to check if offer letter is expired
offerLetterSchema.methods.isExpired = function() {
  return this.expiryDate && new Date() > this.expiryDate;
};

// Instance method to calculate commission
offerLetterSchema.methods.calculateCommission = function() {
  if (this.commissionDetails.rate && this.courseDetails.tuitionFee.value) {
    return (this.courseDetails.tuitionFee.value * this.commissionDetails.rate) / 100;
  }
  return this.commissionDetails.amount?.value || 0;
};

// Instance method to issue offer letter
offerLetterSchema.methods.issue = function(userId) {
  this.status = 'issued';
  this.lifecycle.issuedAt = new Date();
  this.updatedBy = userId;
  return this.save();
};

// Instance method to accept offer letter
offerLetterSchema.methods.accept = function(userId) {
  this.status = 'accepted';
  this.lifecycle.acceptedAt = new Date();
  this.updatedBy = userId;
  return this.save();
};

// Instance method to reject offer letter
offerLetterSchema.methods.reject = function(userId) {
  this.status = 'rejected';
  this.lifecycle.rejectedAt = new Date();
  this.updatedBy = userId;
  return this.save();
};

// Instance method to replace offer letter
offerLetterSchema.methods.replace = function(newOfferLetterId, reason, userId) {
  this.status = 'replaced';
  this.lifecycle.replacedAt = new Date();
  this.replacedByOfferLetterId = newOfferLetterId;
  this.replacementReason = reason;
  this.updatedBy = userId;
  return this.save();
};

// Instance method to cancel offer letter
offerLetterSchema.methods.cancel = function(userId) {
  this.status = 'cancelled';
  this.lifecycle.cancelledAt = new Date();
  this.updatedBy = userId;
  return this.save();
};

const OfferLetter = mongoose.model('OfferLetter', offerLetterSchema);

module.exports = OfferLetter;