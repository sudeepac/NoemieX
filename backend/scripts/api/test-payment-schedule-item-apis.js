const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3000/api';
const DEV_AUTH_TOKEN = 'dev-auth-token-12345'; // Development authentication token

// Helper function to make authenticated requests
async function makeRequest(method, endpoint, data = null, params = {}) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Authorization': `Bearer ${DEV_AUTH_TOKEN}`,
        'Content-Type': 'application/json'
      }
    };

    if (data) {
      config.data = data;
    }

    if (Object.keys(params).length > 0) {
      config.params = params;
    }

    const response = await axios(config);
    return {
      success: true,
      status: response.status,
      data: response.data
    };
  } catch (error) {
    return {
      success: false,
      status: error.response?.status || 500,
      error: error.response?.data || error.message
    };
  }
}

// Test data generators
function generateTestData() {
  return {
    validMongoId: '507f1f77bcf86cd799439011',
    invalidMongoId: 'invalid-id',
    paymentScheduleItem: {
      title: 'Test Payment Schedule Item',
      description: 'Test payment schedule item for API testing',
      amount: 1000.00,
      currency: 'USD',
      dueDate: '2024-12-31T23:59:59.999Z',
      frequency: 'monthly',
      status: 'pending',
      accountId: '507f1f77bcf86cd799439011',
      agencyId: '507f1f77bcf86cd799439012',
      billingTransactionId: '507f1f77bcf86cd799439013',
      metadata: {
        category: 'subscription',
        priority: 'high'
      }
    },
    updateData: {
      title: 'Updated Payment Schedule Item',
      amount: 1500.00,
      status: 'approved'
    },
    generateTransactionsData: {
      startDate: '2024-01-01T00:00:00.000Z',
      endDate: '2024-12-31T23:59:59.999Z',
      accountId: '507f1f77bcf86cd799439011'
    },
    generateRecurringData: {
      count: 12,
      frequency: 'monthly'
    }
  };
}

// Setup and cleanup functions
async function setupTestData() {
  console.log('Setting up test data for payment schedule items...');
  // In a real scenario, you might create test accounts, agencies, etc.
  return true;
}

async function cleanupTestData() {
  console.log('Cleaning up test data for payment schedule items...');
  // In a real scenario, you might clean up test data
  return true;
}

// Test functions
async function testGetPaymentScheduleItemStats() {
  console.log('\n=== Testing GET /payment-schedule-items/stats ===');
  
  // Test 1: Get payment schedule item statistics
  console.log('Test 1: Get payment schedule item statistics');
  const result1 = await makeRequest('GET', '/payment-schedule-items/stats');
  console.log('Status:', result1.status);
  console.log('Success:', result1.success);
  if (result1.success) {
    console.log('Response structure:', Object.keys(result1.data));
  } else {
    console.log('Error:', result1.error);
  }

  return result1.success;
}

async function testGetOverdueItems() {
  console.log('\n=== Testing GET /payment-schedule-items/overdue ===');
  
  // Test 1: Get overdue payment schedule items
  console.log('Test 1: Get overdue payment schedule items');
  const result1 = await makeRequest('GET', '/payment-schedule-items/overdue');
  console.log('Status:', result1.status);
  console.log('Success:', result1.success);
  if (result1.success) {
    console.log('Response structure:', Object.keys(result1.data));
  } else {
    console.log('Error:', result1.error);
  }

  // Test 2: Get overdue items with pagination
  console.log('\nTest 2: Get overdue items with pagination');
  const result2 = await makeRequest('GET', '/payment-schedule-items/overdue', null, {
    page: 1,
    limit: 10
  });
  console.log('Status:', result2.status);
  console.log('Success:', result2.success);

  return result1.success;
}

async function testGetUpcomingItems() {
  console.log('\n=== Testing GET /payment-schedule-items/upcoming ===');
  
  // Test 1: Get upcoming payment schedule items
  console.log('Test 1: Get upcoming payment schedule items');
  const result1 = await makeRequest('GET', '/payment-schedule-items/upcoming');
  console.log('Status:', result1.status);
  console.log('Success:', result1.success);
  if (result1.success) {
    console.log('Response structure:', Object.keys(result1.data));
  } else {
    console.log('Error:', result1.error);
  }

  // Test 2: Get upcoming items with date range
  console.log('\nTest 2: Get upcoming items with date range');
  const result2 = await makeRequest('GET', '/payment-schedule-items/upcoming', null, {
    days: 30
  });
  console.log('Status:', result2.status);
  console.log('Success:', result2.success);

  return result1.success;
}

async function testGetPaymentScheduleItems() {
  console.log('\n=== Testing GET /payment-schedule-items ===');
  
  // Test 1: Get all payment schedule items (basic)
  console.log('Test 1: Get all payment schedule items');
  const result1 = await makeRequest('GET', '/payment-schedule-items');
  console.log('Status:', result1.status);
  console.log('Success:', result1.success);
  if (result1.success) {
    console.log('Response structure:', Object.keys(result1.data));
  } else {
    console.log('Error:', result1.error);
  }

  // Test 2: Get payment schedule items with pagination
  console.log('\nTest 2: Get payment schedule items with pagination');
  const result2 = await makeRequest('GET', '/payment-schedule-items', null, {
    page: 1,
    limit: 10
  });
  console.log('Status:', result2.status);
  console.log('Success:', result2.success);

  // Test 3: Get payment schedule items with filtering
  console.log('\nTest 3: Get payment schedule items with filtering');
  const result3 = await makeRequest('GET', '/payment-schedule-items', null, {
    status: 'pending',
    frequency: 'monthly'
  });
  console.log('Status:', result3.status);
  console.log('Success:', result3.success);

  return result1.success;
}

async function testCreatePaymentScheduleItem() {
  console.log('\n=== Testing POST /payment-schedule-items ===');
  
  const testData = generateTestData();
  
  // Test 1: Create payment schedule item with valid data
  console.log('Test 1: Create payment schedule item with valid data');
  const result1 = await makeRequest('POST', '/payment-schedule-items', testData.paymentScheduleItem);
  console.log('Status:', result1.status);
  console.log('Success:', result1.success);
  if (result1.success) {
    console.log('Created payment schedule item ID:', result1.data.id || result1.data._id);
    // Store the created ID for later tests
    testData.createdId = result1.data.id || result1.data._id;
  } else {
    console.log('Error:', result1.error);
  }

  // Test 2: Create payment schedule item with missing required fields
  console.log('\nTest 2: Create payment schedule item with missing required fields');
  const incompleteData = { title: 'Incomplete Item' };
  const result2 = await makeRequest('POST', '/payment-schedule-items', incompleteData);
  console.log('Status:', result2.status);
  console.log('Success:', result2.success);
  if (!result2.success) {
    console.log('Expected validation error:', result2.error);
  }

  return result1.success;
}

async function testGetPaymentScheduleItem() {
  console.log('\n=== Testing GET /payment-schedule-items/:id ===');
  
  const testData = generateTestData();
  
  // Test 1: Get payment schedule item by valid ID
  console.log('Test 1: Get payment schedule item by valid ID');
  const result1 = await makeRequest('GET', `/payment-schedule-items/${testData.validMongoId}`);
  console.log('Status:', result1.status);
  console.log('Success:', result1.success);
  if (result1.success) {
    console.log('Response structure:', Object.keys(result1.data));
  } else {
    console.log('Error:', result1.error);
  }

  // Test 2: Get payment schedule item by invalid ID
  console.log('\nTest 2: Get payment schedule item by invalid ID');
  const result2 = await makeRequest('GET', `/payment-schedule-items/${testData.invalidMongoId}`);
  console.log('Status:', result2.status);
  console.log('Success:', result2.success);
  if (!result2.success) {
    console.log('Expected error for invalid ID:', result2.error);
  }

  return true;
}

async function testUpdatePaymentScheduleItem() {
  console.log('\n=== Testing PUT /payment-schedule-items/:id ===');
  
  const testData = generateTestData();
  
  // Test 1: Update payment schedule item with valid data
  console.log('Test 1: Update payment schedule item with valid data');
  const result1 = await makeRequest('PUT', `/payment-schedule-items/${testData.validMongoId}`, testData.updateData);
  console.log('Status:', result1.status);
  console.log('Success:', result1.success);
  if (result1.success) {
    console.log('Response structure:', Object.keys(result1.data));
  } else {
    console.log('Error:', result1.error);
  }

  // Test 2: Update payment schedule item with invalid ID
  console.log('\nTest 2: Update payment schedule item with invalid ID');
  const result2 = await makeRequest('PUT', `/payment-schedule-items/${testData.invalidMongoId}`, testData.updateData);
  console.log('Status:', result2.status);
  console.log('Success:', result2.success);
  if (!result2.success) {
    console.log('Expected error for invalid ID:', result2.error);
  }

  return true;
}

async function testApprovePaymentScheduleItem() {
  console.log('\n=== Testing PATCH /payment-schedule-items/:id/approve ===');
  
  const testData = generateTestData();
  
  // Test 1: Approve payment schedule item
  console.log('Test 1: Approve payment schedule item');
  const result1 = await makeRequest('PATCH', `/payment-schedule-items/${testData.validMongoId}/approve`);
  console.log('Status:', result1.status);
  console.log('Success:', result1.success);
  if (result1.success) {
    console.log('Response structure:', Object.keys(result1.data));
  } else {
    console.log('Error:', result1.error);
  }

  return true;
}

async function testRetirePaymentScheduleItem() {
  console.log('\n=== Testing PATCH /payment-schedule-items/:id/retire ===');
  
  const testData = generateTestData();
  
  // Test 1: Retire payment schedule item
  console.log('Test 1: Retire payment schedule item');
  const result1 = await makeRequest('PATCH', `/payment-schedule-items/${testData.validMongoId}/retire`);
  console.log('Status:', result1.status);
  console.log('Success:', result1.success);
  if (result1.success) {
    console.log('Response structure:', Object.keys(result1.data));
  } else {
    console.log('Error:', result1.error);
  }

  return true;
}

async function testReplacePaymentScheduleItem() {
  console.log('\n=== Testing PATCH /payment-schedule-items/:id/replace ===');
  
  const testData = generateTestData();
  
  // Test 1: Replace payment schedule item
  console.log('Test 1: Replace payment schedule item');
  const result1 = await makeRequest('PATCH', `/payment-schedule-items/${testData.validMongoId}/replace`, {
    replacementData: testData.paymentScheduleItem
  });
  console.log('Status:', result1.status);
  console.log('Success:', result1.success);
  if (result1.success) {
    console.log('Response structure:', Object.keys(result1.data));
  } else {
    console.log('Error:', result1.error);
  }

  return true;
}

async function testCompletePaymentScheduleItem() {
  console.log('\n=== Testing PATCH /payment-schedule-items/:id/complete ===');
  
  const testData = generateTestData();
  
  // Test 1: Complete payment schedule item
  console.log('Test 1: Complete payment schedule item');
  const result1 = await makeRequest('PATCH', `/payment-schedule-items/${testData.validMongoId}/complete`);
  console.log('Status:', result1.status);
  console.log('Success:', result1.success);
  if (result1.success) {
    console.log('Response structure:', Object.keys(result1.data));
  } else {
    console.log('Error:', result1.error);
  }

  return true;
}

async function testCancelPaymentScheduleItem() {
  console.log('\n=== Testing PATCH /payment-schedule-items/:id/cancel ===');
  
  const testData = generateTestData();
  
  // Test 1: Cancel payment schedule item
  console.log('Test 1: Cancel payment schedule item');
  const result1 = await makeRequest('PATCH', `/payment-schedule-items/${testData.validMongoId}/cancel`);
  console.log('Status:', result1.status);
  console.log('Success:', result1.success);
  if (result1.success) {
    console.log('Response structure:', Object.keys(result1.data));
  } else {
    console.log('Error:', result1.error);
  }

  return true;
}

async function testGenerateBillingTransactions() {
  console.log('\n=== Testing POST /payment-schedule-items/generate-transactions ===');
  
  const testData = generateTestData();
  
  // Test 1: Generate billing transactions
  console.log('Test 1: Generate billing transactions');
  const result1 = await makeRequest('POST', '/payment-schedule-items/generate-transactions', testData.generateTransactionsData);
  console.log('Status:', result1.status);
  console.log('Success:', result1.success);
  if (result1.success) {
    console.log('Response structure:', Object.keys(result1.data));
  } else {
    console.log('Error:', result1.error);
  }

  // Test 2: Generate billing transactions with missing data
  console.log('\nTest 2: Generate billing transactions with missing data');
  const result2 = await makeRequest('POST', '/payment-schedule-items/generate-transactions', {});
  console.log('Status:', result2.status);
  console.log('Success:', result2.success);
  if (!result2.success) {
    console.log('Expected validation error:', result2.error);
  }

  return true;
}

async function testGenerateRecurringItems() {
  console.log('\n=== Testing POST /payment-schedule-items/:id/generate-recurring ===');
  
  const testData = generateTestData();
  
  // Test 1: Generate recurring payment schedule items
  console.log('Test 1: Generate recurring payment schedule items');
  const result1 = await makeRequest('POST', `/payment-schedule-items/${testData.validMongoId}/generate-recurring`, testData.generateRecurringData);
  console.log('Status:', result1.status);
  console.log('Success:', result1.success);
  if (result1.success) {
    console.log('Response structure:', Object.keys(result1.data));
  } else {
    console.log('Error:', result1.error);
  }

  // Test 2: Generate recurring items with invalid ID
  console.log('\nTest 2: Generate recurring items with invalid ID');
  const result2 = await makeRequest('POST', `/payment-schedule-items/${testData.invalidMongoId}/generate-recurring`, testData.generateRecurringData);
  console.log('Status:', result2.status);
  console.log('Success:', result2.success);
  if (!result2.success) {
    console.log('Expected error for invalid ID:', result2.error);
  }

  return true;
}

async function testDeletePaymentScheduleItem() {
  console.log('\n=== Testing DELETE /payment-schedule-items/:id ===');
  
  const testData = generateTestData();
  
  // Test 1: Delete payment schedule item by valid ID
  console.log('Test 1: Delete payment schedule item by valid ID');
  const result1 = await makeRequest('DELETE', `/payment-schedule-items/${testData.validMongoId}`);
  console.log('Status:', result1.status);
  console.log('Success:', result1.success);
  if (result1.success) {
    console.log('Payment schedule item deleted successfully');
  } else {
    console.log('Error:', result1.error);
  }

  // Test 2: Delete payment schedule item by invalid ID
  console.log('\nTest 2: Delete payment schedule item by invalid ID');
  const result2 = await makeRequest('DELETE', `/payment-schedule-items/${testData.invalidMongoId}`);
  console.log('Status:', result2.status);
  console.log('Success:', result2.success);
  if (!result2.success) {
    console.log('Expected error for invalid ID:', result2.error);
  }

  return true;
}

async function testErrorHandling() {
  console.log('\n=== Testing Error Handling ===');
  
  const testData = generateTestData();
  
  // Test 1: Invalid pagination parameters
  console.log('Test 1: Invalid pagination parameters');
  const result1 = await makeRequest('GET', '/payment-schedule-items', null, {
    page: -1,
    limit: 200
  });
  console.log('Status:', result1.status);
  console.log('Success:', result1.success);
  if (!result1.success) {
    console.log('Expected validation error:', result1.error);
  }

  // Test 2: Invalid amount in create request
  console.log('\nTest 2: Invalid amount in create request');
  const invalidData = { ...testData.paymentScheduleItem, amount: -100 };
  const result2 = await makeRequest('POST', '/payment-schedule-items', invalidData);
  console.log('Status:', result2.status);
  console.log('Success:', result2.success);
  if (!result2.success) {
    console.log('Expected validation error:', result2.error);
  }

  // Test 3: Invalid date format
  console.log('\nTest 3: Invalid date format');
  const invalidDateData = { ...testData.paymentScheduleItem, dueDate: 'invalid-date' };
  const result3 = await makeRequest('POST', '/payment-schedule-items', invalidDateData);
  console.log('Status:', result3.status);
  console.log('Success:', result3.success);
  if (!result3.success) {
    console.log('Expected validation error:', result3.error);
  }

  // Test 4: Invalid frequency
  console.log('\nTest 4: Invalid frequency');
  const invalidFrequencyData = { ...testData.paymentScheduleItem, frequency: 'invalid-frequency' };
  const result4 = await makeRequest('POST', '/payment-schedule-items', invalidFrequencyData);
  console.log('Status:', result4.status);
  console.log('Success:', result4.success);
  if (!result4.success) {
    console.log('Expected validation error:', result4.error);
  }

  return true;
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting Payment Schedule Item API Tests');
  console.log('='.repeat(50));
  
  try {
    // Setup
    await setupTestData();
    
    // Run all tests
    const tests = [
      testGetPaymentScheduleItemStats,
      testGetOverdueItems,
      testGetUpcomingItems,
      testGetPaymentScheduleItems,
      testCreatePaymentScheduleItem,
      testGetPaymentScheduleItem,
      testUpdatePaymentScheduleItem,
      testApprovePaymentScheduleItem,
      testRetirePaymentScheduleItem,
      testReplacePaymentScheduleItem,
      testCompletePaymentScheduleItem,
      testCancelPaymentScheduleItem,
      testGenerateBillingTransactions,
      testGenerateRecurringItems,
      testDeletePaymentScheduleItem,
      testErrorHandling
    ];
    
    let passedTests = 0;
    let totalTests = tests.length;
    
    for (const test of tests) {
      try {
        const result = await test();
        if (result) passedTests++;
      } catch (error) {
        console.error(`Test failed with error: ${error.message}`);
      }
    }
    
    // Cleanup
    await cleanupTestData();
    
    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 Test Summary');
    console.log(`✅ Passed: ${passedTests}/${totalTests}`);
    console.log(`❌ Failed: ${totalTests - passedTests}/${totalTests}`);
    console.log('🏁 Payment Schedule Item API Tests Completed');
    
  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
  }
}

// Export for use in other files
module.exports = {
  runAllTests,
  testGetPaymentScheduleItemStats,
  testGetOverdueItems,
  testGetUpcomingItems,
  testGetPaymentScheduleItems,
  testCreatePaymentScheduleItem,
  testGetPaymentScheduleItem,
  testUpdatePaymentScheduleItem,
  testApprovePaymentScheduleItem,
  testRetirePaymentScheduleItem,
  testReplacePaymentScheduleItem,
  testCompletePaymentScheduleItem,
  testCancelPaymentScheduleItem,
  testGenerateBillingTransactions,
  testGenerateRecurringItems,
  testDeletePaymentScheduleItem,
  testErrorHandling
};

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests();
}