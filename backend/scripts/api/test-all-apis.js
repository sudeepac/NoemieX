/**
 * Comprehensive API Testing Script
 * 
 * This script tests all major backend APIs using the fixed DEV_STATIC_TOKEN
 * Run with: node scripts/api/test-all-apis.js
 */

const { api, logTestResult, runTestSuite } = require('./api-test-helper');

// Authentication Tests
async function testAuthEndpoints() {
  const tests = [
    async () => {
      const response = await api.get('/auth/me');
      logTestResult('GET /auth/me', response);
      return response;
    },
    
    async () => {
      const response = await api.post('/auth/logout');
      logTestResult('POST /auth/logout', response);
      return response;
    }
  ];
  
  return await runTestSuite('Authentication APIs', tests);
}

// User Management Tests
async function testUserEndpoints() {
  const tests = [
    async () => {
      const response = await api.get('/users');
      logTestResult('GET /users', response);
      return response;
    },
    
    async () => {
      const response = await api.get('/users/profile');
      logTestResult('GET /users/profile', response);
      return response;
    }
  ];
  
  return await runTestSuite('User Management APIs', tests);
}

// Account Management Tests
async function testAccountEndpoints() {
  const tests = [
    async () => {
      const response = await api.get('/accounts');
      logTestResult('GET /accounts', response);
      return response;
    },
    
    async () => {
      const response = await api.get('/accounts/current');
      logTestResult('GET /accounts/current', response);
      return response;
    }
  ];
  
  return await runTestSuite('Account Management APIs', tests);
}

// Agency Management Tests
async function testAgencyEndpoints() {
  const tests = [
    async () => {
      const response = await api.get('/agencies');
      logTestResult('GET /agencies', response);
      return response;
    },
    
    async () => {
      const response = await api.get('/agencies/current');
      logTestResult('GET /agencies/current', response);
      return response;
    }
  ];
  
  return await runTestSuite('Agency Management APIs', tests);
}

// Offer Letter Tests
async function testOfferLetterEndpoints() {
  const tests = [
    async () => {
      const response = await api.get('/offer-letters');
      logTestResult('GET /offer-letters', response);
      return response;
    },
    
    async () => {
      const response = await api.post('/offer-letters', {
        title: 'Test Offer Letter',
        description: 'This is a test offer letter created by API testing script',
        amount: 1000,
        currency: 'USD'
      });
      logTestResult('POST /offer-letters', response);
      return response;
    }
  ];
  
  return await runTestSuite('Offer Letter APIs', tests);
}

// Payment Schedule Tests
async function testPaymentScheduleEndpoints() {
  const tests = [
    async () => {
      const response = await api.get('/payment-schedule-items');
      logTestResult('GET /payment-schedule-items', response);
      return response;
    }
  ];
  
  return await runTestSuite('Payment Schedule APIs', tests);
}

// Billing Tests
async function testBillingEndpoints() {
  const tests = [
    async () => {
      const response = await api.get('/billing-transactions');
      logTestResult('GET /billing-transactions', response);
      return response;
    },
    
    async () => {
      const response = await api.get('/billing-event-history');
      logTestResult('GET /billing-event-history', response);
      return response;
    }
  ];
  
  return await runTestSuite('Billing APIs', tests);
}

// Security Tests (testing without authentication)
async function testSecurityEndpoints() {
  const tests = [
    async () => {
      const response = await api.get('/auth/me', {}, false); // No auth
      logTestResult('GET /auth/me (no auth)', response);
      return { success: !response.success }; // Should fail
    },
    
    async () => {
      const response = await api.get('/users', {}, false); // No auth
      logTestResult('GET /users (no auth)', response);
      return { success: !response.success }; // Should fail
    }
  ];
  
  return await runTestSuite('Security Tests (should fail)', tests);
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting Comprehensive API Testing');
  console.log('=====================================');
  console.log('📋 Using fixed DEV_STATIC_TOKEN for authentication');
  console.log('🎯 Testing all major backend endpoints\n');
  
  const results = [];
  
  try {
    results.push(await testAuthEndpoints());
    results.push(await testUserEndpoints());
    results.push(await testAccountEndpoints());
    results.push(await testAgencyEndpoints());
    results.push(await testOfferLetterEndpoints());
    results.push(await testPaymentScheduleEndpoints());
    results.push(await testBillingEndpoints());
    results.push(await testSecurityEndpoints());
    
    // Summary
    const totalPassed = results.reduce((sum, result) => sum + result.passed, 0);
    const totalFailed = results.reduce((sum, result) => sum + result.failed, 0);
    
    console.log('\n🏁 FINAL RESULTS');
    console.log('================');
    console.log(`✅ Total Passed: ${totalPassed}`);
    console.log(`❌ Total Failed: ${totalFailed}`);
    console.log(`📊 Success Rate: ${((totalPassed / (totalPassed + totalFailed)) * 100).toFixed(1)}%`);
    
    if (totalFailed === 0) {
      console.log('\n🎉 All tests passed! Your API is working perfectly with the fixed DEV_STATIC_TOKEN!');
    } else {
      console.log('\n⚠️  Some tests failed. Check the logs above for details.');
    }
    
  } catch (error) {
    console.error('❌ Test suite failed with error:', error.message);
    process.exit(1);
  }
}

// Run tests if this script is executed directly
if (require.main === module) {
  runAllTests();
}

module.exports = {
  runAllTests,
  testAuthEndpoints,
  testUserEndpoints,
  testAccountEndpoints,
  testAgencyEndpoints,
  testOfferLetterEndpoints,
  testPaymentScheduleEndpoints,
  testBillingEndpoints,
  testSecurityEndpoints
};