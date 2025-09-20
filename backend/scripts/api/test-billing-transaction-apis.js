const axios = require('axios');
const colors = require('colors');

// Configuration
const BASE_URL = 'http://localhost:3000/api';
const DEV_TOKEN = 'dev-token-12345'; // Development authentication token

// Test data storage
let testBillingTransactionId = null;
let testAccountId = null;
let testAgencyId = null;

// Helper functions
const log = (message, type = 'info') => {
  const timestamp = new Date().toISOString();
  switch (type) {
    case 'success':
      console.log(`[${timestamp}] ✅ ${message}`.green);
      break;
    case 'error':
      console.log(`[${timestamp}] ❌ ${message}`.red);
      break;
    case 'warning':
      console.log(`[${timestamp}] ⚠️  ${message}`.yellow);
      break;
    default:
      console.log(`[${timestamp}] ℹ️  ${message}`.blue);
  }
};

const makeRequest = async (method, endpoint, data = null, params = null) => {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Authorization': `Bearer ${DEV_TOKEN}`,
        'Content-Type': 'application/json',
        'X-Dev-Mode': 'true'
      }
    };

    if (data) config.data = data;
    if (params) config.params = params;

    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data || error.message,
      status: error.response?.status || 500
    };
  }
};

// Test data generators
const generateBillingTransactionData = () => ({
  accountId: testAccountId,
  agencyId: testAgencyId,
  amount: Math.floor(Math.random() * 10000) + 1000,
  currency: 'USD',
  type: 'commission',
  description: `Test billing transaction ${Date.now()}`,
  dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  metadata: {
    source: 'api_test',
    testId: Date.now()
  }
});

const generateAccountData = () => ({
  name: `Test Account ${Date.now()}`,
  email: `test-account-${Date.now()}@example.com`,
  phone: '+1234567890',
  address: {
    street: '123 Test St',
    city: 'Test City',
    state: 'TS',
    zipCode: '12345',
    country: 'US'
  }
});

const generateAgencyData = () => ({
  name: `Test Agency ${Date.now()}`,
  email: `test-agency-${Date.now()}@example.com`,
  phone: '+1234567890',
  accountId: testAccountId,
  address: {
    street: '456 Agency Ave',
    city: 'Agency City',
    state: 'AC',
    zipCode: '67890',
    country: 'US'
  }
});

// Setup function
const setupTestData = async () => {
  log('Setting up test data...', 'info');
  
  // Create test account
  const accountData = generateAccountData();
  const accountResult = await makeRequest('POST', '/accounts', accountData);
  
  if (accountResult.success) {
    testAccountId = accountResult.data.data.id;
    log(`Created test account: ${testAccountId}`, 'success');
  } else {
    log(`Failed to create test account: ${JSON.stringify(accountResult.error)}`, 'error');
    return false;
  }

  // Create test agency
  const agencyData = generateAgencyData();
  const agencyResult = await makeRequest('POST', '/agencies', agencyData);
  
  if (agencyResult.success) {
    testAgencyId = agencyResult.data.data.id;
    log(`Created test agency: ${testAgencyId}`, 'success');
  } else {
    log(`Failed to create test agency: ${JSON.stringify(agencyResult.error)}`, 'error');
    return false;
  }

  return true;
};

// Test functions
const testCreateBillingTransaction = async () => {
  log('Testing billing transaction creation...', 'info');
  
  const billingTransactionData = generateBillingTransactionData();
  const result = await makeRequest('POST', '/billing-transactions', billingTransactionData);
  
  if (result.success) {
    testBillingTransactionId = result.data.data.id;
    log(`✅ Billing transaction created successfully: ${testBillingTransactionId}`, 'success');
    log(`Response: ${JSON.stringify(result.data, null, 2)}`, 'info');
    return true;
  } else {
    log(`❌ Failed to create billing transaction: ${JSON.stringify(result.error)}`, 'error');
    return false;
  }
};

const testGetBillingTransactions = async () => {
  log('Testing get all billing transactions...', 'info');
  
  const result = await makeRequest('GET', '/billing-transactions');
  
  if (result.success) {
    log(`✅ Retrieved ${result.data.data.length} billing transactions`, 'success');
    log(`Response: ${JSON.stringify(result.data, null, 2)}`, 'info');
    return true;
  } else {
    log(`❌ Failed to get billing transactions: ${JSON.stringify(result.error)}`, 'error');
    return false;
  }
};

const testGetBillingTransactionById = async () => {
  if (!testBillingTransactionId) {
    log('❌ No test billing transaction ID available', 'error');
    return false;
  }

  log(`Testing get billing transaction by ID: ${testBillingTransactionId}...`, 'info');
  
  const result = await makeRequest('GET', `/billing-transactions/${testBillingTransactionId}`);
  
  if (result.success) {
    log(`✅ Retrieved billing transaction: ${testBillingTransactionId}`, 'success');
    log(`Response: ${JSON.stringify(result.data, null, 2)}`, 'info');
    return true;
  } else {
    log(`❌ Failed to get billing transaction: ${JSON.stringify(result.error)}`, 'error');
    return false;
  }
};

const testUpdateBillingTransaction = async () => {
  if (!testBillingTransactionId) {
    log('❌ No test billing transaction ID available', 'error');
    return false;
  }

  log(`Testing billing transaction update: ${testBillingTransactionId}...`, 'info');
  
  const updateData = {
    amount: 5000,
    description: 'Updated test billing transaction',
    metadata: {
      source: 'api_test_updated',
      testId: Date.now()
    }
  };
  
  const result = await makeRequest('PUT', `/billing-transactions/${testBillingTransactionId}`, updateData);
  
  if (result.success) {
    log(`✅ Billing transaction updated successfully`, 'success');
    log(`Response: ${JSON.stringify(result.data, null, 2)}`, 'info');
    return true;
  } else {
    log(`❌ Failed to update billing transaction: ${JSON.stringify(result.error)}`, 'error');
    return false;
  }
};

const testUpdateBillingTransactionStatus = async () => {
  if (!testBillingTransactionId) {
    log('❌ No test billing transaction ID available', 'error');
    return false;
  }

  log(`Testing billing transaction status update: ${testBillingTransactionId}...`, 'info');
  
  const statusData = {
    status: 'processing',
    notes: 'Status updated via API test'
  };
  
  const result = await makeRequest('PATCH', `/billing-transactions/${testBillingTransactionId}/status`, statusData);
  
  if (result.success) {
    log(`✅ Billing transaction status updated successfully`, 'success');
    log(`Response: ${JSON.stringify(result.data, null, 2)}`, 'info');
    return true;
  } else {
    log(`❌ Failed to update billing transaction status: ${JSON.stringify(result.error)}`, 'error');
    return false;
  }
};

const testApproveBillingTransaction = async () => {
  if (!testBillingTransactionId) {
    log('❌ No test billing transaction ID available', 'error');
    return false;
  }

  log(`Testing billing transaction approval: ${testBillingTransactionId}...`, 'info');
  
  const approvalData = {
    notes: 'Approved via API test',
    approvedBy: 'test-admin'
  };
  
  const result = await makeRequest('POST', `/billing-transactions/${testBillingTransactionId}/approve`, approvalData);
  
  if (result.success) {
    log(`✅ Billing transaction approved successfully`, 'success');
    log(`Response: ${JSON.stringify(result.data, null, 2)}`, 'info');
    return true;
  } else {
    log(`❌ Failed to approve billing transaction: ${JSON.stringify(result.error)}`, 'error');
    return false;
  }
};

const testClaimBillingTransaction = async () => {
  if (!testBillingTransactionId) {
    log('❌ No test billing transaction ID available', 'error');
    return false;
  }

  log(`Testing billing transaction claim: ${testBillingTransactionId}...`, 'info');
  
  const claimData = {
    claimedBy: 'test-admin',
    notes: 'Claimed via API test'
  };
  
  const result = await makeRequest('PATCH', `/billing-transactions/${testBillingTransactionId}/claim`, claimData);
  
  if (result.success) {
    log(`✅ Billing transaction claimed successfully`, 'success');
    log(`Response: ${JSON.stringify(result.data, null, 2)}`, 'info');
    return true;
  } else {
    log(`❌ Failed to claim billing transaction: ${JSON.stringify(result.error)}`, 'error');
    return false;
  }
};

const testDisputeBillingTransaction = async () => {
  if (!testBillingTransactionId) {
    log('❌ No test billing transaction ID available', 'error');
    return false;
  }

  log(`Testing billing transaction dispute: ${testBillingTransactionId}...`, 'info');
  
  const disputeData = {
    reason: 'Amount discrepancy',
    description: 'Test dispute via API',
    disputedBy: 'test-admin'
  };
  
  const result = await makeRequest('PATCH', `/billing-transactions/${testBillingTransactionId}/dispute`, disputeData);
  
  if (result.success) {
    log(`✅ Billing transaction disputed successfully`, 'success');
    log(`Response: ${JSON.stringify(result.data, null, 2)}`, 'info');
    return true;
  } else {
    log(`❌ Failed to dispute billing transaction: ${JSON.stringify(result.error)}`, 'error');
    return false;
  }
};

const testResolveDisputeBillingTransaction = async () => {
  if (!testBillingTransactionId) {
    log('❌ No test billing transaction ID available', 'error');
    return false;
  }

  log(`Testing billing transaction dispute resolution: ${testBillingTransactionId}...`, 'info');
  
  const resolutionData = {
    resolution: 'Amount corrected',
    resolvedBy: 'test-admin',
    notes: 'Dispute resolved via API test'
  };
  
  const result = await makeRequest('PATCH', `/billing-transactions/${testBillingTransactionId}/resolve-dispute`, resolutionData);
  
  if (result.success) {
    log(`✅ Billing transaction dispute resolved successfully`, 'success');
    log(`Response: ${JSON.stringify(result.data, null, 2)}`, 'info');
    return true;
  } else {
    log(`❌ Failed to resolve billing transaction dispute: ${JSON.stringify(result.error)}`, 'error');
    return false;
  }
};

const testReconcileBillingTransaction = async () => {
  if (!testBillingTransactionId) {
    log('❌ No test billing transaction ID available', 'error');
    return false;
  }

  log(`Testing billing transaction reconciliation: ${testBillingTransactionId}...`, 'info');
  
  const reconcileData = {
    reconciledBy: 'test-admin',
    notes: 'Reconciled via API test',
    reconciliationDate: new Date().toISOString()
  };
  
  const result = await makeRequest('PATCH', `/billing-transactions/${testBillingTransactionId}/reconcile`, reconcileData);
  
  if (result.success) {
    log(`✅ Billing transaction reconciled successfully`, 'success');
    log(`Response: ${JSON.stringify(result.data, null, 2)}`, 'info');
    return true;
  } else {
    log(`❌ Failed to reconcile billing transaction: ${JSON.stringify(result.error)}`, 'error');
    return false;
  }
};

const testGetBillingTransactionStats = async () => {
  log('Testing get billing transaction statistics...', 'info');
  
  const result = await makeRequest('GET', '/billing-transactions/stats');
  
  if (result.success) {
    log(`✅ Retrieved billing transaction statistics`, 'success');
    log(`Response: ${JSON.stringify(result.data, null, 2)}`, 'info');
    return true;
  } else {
    log(`❌ Failed to get billing transaction statistics: ${JSON.stringify(result.error)}`, 'error');
    return false;
  }
};

const testGetOverdueTransactions = async () => {
  log('Testing get overdue billing transactions...', 'info');
  
  const result = await makeRequest('GET', '/billing-transactions/overdue');
  
  if (result.success) {
    log(`✅ Retrieved overdue billing transactions`, 'success');
    log(`Response: ${JSON.stringify(result.data, null, 2)}`, 'info');
    return true;
  } else {
    log(`❌ Failed to get overdue billing transactions: ${JSON.stringify(result.error)}`, 'error');
    return false;
  }
};

const testGetRevenueSummary = async () => {
  log('Testing get revenue summary...', 'info');
  
  const result = await makeRequest('GET', '/billing-transactions/revenue-summary');
  
  if (result.success) {
    log(`✅ Retrieved revenue summary`, 'success');
    log(`Response: ${JSON.stringify(result.data, null, 2)}`, 'info');
    return true;
  } else {
    log(`❌ Failed to get revenue summary: ${JSON.stringify(result.error)}`, 'error');
    return false;
  }
};

const testGetDisputedTransactions = async () => {
  log('Testing get disputed billing transactions...', 'info');
  
  const result = await makeRequest('GET', '/billing-transactions/disputed');
  
  if (result.success) {
    log(`✅ Retrieved disputed billing transactions`, 'success');
    log(`Response: ${JSON.stringify(result.data, null, 2)}`, 'info');
    return true;
  } else {
    log(`❌ Failed to get disputed billing transactions: ${JSON.stringify(result.error)}`, 'error');
    return false;
  }
};

// Error handling tests
const testInvalidBillingTransactionCreation = async () => {
  log('Testing invalid billing transaction creation...', 'info');
  
  const invalidData = {
    // Missing required fields
    amount: 'invalid',
    currency: 'INVALID'
  };
  
  const result = await makeRequest('POST', '/billing-transactions', invalidData);
  
  if (!result.success && result.status >= 400) {
    log(`✅ Invalid billing transaction creation properly rejected`, 'success');
    log(`Error response: ${JSON.stringify(result.error)}`, 'info');
    return true;
  } else {
    log(`❌ Invalid billing transaction creation should have failed`, 'error');
    return false;
  }
};

const testNonExistentBillingTransaction = async () => {
  log('Testing access to non-existent billing transaction...', 'info');
  
  const fakeId = '507f1f77bcf86cd799439011';
  const result = await makeRequest('GET', `/billing-transactions/${fakeId}`);
  
  if (!result.success && result.status === 404) {
    log(`✅ Non-existent billing transaction properly handled`, 'success');
    log(`Error response: ${JSON.stringify(result.error)}`, 'info');
    return true;
  } else {
    log(`❌ Non-existent billing transaction should return 404`, 'error');
    return false;
  }
};

// Cleanup function
const cleanup = async () => {
  log('Cleaning up test data...', 'info');
  
  // Note: In a real scenario, you might want to delete test data
  // For now, we'll just log the cleanup
  if (testBillingTransactionId) {
    log(`Test billing transaction ID: ${testBillingTransactionId}`, 'info');
  }
  if (testAgencyId) {
    log(`Test agency ID: ${testAgencyId}`, 'info');
  }
  if (testAccountId) {
    log(`Test account ID: ${testAccountId}`, 'info');
  }
  
  log('Cleanup completed', 'success');
};

// Main test runner
const runBillingTransactionTests = async () => {
  console.log('🚀 Starting Billing Transaction API Tests'.cyan.bold);
  console.log('=' .repeat(50).cyan);
  
  let passedTests = 0;
  let totalTests = 0;
  
  try {
    // Setup
    const setupSuccess = await setupTestData();
    if (!setupSuccess) {
      log('❌ Setup failed, aborting tests', 'error');
      return;
    }

    // Core CRUD operations
    totalTests++; if (await testCreateBillingTransaction()) passedTests++;
    totalTests++; if (await testGetBillingTransactions()) passedTests++;
    totalTests++; if (await testGetBillingTransactionById()) passedTests++;
    totalTests++; if (await testUpdateBillingTransaction()) passedTests++;
    
    // Status and workflow operations
    totalTests++; if (await testUpdateBillingTransactionStatus()) passedTests++;
    totalTests++; if (await testApproveBillingTransaction()) passedTests++;
    totalTests++; if (await testClaimBillingTransaction()) passedTests++;
    totalTests++; if (await testDisputeBillingTransaction()) passedTests++;
    totalTests++; if (await testResolveDisputeBillingTransaction()) passedTests++;
    totalTests++; if (await testReconcileBillingTransaction()) passedTests++;
    
    // Analytics and reporting
    totalTests++; if (await testGetBillingTransactionStats()) passedTests++;
    totalTests++; if (await testGetOverdueTransactions()) passedTests++;
    totalTests++; if (await testGetRevenueSummary()) passedTests++;
    totalTests++; if (await testGetDisputedTransactions()) passedTests++;
    
    // Error handling
    totalTests++; if (await testInvalidBillingTransactionCreation()) passedTests++;
    totalTests++; if (await testNonExistentBillingTransaction()) passedTests++;
    
  } catch (error) {
    log(`❌ Test execution failed: ${error.message}`, 'error');
  } finally {
    await cleanup();
  }
  
  // Results summary
  console.log('\n' + '='.repeat(50).cyan);
  console.log(`📊 Test Results: ${passedTests}/${totalTests} passed`.cyan.bold);
  
  if (passedTests === totalTests) {
    console.log('🎉 All tests passed!'.green.bold);
  } else {
    console.log(`⚠️  ${totalTests - passedTests} test(s) failed`.yellow.bold);
  }
  
  console.log('='.repeat(50).cyan);
};

// Export for use in other scripts
module.exports = {
  runBillingTransactionTests,
  testCreateBillingTransaction,
  testGetBillingTransactions,
  testGetBillingTransactionById,
  testUpdateBillingTransaction,
  testUpdateBillingTransactionStatus,
  testApproveBillingTransaction,
  testClaimBillingTransaction,
  testDisputeBillingTransaction,
  testResolveDisputeBillingTransaction,
  testReconcileBillingTransaction,
  testGetBillingTransactionStats,
  testGetOverdueTransactions,
  testGetRevenueSummary,
  testGetDisputedTransactions
};

// Run tests if this file is executed directly
if (require.main === module) {
  runBillingTransactionTests();
}