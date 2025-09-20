const mongoose = require('mongoose');

const billingTransactionSchema = new mongoose.Schema({
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
  paymentScheduleItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PaymentScheduleItem',
    required: [true, 'Payment Schedule Item ID is required'],
    index: true
  },
  debtorType: {
    type: String,
    enum: ['student', 'institution', 'agency', 'government'],
    required: [true, 'Debtor type is required']
  },
  debtorId: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'Debtor ID is required'],
    refPath: 'debtorType'
  },
  signedAmount: {
    value: {
      type: Number,
      required: [true, 'Signed amount is required']
    },
    currency: {
      type: String,
      required: [true, 'Currency is required'],
      default: 'USD'
    }
  },
  originalAmount: {
    value: Number,
    currency: String
  },
  exchangeRate: {
    rate: Number,
    fromCurrency: String,
    toCurrency: String,
    rateDate: Date
  },
  status: {
    type: String,
    enum: ['pending', 'claimed', 'partially_paid', 'paid', 'overdue', 'disputed', 'cancelled', 'refunded'],
    default: 'pending',
    index: true
  },
  transactionType: {
    type: String,
    enum: ['invoice', 'payment', 'refund', 'adjustment', 'penalty'],
    required: [true, 'Transaction type is required']
  },
  claimedDate: Date,
  paidDate: Date,
  dueDate: Date,
  paymentMethod: {
    type: String,
    enum: ['bank_transfer', 'credit_card', 'debit_card', 'paypal', 'stripe', 'check', 'cash', 'other']
  },
  references: {
    invoiceRef: String,
    creditNoteRef: String,
    receiptRef: String,
    externalRef: String
  },
  bonusRuleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BonusRule',
    default: null
  },
  fees: {
    processingFee: {
      value: Number,
      currency: String
    },
    lateFee: {
      value: Number,
      currency: String
    },
    conversionFee: {
      value: Number,
      currency: String
    }
  },
  reconciliation: {
    isReconciled: {
      type: Boolean,
      default: false
    },
    reconciledDate: Date,
    reconciledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    bankStatementRef: String
  },
  approvals: [{
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    approvedAt: {
      type: Date,
      default: Date.now
    },
    level: {
      type: String,
      enum: ['manager', 'admin', 'finance'],
      required: true
    },
    comments: String
  }],
  attachments: [{
    name: String,
    url: String,
    type: {
      type: String,
      enum: ['invoice', 'receipt', 'bank_statement', 'contract', 'other']
    },
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  notes: String,
  // Audit fields
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Created by is required']
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Updated by is required']
  },
  // Enhanced metadata
  metadata: {
    source: {
      type: String,
      enum: ['manual', 'automated', 'import', 'api'],
      default: 'manual'
    },
    disputeReason: String,
    disputeDate: Date,
    disputeResolvedDate: Date,
    disputeResolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    tags: [String],
    internalNotes: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes for multi-tenant queries
billingTransactionSchema.index({ accountId: 1, agencyId: 1, status: 1 });
billingTransactionSchema.index({ accountId: 1, agencyId: 1, transactionType: 1 });
billingTransactionSchema.index({ accountId: 1, agencyId: 1, debtorType: 1, debtorId: 1 });
billingTransactionSchema.index({ accountId: 1, agencyId: 1, claimedDate: 1 });
billingTransactionSchema.index({ accountId: 1, agencyId: 1, paidDate: 1 });
billingTransactionSchema.index({ dueDate: 1, status: 1 });
billingTransactionSchema.index({ 'references.invoiceRef': 1 });

// Virtual for billing event histories
billingTransactionSchema.virtual('eventHistories', {
  ref: 'BillingEventHistory',
  localField: '_id',
  foreignField: 'billingTransactionId'
});

// Virtual for net amount (after fees)
billingTransactionSchema.virtual('netAmount').get(function() {
  let net = this.signedAmount.value;
  
  if (this.fees.processingFee?.value) {
    net -= this.fees.processingFee.value;
  }
  if (this.fees.lateFee?.value) {
    net -= this.fees.lateFee.value;
  }
  if (this.fees.conversionFee?.value) {
    net -= this.fees.conversionFee.value;
  }
  
  return {
    value: net,
    currency: this.signedAmount.currency
  };
});

// Virtual for days overdue
billingTransactionSchema.virtual('daysOverdue').get(function() {
  if (!this.dueDate || this.status === 'paid') return 0;
  
  const today = new Date();
  const diffTime = today - this.dueDate;
  return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
});

// Pre-save middleware to validate agency belongs to account
billingTransactionSchema.pre('save', async function(next) {
  if (this.agencyId && this.accountId) {
    const Agency = mongoose.model('Agency');
    const agency = await Agency.findById(this.agencyId);
    if (agency && agency.accountId.toString() !== this.accountId.toString()) {
      throw new Error('Agency must belong to the same account');
    }
  }
  next();
});

// Pre-save middleware to validate payment schedule item belongs to same account and agency
billingTransactionSchema.pre('save', async function(next) {
  if (this.paymentScheduleItemId) {
    const PaymentScheduleItem = mongoose.model('PaymentScheduleItem');
    const item = await PaymentScheduleItem.findById(this.paymentScheduleItemId);
    if (item) {
      if (item.accountId.toString() !== this.accountId.toString()) {
        throw new Error('Payment schedule item must belong to the same account');
      }
      if (item.agencyId.toString() !== this.agencyId.toString()) {
        throw new Error('Payment schedule item must belong to the same agency');
      }
    }
  }
  next();
});

// Pre-save middleware to set due date from payment schedule item if not provided
billingTransactionSchema.pre('save', async function(next) {
  if (!this.dueDate && this.paymentScheduleItemId) {
    const PaymentScheduleItem = mongoose.model('PaymentScheduleItem');
    const item = await PaymentScheduleItem.findById(this.paymentScheduleItemId);
    if (item) {
      this.dueDate = item.scheduledDueDate;
    }
  }
  next();
});

// Instance method to check if transaction is overdue
billingTransactionSchema.methods.isOverdue = function() {
  return this.dueDate && new Date() > this.dueDate && 
         !['paid', 'cancelled', 'refunded'].includes(this.status);
};

// Instance method to calculate total fees
billingTransactionSchema.methods.getTotalFees = function() {
  let total = 0;
  if (this.fees.processingFee?.value) total += this.fees.processingFee.value;
  if (this.fees.lateFee?.value) total += this.fees.lateFee.value;
  if (this.fees.conversionFee?.value) total += this.fees.conversionFee.value;
  
  return {
    value: total,
    currency: this.signedAmount.currency
  };
};

// Instance method to add approval
billingTransactionSchema.methods.addApproval = function(userId, level, comments = '') {
  this.approvals.push({
    approvedBy: userId,
    level,
    comments
  });
  return this.save();
};

// Instance method to claim transaction
billingTransactionSchema.methods.claim = function(userId, claimDate = new Date()) {
  if (this.status !== 'pending') {
    throw new Error(`Cannot claim transaction with status: ${this.status}`);
  }
  
  this.status = 'claimed';
  this.claimedDate = claimDate;
  this.updatedBy = userId;
  
  return this.save();
};

// Instance method to mark as paid
billingTransactionSchema.methods.markAsPaid = function(userId, paidDate = new Date(), paymentMethod = null) {
  if (!['claimed', 'partially_paid', 'overdue'].includes(this.status)) {
    throw new Error(`Cannot mark as paid transaction with status: ${this.status}`);
  }
  
  this.status = 'paid';
  this.paidDate = paidDate;
  if (paymentMethod) {
    this.paymentMethod = paymentMethod;
  }
  this.updatedBy = userId;
  
  return this.save();
};

// Instance method to mark as partially paid
billingTransactionSchema.methods.markAsPartiallyPaid = function(userId, paidDate = new Date(), paymentMethod = null) {
  if (!['claimed', 'overdue'].includes(this.status)) {
    throw new Error(`Cannot mark as partially paid transaction with status: ${this.status}`);
  }
  
  this.status = 'partially_paid';
  this.paidDate = paidDate;
  if (paymentMethod) {
    this.paymentMethod = paymentMethod;
  }
  this.updatedBy = userId;
  
  return this.save();
};

// Instance method to dispute transaction
billingTransactionSchema.methods.dispute = function(userId, disputeReason, disputeDate = new Date()) {
  if (['cancelled', 'refunded'].includes(this.status)) {
    throw new Error(`Cannot dispute transaction with status: ${this.status}`);
  }
  
  this.status = 'disputed';
  this.metadata.disputeReason = disputeReason;
  this.metadata.disputeDate = disputeDate;
  this.updatedBy = userId;
  
  return this.save();
};

// Instance method to resolve dispute
billingTransactionSchema.methods.resolveDispute = function(userId, newStatus, resolvedDate = new Date()) {
  if (this.status !== 'disputed') {
    throw new Error('Can only resolve disputed transactions');
  }
  
  if (!['paid', 'cancelled', 'refunded'].includes(newStatus)) {
    throw new Error('Invalid resolution status');
  }
  
  this.status = newStatus;
  this.metadata.disputeResolvedDate = resolvedDate;
  this.metadata.disputeResolvedBy = userId;
  this.updatedBy = userId;
  
  return this.save();
};

// Instance method to cancel transaction
billingTransactionSchema.methods.cancel = function(userId, reason = '') {
  if (['paid', 'refunded'].includes(this.status)) {
    throw new Error(`Cannot cancel transaction with status: ${this.status}`);
  }
  
  this.status = 'cancelled';
  if (reason) {
    this.metadata.internalNotes = reason;
  }
  this.updatedBy = userId;
  
  return this.save();
};

// Instance method to refund transaction
billingTransactionSchema.methods.refund = function(userId, reason = '') {
  if (this.status !== 'paid') {
    throw new Error('Can only refund paid transactions');
  }
  
  this.status = 'refunded';
  if (reason) {
    this.metadata.internalNotes = reason;
  }
  this.updatedBy = userId;
  
  return this.save();
};

// Static method to get overdue transactions
billingTransactionSchema.statics.getOverdueTransactions = function(accountId, agencyId = null) {
  const query = {
    accountId,
    dueDate: { $lt: new Date() },
    status: { $nin: ['paid', 'cancelled', 'refunded'] }
  };
  
  if (agencyId) {
    query.agencyId = agencyId;
  }
  
  return this.find(query).populate('paymentScheduleItemId');
};

// Static method to get disputed transactions
billingTransactionSchema.statics.getDisputedTransactions = function(accountId, agencyId = null) {
  const query = {
    accountId,
    status: 'disputed'
  };
  
  if (agencyId) {
    query.agencyId = agencyId;
  }
  
  return this.find(query)
    .populate('paymentScheduleItemId')
    .populate('metadata.disputeResolvedBy', 'name email')
    .sort({ 'metadata.disputeDate': -1 });
};

// Static method to get revenue summary
billingTransactionSchema.statics.getRevenueSummary = function(accountId, agencyId = null, startDate, endDate) {
  const matchStage = {
    accountId: new mongoose.Types.ObjectId(accountId),
    status: 'paid'
  };
  
  if (agencyId) {
    matchStage.agencyId = new mongoose.Types.ObjectId(agencyId);
  }
  
  if (startDate && endDate) {
    matchStage.paidDate = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$signedAmount.currency',
        totalRevenue: { $sum: '$signedAmount.value' },
        transactionCount: { $sum: 1 },
        averageAmount: { $avg: '$signedAmount.value' }
      }
    }
  ]);
};

const BillingTransaction = mongoose.model('BillingTransaction', billingTransactionSchema);

module.exports = BillingTransaction;