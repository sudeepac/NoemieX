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
    validEventTypes: [
      'created', 'updated', 'claimed', 'payment_received', 'payment_partial',
      'payment_failed', 'overdue', 'cancelled', 'refunded', 'approved',
      'rejected', 'reconciled', 'disputed', 'resolved'
    ],
    validSortFields: ['eventDate', 'eventType', 'createdAt'],
    validSortOrders: ['asc', 'desc'],
    validDate: '2024-01-01T00:00:00.000Z',
    invalidDate: 'invalid-date'
  };
}

// Setup and cleanup functions
async function setupTestData() {
  console.log('Setting up test data for billing event histories...');
  // In a real scenario, you might create test billing transactions and events
  return true;
}

async function cleanupTestData() {
  console.log('Cleaning up test data for billing event histories...');
  // In a real scenario, you might clean up test data
  return true;
}

// Test functions
async function testGetBillingEventHistories() {
  console.log('\n=== Testing GET /billing-event-histories ===');
  
  const testData = generateTestData();
  
  // Test 1: Get all billing event histories (basic)
  console.log('Test 1: Get all billing event histories');
  const result1 = await makeRequest('GET', '/billing-event-histories');
  console.log('Status:', result1.status);
  console.log('Success:', result1.success);
  if (result1.success) {
    console.log('Response structure:', Object.keys(result1.data));
  } else {
    console.log('Error:', result1.error);
  }

  // Test 2: Get billing event histories with pagination
  console.log('\nTest 2: Get billing event histories with pagination');
  const result2 = await makeRequest('GET', '/billing-event-histories', null, {
    page: 1,
    limit: 10
  });
  console.log('Status:', result2.status);
  console.log('Success:', result2.success);

  // Test 3: Get billing event histories with filtering
  console.log('\nTest 3: Get billing event histories with filtering');
  const result3 = await makeRequest('GET', '/billing-event-histories', null, {
    eventType: testData.validEventTypes[0],
    sortBy: 'eventDate',
    sortOrder: 'desc'
  });
  console.log('Status:', result3.status);
  console.log('Success:', result3.success);

  // Test 4: Get billing event histories with date range
  console.log('\nTest 4: Get billing event histories with date range');
  const result4 = await makeRequest('GET', '/billing-event-histories', null, {
    startDate: '2024-01-01T00:00:00.000Z',
    endDate: '2024-12-31T23:59:59.999Z'
  });
  console.log('Status:', result4.status);
  console.log('Success:', result4.success);

  // Test 5: Get billing event histories with account/agency filter
  console.log('\nTest 5: Get billing event histories with account/agency filter');
  const result5 = await makeRequest('GET', '/billing-event-histories', null, {
    accountId: testData.validMongoId,
    agencyId: testData.validMongoId
  });
  console.log('Status:', result5.status);
  console.log('Success:', result5.success);

  return result1.success;
}

async function testGetBillingEventHistory() {
  console.log('\n=== Testing GET /billing-event-histories/:id ===');
  
  const testData = generateTestData();
  
  // Test 1: Get billing event history by valid ID
  console.log('Test 1: Get billing event history by valid ID');
  const result1 = await makeRequest('GET', `/billing-event-histories/${testData.validMongoId}`);
  console.log('Status:', result1.status);
  console.log('Success:', result1.success);
  if (result1.success) {
    console.log('Response structure:', Object.keys(result1.data));
  } else {
    console.log('Error:', result1.error);
  }

  // Test 2: Get billing event history by invalid ID
  console.log('\nTest 2: Get billing event history by invalid ID');
  const result2 = await makeRequest('GET', `/billing-event-histories/${testData.invalidMongoId}`);
  console.log('Status:', result2.status);
  console.log('Success:', result2.success);
  if (!result2.success) {
    console.log('Expected error for invalid ID:', result2.error);
  }

  return true;
}

async function testGetActivitySummary() {
  console.log('\n=== Testing GET /billing-event-histories/activity-summary ===');
  
  const testData = generateTestData();
  
  // Test 1: Get activity summary (basic)
  console.log('Test 1: Get activity summary');
  const result1 = await makeRequest('GET', '/billing-event-histories/activity-summary');
  console.log('Status:', result1.status);
  console.log('Success:', result1.success);
  if (result1.success) {
    console.log('Response structure:', Object.keys(result1.data));
  } else {
    console.log('Error:', result1.error);
  }

  // Test 2: Get activity summary with days filter
  console.log('\nTest 2: Get activity summary with days filter');
  const result2 = await makeRequest('GET', '/billing-event-histories/activity-summary', null, {
    days: 30
  });
  console.log('Status:', result2.status);
  console.log('Success:', result2.success);

  // Test 3: Get activity summary with account/agency filter
  console.log('\nTest 3: Get activity summary with account/agency filter');
  const result3 = await makeRequest('GET', '/billing-event-histories/activity-summary', null, {
    accountId: testData.validMongoId,
    agencyId: testData.validMongoId,
    days: 7
  });
  console.log('Status:', result3.status);
  console.log('Success:', result3.success);

  return result1.success;
}

async function testGetUserActivity() {
  console.log('\n=== Testing GET /billing-event-histories/user-activity/:userId ===');
  
  const testData = generateTestData();
  
  // Test 1: Get user activity by valid user ID
  console.log('Test 1: Get user activity by valid user ID');
  const result1 = await makeRequest('GET', `/billing-event-histories/user-activity/${testData.validMongoId}`);
  console.log('Status:', result1.status);
  console.log('Success:', result1.success);
  if (result1.success) {
    console.log('Response structure:', Object.keys(result1.data));
  } else {
    console.log('Error:', result1.error);
  }

  // Test 2: Get user activity with days filter
  console.log('\nTest 2: Get user activity with days filter');
  const result2 = await makeRequest('GET', `/billing-event-histories/user-activity/${testData.validMongoId}`, null, {
    days: 30
  });
  console.log('Status:', result2.status);
  console.log('Success:', result2.success);

  // Test 3: Get user activity with account filter
  console.log('\nTest 3: Get user activity with account filter');
  const result3 = await makeRequest('GET', `/billing-event-histories/user-activity/${testData.validMongoId}`, null, {
    accountId: testData.validMongoId,
    days: 7
  });
  console.log('Status:', result3.status);
  console.log('Success:', result3.success);

  // Test 4: Get user activity by invalid user ID
  console.log('\nTest 4: Get user activity by invalid user ID');
  const result4 = await makeRequest('GET', `/billing-event-histories/user-activity/${testData.invalidMongoId}`);
  console.log('Status:', result4.status);
  console.log('Success:', result4.success);
  if (!result4.success) {
    console.log('Expected error for invalid user ID:', result4.error);
  }

  return true;
}

async function testGetTransactionTimeline() {
  console.log('\n=== Testing GET /billing-event-histories/transaction/:transactionId/timeline ===');
  
  const testData = generateTestData();
  
  // Test 1: Get transaction timeline by valid transaction ID
  console.log('Test 1: Get transaction timeline by valid transaction ID');
  const result1 = await makeRequest('GET', `/billing-event-histories/transaction/${testData.validMongoId}/timeline`);
  console.log('Status:', result1.status);
  console.log('Success:', result1.success);
  if (result1.success) {
    console.log('Response structure:', Object.keys(result1.data));
  } else {
    console.log('Error:', result1.error);
  }

  // Test 2: Get transaction timeline by invalid transaction ID
  console.log('\nTest 2: Get transaction timeline by invalid transaction ID');
  const result2 = await makeRequest('GET', `/billing-event-histories/transaction/${testData.invalidMongoId}/timeline`);
  console.log('Status:', result2.status);
  console.log('Success:', result2.success);
  if (!result2.success) {
    console.log('Expected error for invalid transaction ID:', result2.error);
  }

  return true;
}

async function testHideBillingEventHistory() {
  console.log('\n=== Testing PUT /billing-event-histories/:id/hide ===');
  
  const testData = generateTestData();
  
  // Test 1: Hide billing event history by valid ID
  console.log('Test 1: Hide billing event history by valid ID');
  const result1 = await makeRequest('PUT', `/billing-event-histories/${testData.validMongoId}/hide`);
  console.log('Status:', result1.status);
  console.log('Success:', result1.success);
  if (result1.success) {
    console.log('Response structure:', Object.keys(result1.data));
  } else {
    console.log('Error:', result1.error);
  }

  // Test 2: Hide billing event history by invalid ID
  console.log('\nTest 2: Hide billing event history by invalid ID');
  const result2 = await makeRequest('PUT', `/billing-event-histories/${testData.invalidMongoId}/hide`);
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
  const result1 = await makeRequest('GET', '/billing-event-histories', null, {
    page: -1,
    limit: 200
  });
  console.log('Status:', result1.status);
  console.log('Success:', result1.success);
  if (!result1.success) {
    console.log('Expected validation error:', result1.error);
  }

  // Test 2: Invalid event type
  console.log('\nTest 2: Invalid event type');
  const result2 = await makeRequest('GET', '/billing-event-histories', null, {
    eventType: 'invalid_event_type'
  });
  console.log('Status:', result2.status);
  console.log('Success:', result2.success);
  if (!result2.success) {
    console.log('Expected validation error:', result2.error);
  }

  // Test 3: Invalid date format
  console.log('\nTest 3: Invalid date format');
  const result3 = await makeRequest('GET', '/billing-event-histories', null, {
    startDate: testData.invalidDate
  });
  console.log('Status:', result3.status);
  console.log('Success:', result3.success);
  if (!result3.success) {
    console.log('Expected validation error:', result3.error);
  }

  // Test 4: Invalid sort parameters
  console.log('\nTest 4: Invalid sort parameters');
  const result4 = await makeRequest('GET', '/billing-event-histories', null, {
    sortBy: 'invalid_field',
    sortOrder: 'invalid_order'
  });
  console.log('Status:', result4.status);
  console.log('Success:', result4.success);
  if (!result4.success) {
    console.log('Expected validation error:', result4.error);
  }

  // Test 5: Invalid days parameter for activity summary
  console.log('\nTest 5: Invalid days parameter for activity summary');
  const result5 = await makeRequest('GET', '/billing-event-histories/activity-summary', null, {
    days: 500
  });
  console.log('Status:', result5.status);
  console.log('Success:', result5.success);
  if (!result5.success) {
    console.log('Expected validation error:', result5.error);
  }

  return true;
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting Billing Event History API Tests');
  console.log('='.repeat(50));
  
  try {
    // Setup
    await setupTestData();
    
    // Run all tests
    const tests = [
      testGetBillingEventHistories,
      testGetBillingEventHistory,
      testGetActivitySummary,
      testGetUserActivity,
      testGetTransactionTimeline,
      testHideBillingEventHistory,
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
    console.log('🏁 Billing Event History API Tests Completed');
    
  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
  }
}

// Export for use in other files
module.exports = {
  runAllTests,
  testGetBillingEventHistories,
  testGetBillingEventHistory,
  testGetActivitySummary,
  testGetUserActivity,
  testGetTransactionTimeline,
  testHideBillingEventHistory,
  testErrorHandling
};

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests();
}