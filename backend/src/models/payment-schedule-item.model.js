const mongoose = require('mongoose');

const paymentScheduleItemSchema = new mongoose.Schema({
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
  offerLetterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'OfferLetter',
    required: [true, 'Offer Letter ID is required'],
    index: true
  },
  itemType: {
    type: String,
    enum: ['tuition', 'commission', 'fee', 'deposit', 'penalty', 'refund'],
    required: [true, 'Item type is required']
  },
  milestoneType: {
    type: String,
    enum: ['enrollment', 'visa_approval', 'course_start', 'semester_end', 'graduation', 'custom'],
    required: [true, 'Milestone type is required']
  },
  scheduledAmount: {
    value: {
      type: Number,
      required: [true, 'Scheduled amount is required'],
      min: [0, 'Scheduled amount cannot be negative']
    },
    currency: {
      type: String,
      required: [true, 'Currency is required'],
      default: 'USD'
    }
  },
  scheduledDueDate: {
    type: Date,
    required: [true, 'Scheduled due date is required']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringDetails: {
    frequency: {
      type: String,
      enum: ['weekly', 'monthly', 'quarterly', 'annually']
    },
    endDate: Date,
    occurrences: Number
  },
  conditions: [{
    type: String,
    description: String,
    isMet: {
      type: Boolean,
      default: false
    }
  }],
  status: {
    type: String,
    enum: ['active', 'retired', 'replaced', 'cancelled', 'completed'],
    default: 'active'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  replacedById: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PaymentScheduleItem',
    default: null
  },
  replacementReason: {
    type: String,
    enum: ['amount_change', 'date_change', 'milestone_change', 'correction', 'cancellation', 'other'],
    default: null
  },
  retiredAt: {
    type: Date,
    default: null
  },
  retiredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  retirementReason: {
    type: String,
    maxlength: [500, 'Retirement reason cannot exceed 500 characters']
  },
  parentItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PaymentScheduleItem',
    default: null
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
  },
  metadata: {
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    approvedAt: Date,
    completedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    completedAt: Date,
    notes: String,
    internalNotes: String,
    tags: [String]
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes for multi-tenant queries
paymentScheduleItemSchema.index({ accountId: 1, agencyId: 1, offerLetterId: 1 });
paymentScheduleItemSchema.index({ accountId: 1, agencyId: 1, itemType: 1 });
paymentScheduleItemSchema.index({ accountId: 1, agencyId: 1, milestoneType: 1 });
paymentScheduleItemSchema.index({ accountId: 1, agencyId: 1, scheduledDueDate: 1 });
paymentScheduleItemSchema.index({ accountId: 1, agencyId: 1, isActive: 1 });
paymentScheduleItemSchema.index({ scheduledDueDate: 1, isActive: 1 });

// Virtual for billing transactions
paymentScheduleItemSchema.virtual('billingTransactions', {
  ref: 'BillingTransaction',
  localField: '_id',
  foreignField: 'paymentScheduleItemId'
});

// Virtual for child items (if this is a parent recurring item)
paymentScheduleItemSchema.virtual('childItems', {
  ref: 'PaymentScheduleItem',
  localField: '_id',
  foreignField: 'parentItemId'
});

// Pre-save middleware to validate agency belongs to account
paymentScheduleItemSchema.pre('save', async function(next) {
  if (this.agencyId && this.accountId) {
    const Agency = mongoose.model('Agency');
    const agency = await Agency.findById(this.agencyId);
    if (agency && agency.accountId.toString() !== this.accountId.toString()) {
      throw new Error('Agency must belong to the same account');
    }
  }
  next();
});

// Pre-save middleware to validate offer letter belongs to same account and agency
paymentScheduleItemSchema.pre('save', async function(next) {
  if (this.offerLetterId) {
    const OfferLetter = mongoose.model('OfferLetter');
    const offerLetter = await OfferLetter.findById(this.offerLetterId);
    if (offerLetter) {
      if (offerLetter.accountId.toString() !== this.accountId.toString()) {
        throw new Error('Offer letter must belong to the same account');
      }
      if (offerLetter.agencyId.toString() !== this.agencyId.toString()) {
        throw new Error('Offer letter must belong to the same agency');
      }
    }
  }
  next();
});

// Instance method to check if item is overdue
paymentScheduleItemSchema.methods.isOverdue = function() {
  return new Date() > this.scheduledDueDate && this.isActive;
};

// Instance method to calculate days until due
paymentScheduleItemSchema.methods.daysUntilDue = function() {
  const today = new Date();
  const dueDate = new Date(this.scheduledDueDate);
  const diffTime = dueDate - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Instance method to soft retire item
paymentScheduleItemSchema.methods.retire = function(userId, reason) {
  this.status = 'retired';
  this.isActive = false;
  this.retiredAt = new Date();
  this.retiredBy = userId;
  this.retirementReason = reason;
  this.updatedBy = userId;
  return this.save();
};

// Instance method to replace item
paymentScheduleItemSchema.methods.replace = function(newItemId, reason, userId) {
  this.status = 'replaced';
  this.isActive = false;
  this.replacedById = newItemId;
  this.replacementReason = reason;
  this.updatedBy = userId;
  return this.save();
};

// Instance method to complete item
paymentScheduleItemSchema.methods.complete = function(userId) {
  this.status = 'completed';
  this.metadata.completedBy = userId;
  this.metadata.completedAt = new Date();
  this.updatedBy = userId;
  return this.save();
};

// Instance method to cancel item
paymentScheduleItemSchema.methods.cancel = function(userId, reason) {
  this.status = 'cancelled';
  this.isActive = false;
  this.retiredAt = new Date();
  this.retiredBy = userId;
  this.retirementReason = reason;
  this.updatedBy = userId;
  return this.save();
};

// Static method to get overdue items for an account
paymentScheduleItemSchema.statics.getOverdueItems = function(accountId, agencyId = null) {
  const query = {
    accountId,
    scheduledDueDate: { $lt: new Date() },
    status: 'active',
    isActive: true
  };
  
  if (agencyId) {
    query.agencyId = agencyId;
  }
  
  return this.find(query).populate('offerLetterId');
};

// Static method to get upcoming items
paymentScheduleItemSchema.statics.getUpcomingItems = function(accountId, days = 30, agencyId = null) {
  const today = new Date();
  const futureDate = new Date();
  futureDate.setDate(today.getDate() + days);
  
  const query = {
    accountId,
    scheduledDueDate: { 
      $gte: today,
      $lte: futureDate
    },
    status: 'active',
    isActive: true
  };
  
  if (agencyId) {
    query.agencyId = agencyId;
  }
  
  return this.find(query).populate('offerLetterId');
};

// Static method to generate recurring payment schedule items
paymentScheduleItemSchema.statics.generateRecurringItems = async function(parentItemId, userId) {
  const parentItem = await this.findById(parentItemId);
  if (!parentItem || !parentItem.isRecurring) {
    throw new Error('Parent item not found or not recurring');
  }

  const { frequency, endDate, occurrences } = parentItem.recurringDetails;
  const generatedItems = [];
  let currentDate = new Date(parentItem.scheduledDueDate);
  let count = 0;

  while (true) {
    // Check if we've reached the end conditions
    if (endDate && currentDate > endDate) break;
    if (occurrences && count >= occurrences) break;

    // Calculate next due date based on frequency
    switch (frequency) {
      case 'weekly':
        currentDate.setDate(currentDate.getDate() + 7);
        break;
      case 'monthly':
        currentDate.setMonth(currentDate.getMonth() + 1);
        break;
      case 'quarterly':
        currentDate.setMonth(currentDate.getMonth() + 3);
        break;
      case 'annually':
        currentDate.setFullYear(currentDate.getFullYear() + 1);
        break;
      default:
        throw new Error('Invalid frequency');
    }

    // Create new recurring item
    const newItem = await this.create({
      accountId: parentItem.accountId,
      agencyId: parentItem.agencyId,
      offerLetterId: parentItem.offerLetterId,
      itemType: parentItem.itemType,
      milestoneType: parentItem.milestoneType,
      scheduledAmount: parentItem.scheduledAmount,
      scheduledDueDate: new Date(currentDate),
      description: `${parentItem.description} (Recurring ${count + 1})`,
      priority: parentItem.priority,
      isRecurring: false, // Child items are not recurring themselves
      parentItemId: parentItem._id,
      createdBy: userId,
      updatedBy: userId,
      status: 'active'
    });

    generatedItems.push(newItem);
    count++;
  }

  return generatedItems;
};

// Static method to generate billing transactions from payment schedule items
paymentScheduleItemSchema.statics.generateBillingTransactions = async function(itemIds, userId, options = {}) {
  const BillingTransaction = mongoose.model('BillingTransaction');
  const BillingEventHistory = mongoose.model('BillingEventHistory');
  
  const items = await this.find({ _id: { $in: itemIds }, status: 'active', isActive: true })
    .populate('offerLetterId');

  const transactions = [];

  for (const item of items) {
    // Check if billing transaction already exists for this item
    const existingTransaction = await BillingTransaction.findOne({
      paymentScheduleItemId: item._id,
      status: { $nin: ['cancelled', 'refunded'] }
    });

    if (existingTransaction) {
      continue; // Skip if transaction already exists
    }

    // Get debtor information from offer letter
    const offerLetter = item.offerLetterId;
    let debtorType, debtorId;

    if (item.itemType === 'commission') {
      debtorType = 'agency';
      debtorId = item.agencyId;
    } else {
      debtorType = 'student';
      debtorId = offerLetter.studentId;
    }

    // Create billing transaction
    const transaction = await BillingTransaction.create({
      accountId: item.accountId,
      agencyId: item.agencyId,
      paymentScheduleItemId: item._id,
      debtorType,
      debtorId,
      signedAmount: item.scheduledAmount,
      dueDate: item.scheduledDueDate,
      transactionType: options.transactionType || 'scheduled',
      status: 'pending',
      references: {
        offerLetterId: item.offerLetterId._id,
        paymentScheduleItemId: item._id
      },
      createdBy: userId,
      updatedBy: userId
    });

    // Create event history entry
    await BillingEventHistory.createEvent({
      accountId: item.accountId,
      agencyId: item.agencyId,
      billingTransactionId: transaction._id,
      eventType: 'transaction_created',
      eventData: {
        transactionType: transaction.transactionType,
        amount: transaction.signedAmount,
        dueDate: transaction.dueDate,
        paymentScheduleItemId: item._id
      },
      triggeredBy: userId,
      performedBy: {
        userId,
        userType: 'user'
      }
    });

    transactions.push(transaction);
  }

  return transactions;
};

const PaymentScheduleItem = mongoose.model('PaymentScheduleItem', paymentScheduleItemSchema);

module.exports = PaymentScheduleItem;