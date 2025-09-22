// Account types and validation functions

// Account subscription plans
export const SUBSCRIPTION_PLANS = {
  TRIAL: 'trial',
  BASIC: 'basic',
  PREMIUM: 'premium',
  ENTERPRISE: 'enterprise'
};

// Account subscription statuses
export const SUBSCRIPTION_STATUSES = {
  ACTIVE: 'active',
  TRIAL: 'trial',
  SUSPENDED: 'suspended',
  INACTIVE: 'inactive',
  CANCELLED: 'cancelled'
};

// Account billing statuses
export const BILLING_STATUSES = {
  CURRENT: 'current',
  OVERDUE: 'overdue',
  SUSPENDED: 'suspended',
  CANCELLED: 'cancelled'
};

// Billing cycles
export const BILLING_CYCLES = {
  MONTHLY: 'monthly',
  QUARTERLY: 'quarterly',
  YEARLY: 'yearly'
};

// Timezone options (common ones)
export const TIMEZONES = [
  { value: 'UTC', label: 'UTC' },
  { value: 'America/New_York', label: 'Eastern Time (ET)' },
  { value: 'America/Chicago', label: 'Central Time (CT)' },
  { value: 'America/Denver', label: 'Mountain Time (MT)' },
  { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
  { value: 'Europe/London', label: 'London (GMT)' },
  { value: 'Europe/Paris', label: 'Paris (CET)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
  { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
  { value: 'Australia/Sydney', label: 'Sydney (AEDT)' }
];

// Currency options
export const CURRENCIES = [
  { value: 'USD', label: 'US Dollar (USD)' },
  { value: 'EUR', label: 'Euro (EUR)' },
  { value: 'GBP', label: 'British Pound (GBP)' },
  { value: 'CAD', label: 'Canadian Dollar (CAD)' },
  { value: 'AUD', label: 'Australian Dollar (AUD)' },
  { value: 'JPY', label: 'Japanese Yen (JPY)' }
];

// Date format options
export const DATE_FORMATS = [
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
  { value: 'DD-MM-YYYY', label: 'DD-MM-YYYY' }
];

// Helper functions
export const accountHelpers = {
  // Get display text for subscription plan
  getPlanDisplayText: (plan) => {
    const planMap = {
      [SUBSCRIPTION_PLANS.TRIAL]: 'Trial',
      [SUBSCRIPTION_PLANS.BASIC]: 'Basic',
      [SUBSCRIPTION_PLANS.PREMIUM]: 'Premium',
      [SUBSCRIPTION_PLANS.ENTERPRISE]: 'Enterprise'
    };
    return planMap[plan] || 'Unknown';
  },

  // Get display text for subscription status
  getSubscriptionStatusText: (status) => {
    const statusMap = {
      [SUBSCRIPTION_STATUSES.ACTIVE]: 'Active',
      [SUBSCRIPTION_STATUSES.TRIAL]: 'Trial',
      [SUBSCRIPTION_STATUSES.SUSPENDED]: 'Suspended',
      [SUBSCRIPTION_STATUSES.INACTIVE]: 'Inactive',
      [SUBSCRIPTION_STATUSES.CANCELLED]: 'Cancelled'
    };
    return statusMap[status] || 'Unknown';
  },

  // Get display text for billing status
  getBillingStatusText: (status) => {
    const statusMap = {
      [BILLING_STATUSES.CURRENT]: 'Current',
      [BILLING_STATUSES.OVERDUE]: 'Overdue',
      [BILLING_STATUSES.SUSPENDED]: 'Suspended',
      [BILLING_STATUSES.CANCELLED]: 'Cancelled'
    };
    return statusMap[status] || 'Unknown';
  },

  // Get CSS class for subscription status
  getSubscriptionStatusClass: (status) => {
    const classMap = {
      [SUBSCRIPTION_STATUSES.ACTIVE]: 'status-active',
      [SUBSCRIPTION_STATUSES.TRIAL]: 'status-trial',
      [SUBSCRIPTION_STATUSES.SUSPENDED]: 'status-suspended',
      [SUBSCRIPTION_STATUSES.INACTIVE]: 'status-inactive',
      [SUBSCRIPTION_STATUSES.CANCELLED]: 'status-cancelled'
    };
    return classMap[status] || 'status-unknown';
  },

  // Get CSS class for billing status
  getBillingStatusClass: (status) => {
    const classMap = {
      [BILLING_STATUSES.CURRENT]: 'status-current',
      [BILLING_STATUSES.OVERDUE]: 'status-overdue',
      [BILLING_STATUSES.SUSPENDED]: 'status-suspended',
      [BILLING_STATUSES.CANCELLED]: 'status-cancelled'
    };
    return classMap[status] || 'status-unknown';
  },

  // Format currency amount
  formatCurrency: (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount || 0);
  },

  // Check if account is in trial
  isTrialAccount: (account) => {
    return account?.subscription?.status === SUBSCRIPTION_STATUSES.TRIAL;
  },

  // Check if trial is expired
  isTrialExpired: (account) => {
    if (!account?.subscription?.trialEndDate) return false;
    return new Date(account.subscription.trialEndDate) < new Date();
  },

  // Get days remaining in trial
  getTrialDaysRemaining: (account) => {
    if (!account?.subscription?.trialEndDate) return 0;
    const trialEnd = new Date(account.subscription.trialEndDate);
    const now = new Date();
    const diffTime = trialEnd - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  },

  // Validate account form data
  validateAccountForm: (formData) => {
    const errors = {};

    // Validate name
    if (!formData.name || formData.name.trim().length === 0) {
      errors.name = 'Account name is required';
    } else if (formData.name.length > 100) {
      errors.name = 'Account name cannot exceed 100 characters';
    }

    // Validate contact email
    if (!formData.contactInfo?.email) {
      errors.contactEmail = 'Contact email is required';
    } else {
      const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
      if (!emailRegex.test(formData.contactInfo.email)) {
        errors.contactEmail = 'Please enter a valid email address';
      }
    }

    // Validate phone (optional but if provided, should be valid)
    if (formData.contactInfo?.phone && formData.contactInfo.phone.trim().length > 0) {
      const phoneRegex = /^[\+]?[1-9][\d\s\-\(\)]{7,15}$/;
      if (!phoneRegex.test(formData.contactInfo.phone.replace(/\s/g, ''))) {
        errors.contactPhone = 'Please enter a valid phone number';
      }
    }

    // Validate subscription plan
    if (formData.subscription?.plan && !Object.values(SUBSCRIPTION_PLANS).includes(formData.subscription.plan)) {
      errors.subscriptionPlan = 'Invalid subscription plan';
    }

    // Validate billing cycle
    if (formData.subscription?.billingCycle && !Object.values(BILLING_CYCLES).includes(formData.subscription.billingCycle)) {
      errors.billingCycle = 'Invalid billing cycle';
    }

    // Validate timezone
    if (formData.settings?.timezone) {
      const validTimezones = TIMEZONES.map(tz => tz.value);
      if (!validTimezones.includes(formData.settings.timezone)) {
        errors.timezone = 'Invalid timezone';
      }
    }

    // Validate currency
    if (formData.settings?.currency) {
      const validCurrencies = CURRENCIES.map(curr => curr.value);
      if (!validCurrencies.includes(formData.settings.currency)) {
        errors.currency = 'Invalid currency';
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
};

// Create initial form data for account creation/editing
export const createAccountFormData = (account = null) => {
  return {
    name: account?.name || '',
    contactInfo: {
      email: account?.contactInfo?.email || '',
      phone: account?.contactInfo?.phone || '',
      address: {
        street: account?.contactInfo?.address?.street || '',
        city: account?.contactInfo?.address?.city || '',
        state: account?.contactInfo?.address?.state || '',
        zipCode: account?.contactInfo?.address?.zipCode || '',
        country: account?.contactInfo?.address?.country || 'US'
      }
    },
    subscription: {
      plan: account?.subscription?.plan || SUBSCRIPTION_PLANS.TRIAL,
      billingCycle: account?.subscription?.billingCycle || BILLING_CYCLES.MONTHLY,
      maxUsers: account?.subscription?.maxUsers || 5,
      maxAgencies: account?.subscription?.maxAgencies || 1
    },
    billing: {
      companyName: account?.billing?.companyName || '',
      taxId: account?.billing?.taxId || '',
      address: {
        street: account?.billing?.address?.street || '',
        city: account?.billing?.address?.city || '',
        state: account?.billing?.address?.state || '',
        zipCode: account?.billing?.address?.zipCode || '',
        country: account?.billing?.address?.country || 'US'
      }
    },
    settings: {
      timezone: account?.settings?.timezone || 'UTC',
      currency: account?.settings?.currency || 'USD',
      dateFormat: account?.settings?.dateFormat || 'MM/DD/YYYY',
      language: account?.settings?.language || 'en'
    }
  };
};

// Standalone exports for validation functions
export const validateAccountForm = accountHelpers.validateAccountForm;

// AI-NOTE: Created comprehensive account types and validation functions following user.types.js pattern. Includes all subscription plans, statuses, billing cycles, helper functions for display text, status classes, currency formatting, trial management, form validation, and form data creation. Covers all fields from the backend account model schema.