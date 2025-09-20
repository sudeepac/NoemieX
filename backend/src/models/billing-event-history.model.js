const mongoose = require('mongoose');

const billingEventHistorySchema = new mongoose.Schema({
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
  billingTransactionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BillingTransaction',
    required: [true, 'Billing Transaction ID is required'],
    index: true
  },
  eventType: {
    type: String,
    enum: [
      'transaction_created',
      'transaction_updated',
      'transaction_claimed',
      'transaction_paid',
      'transaction_partially_paid',
      'transaction_disputed',
      'transaction_cancelled',
      'transaction_refunded',
      'payment_received',
      'payment_partial',
      'payment_failed',
      'overdue',
      'approved',
      'rejected',
      'reconciled',
      'dispute_resolved',
      'status_changed',
      'attachment_uploaded',
      'note_added'
    ],
    required: [true, 'Event type is required'],
    index: true
  },
  eventDate: {
    type: Date,
    required: [true, 'Event date is required'],
    default: Date.now,
    index: true
  },
  eventData: {
    previousStatus: String,
    newStatus: String,
    amount: {
      value: Number,
      currency: String
    },
    paymentMethod: String,
    reason: String,
    description: String,
    claimDate: Date,
    paidDate: Date,
    disputeReason: String,
    disputeDate: Date,
    resolvedDate: Date,
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    metadata: mongoose.Schema.Types.Mixed
  },
  triggeredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Triggered by user is required'],
    index: true
  },
  performedBy: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    userType: {
      type: String,
      enum: ['user', 'system', 'external']
    },
    ipAddress: String,
    userAgent: String
  },
  documents: [{
    name: String,
    url: String,
    type: {
      type: String,
      enum: ['receipt', 'invoice', 'statement', 'proof', 'other']
    },
    uploadDate: {
      type: Date,
      default: Date.now
    }
  }],
  systemInfo: {
    source: {
      type: String,
      enum: ['web', 'mobile', 'api', 'batch', 'webhook'],
      default: 'web'
    },
    version: String,
    requestId: String
  },
  notifications: {
    emailSent: {
      type: Boolean,
      default: false
    },
    smsSent: {
      type: Boolean,
      default: false
    },
    pushSent: {
      type: Boolean,
      default: false
    },
    sentAt: Date,
    recipients: [String]
  },
  isVisible: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes for multi-tenant queries
billingEventHistorySchema.index({ accountId: 1, agencyId: 1, eventType: 1 });
billingEventHistorySchema.index({ accountId: 1, agencyId: 1, billingTransactionId: 1, eventDate: -1 });
billingEventHistorySchema.index({ accountId: 1, agencyId: 1, eventDate: -1 });
billingEventHistorySchema.index({ eventDate: -1 });
billingEventHistorySchema.index({ 'performedBy.userId': 1, eventDate: -1 });

// Virtual for formatted event date
billingEventHistorySchema.virtual('formattedEventDate').get(function() {
  return this.eventDate.toISOString();
});

// Virtual for event summary
billingEventHistorySchema.virtual('eventSummary').get(function() {
  const summaries = {
    transaction_created: 'Transaction created',
    transaction_updated: 'Transaction updated',
    transaction_claimed: 'Transaction claimed',
    transaction_paid: 'Transaction marked as paid',
    transaction_partially_paid: 'Transaction partially paid',
    transaction_disputed: 'Transaction disputed',
    transaction_cancelled: 'Transaction cancelled',
    transaction_refunded: 'Transaction refunded',
    payment_received: 'Payment received',
    payment_partial: 'Partial payment received',
    payment_failed: 'Payment failed',
    overdue: 'Transaction overdue',
    approved: 'Transaction approved',
    rejected: 'Transaction rejected',
    reconciled: 'Transaction reconciled',
    dispute_resolved: 'Dispute resolved',
    status_changed: 'Status changed',
    attachment_uploaded: 'Attachment uploaded',
    note_added: 'Note added'
  };
  
  return summaries[this.eventType] || 'Unknown event';
});

// Pre-save middleware to validate agency belongs to account
billingEventHistorySchema.pre('save', async function(next) {
  if (this.agencyId && this.accountId) {
    const Agency = mongoose.model('Agency');
    const agency = await Agency.findById(this.agencyId);
    if (agency && agency.accountId.toString() !== this.accountId.toString()) {
      throw new Error('Agency must belong to the same account');
    }
  }
  next();
});

// Pre-save middleware to validate billing transaction belongs to same account and agency
billingEventHistorySchema.pre('save', async function(next) {
  if (this.billingTransactionId) {
    const BillingTransaction = mongoose.model('BillingTransaction');
    const transaction = await BillingTransaction.findById(this.billingTransactionId);
    if (transaction) {
      if (transaction.accountId.toString() !== this.accountId.toString()) {
        throw new Error('Billing transaction must belong to the same account');
      }
      if (transaction.agencyId.toString() !== this.agencyId.toString()) {
        throw new Error('Billing transaction must belong to the same agency');
      }
    }
  }
  next();
});

// Middleware to enforce insert-only compliance - prevent updates
billingEventHistorySchema.pre('save', function(next) {
  if (!this.isNew) {
    // Only allow updates to notification fields and isVisible for soft deletion
    const allowedUpdates = ['notifications', 'isVisible'];
    const modifiedPaths = this.modifiedPaths();
    const hasDisallowedUpdates = modifiedPaths.some(path => 
      !allowedUpdates.some(allowed => path.startsWith(allowed))
    );
    
    if (hasDisallowedUpdates) {
      throw new Error('Billing event history records cannot be modified after creation');
    }
  }
  next();
});

// Middleware to prevent deletion
billingEventHistorySchema.pre('remove', function(next) {
  throw new Error('Billing event history records cannot be deleted');
});

billingEventHistorySchema.pre('deleteOne', function(next) {
  throw new Error('Billing event history records cannot be deleted');
});

billingEventHistorySchema.pre('deleteMany', function(next) {
  throw new Error('Billing event history records cannot be deleted');
});

billingEventHistorySchema.pre('findOneAndDelete', function(next) {
  throw new Error('Billing event history records cannot be deleted');
});

billingEventHistorySchema.pre('findOneAndRemove', function(next) {
  throw new Error('Billing event history records cannot be deleted');
});

// Static method to create event history entry
billingEventHistorySchema.statics.createEvent = function(data) {
  return this.create({
    accountId: data.accountId,
    agencyId: data.agencyId,
    billingTransactionId: data.billingTransactionId,
    eventType: data.eventType,
    eventDate: data.eventDate || new Date(),
    eventData: data.eventData || {},
    triggeredBy: data.triggeredBy,
    performedBy: data.performedBy || { userType: 'system' },
    documents: data.documents || [],
    systemInfo: data.systemInfo || { source: 'web' },
    notifications: data.notifications || {},
    metadata: data.metadata || {}
  });
};

// Static method to get transaction timeline
billingEventHistorySchema.statics.getTransactionTimeline = function(billingTransactionId) {
  return this.find({ billingTransactionId })
    .sort({ eventDate: 1 })
    .populate('performedBy.userId', 'firstName lastName email')
    .lean();
};

// Static method to get activity summary for account/agency
billingEventHistorySchema.statics.getActivitySummary = function(accountId, agencyId = null, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  const matchStage = {
    accountId: new mongoose.Types.ObjectId(accountId),
    eventDate: { $gte: startDate },
    isVisible: true
  };
  
  if (agencyId) {
    matchStage.agencyId = new mongoose.Types.ObjectId(agencyId);
  }
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$eventType',
        count: { $sum: 1 },
        latestEvent: { $max: '$eventDate' }
      }
    },
    { $sort: { count: -1 } }
  ]);
};

// Static method to get user activity
billingEventHistorySchema.statics.getUserActivity = function(userId, accountId, days = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return this.find({
    'performedBy.userId': userId,
    accountId,
    eventDate: { $gte: startDate },
    isVisible: true
  })
  .sort({ eventDate: -1 })
  .populate('billingTransactionId', 'signedAmount status references')
  .limit(50);
};

// Instance method to mark as notification sent
billingEventHistorySchema.methods.markNotificationSent = function(type, recipients = []) {
  this.notifications[`${type}Sent`] = true;
  this.notifications.sentAt = new Date();
  if (recipients.length > 0) {
    this.notifications.recipients = recipients;
  }
  return this.save();
};

const BillingEventHistory = mongoose.model('BillingEventHistory', billingEventHistorySchema);

module.exports = BillingEventHistory;