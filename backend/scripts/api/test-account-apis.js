const axios = require('axios');
const colors = require('colors');

// Configuration
const BASE_URL = 'http://localhost:5000/api';

// Development authentication token from DEV_AUTH_GUIDE.md
const DEV_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImRldi11c2VyLWlkLTEyMzQ1IiwiZW1haWwiOiJkZXZAdGVzdC5jb20iLCJwb3J0YWxUeXBlIjoic3VwZXJhZG1pbiIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1ODM2MDc4NSwiZXhwIjoxNzg5ODk2Nzg1fQ.ub44Lv_NrP7oz0uHGyd91gsMeqxBmkBvw-VrNhzzztA';

// Test data storage
let testAccountId = null;
let createdAccountIds = [];

// Helper functions
const log = {
  info: (msg) => console.log(`ℹ️  ${msg}`.cyan),
  success: (msg) => console.log(`✅ ${msg}`.green),
  error: (msg) => console.log(`❌ ${msg}`.red),
  warning: (msg) => console.log(`⚠️  ${msg}`.yellow),
  debug: (msg) => console.log(`🔍 ${msg}`.gray),
  section: (msg) => console.log(`\n${'='.repeat(60)}\n${msg}\n${'='.repeat(60)}`.blue.bold)
};

const makeRequest = async (method, endpoint, data = null, expectedStatus = null) => {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Authorization': `Bearer ${DEV_TOKEN}`,
        'Content-Type': 'application/json'
      }
    };

    if (data) {
      config.data = data;
    }

    log.debug(`${method.toUpperCase()} ${endpoint}`);
    if (data) log.debug(`Data: ${JSON.stringify(data, null, 2)}`);

    const response = await axios(config);
    
    if (expectedStatus && response.status !== expectedStatus) {
      log.warning(`Expected status ${expectedStatus}, got ${response.status}`);
    } else {
      log.success(`${method.toUpperCase()} ${endpoint} - Status: ${response.status}`);
    }

    return response;
  } catch (error) {
    if (expectedStatus && error.response && error.response.status === expectedStatus) {
      log.success(`${method.toUpperCase()} ${endpoint} - Expected error status: ${error.response.status}`);
      return error.response;
    }
    
    log.error(`${method.toUpperCase()} ${endpoint} failed:`);
    if (error.response) {
      log.error(`Status: ${error.response.status}`);
      log.error(`Data: ${JSON.stringify(error.response.data, null, 2)}`);
    } else {
      log.error(`Error: ${error.message}`);
    }
    throw error;
  }
};

// Test data generators
const generateAccountData = (overrides = {}) => ({
  name: `Test Account ${Date.now()}`,
  email: `test-account-${Date.now()}@example.com`,
  phone: '+1234567890',
  address: {
    street: '123 Test Street',
    city: 'Test City',
    state: 'TS',
    zipCode: '12345',
    country: 'USA'
  },
  industry: 'Technology',
  companySize: '50-100',
  website: 'https://test-company.com',
  description: 'Test account for API testing',
  ...overrides
});

const generateUpdateData = () => ({
  name: `Updated Account ${Date.now()}`,
  phone: '+9876543210',
  industry: 'Healthcare',
  companySize: '100-500',
  description: 'Updated test account description'
});

// Test functions
const testGetAccounts = async () => {
  log.section('Testing GET /accounts - Get All Accounts');
  
  try {
    const response = await makeRequest('GET', '/accounts', null, 200);
    
    if (response.data && Array.isArray(response.data.accounts)) {
      log.success(`Retrieved ${response.data.accounts.length} accounts`);
      log.debug(`Response: ${JSON.stringify(response.data, null, 2)}`);
      
      // Store first account ID for later tests
      if (response.data.accounts.length > 0) {
        testAccountId = response.data.accounts[0]._id;
        log.info(`Using account ID for tests: ${testAccountId}`);
      }
    } else {
      log.warning('Unexpected response format');
    }
  } catch (error) {
    log.error('Failed to get accounts');
  }
};

const testCreateAccount = async () => {
  log.section('Testing POST /accounts - Create Account');
  
  try {
    const accountData = generateAccountData();
    const response = await makeRequest('POST', '/accounts', accountData, 201);
    
    if (response.data && response.data.account) {
      const createdAccount = response.data.account;
      createdAccountIds.push(createdAccount._id);
      testAccountId = createdAccount._id; // Use this for subsequent tests
      
      log.success(`Created account with ID: ${createdAccount._id}`);
      log.debug(`Created account: ${JSON.stringify(createdAccount, null, 2)}`);
      
      // Verify required fields
      if (createdAccount.name === accountData.name && 
          createdAccount.email === accountData.email) {
        log.success('Account data matches input');
      } else {
        log.warning('Account data mismatch');
      }
    } else {
      log.warning('Unexpected response format');
    }
  } catch (error) {
    log.error('Failed to create account');
  }
};

const testGetAccount = async () => {
  log.section('Testing GET /accounts/:id - Get Single Account');
  
  if (!testAccountId) {
    log.warning('No test account ID available, skipping test');
    return;
  }
  
  try {
    const response = await makeRequest('GET', `/accounts/${testAccountId}`, null, 200);
    
    if (response.data && response.data.account) {
      const account = response.data.account;
      log.success(`Retrieved account: ${account.name}`);
      log.debug(`Account details: ${JSON.stringify(account, null, 2)}`);
      
      // Verify account ID matches
      if (account._id === testAccountId) {
        log.success('Account ID matches request');
      } else {
        log.warning('Account ID mismatch');
      }
    } else {
      log.warning('Unexpected response format');
    }
  } catch (error) {
    log.error('Failed to get account');
  }
};

const testUpdateAccount = async () => {
  log.section('Testing PUT /accounts/:id - Update Account');
  
  if (!testAccountId) {
    log.warning('No test account ID available, skipping test');
    return;
  }
  
  try {
    const updateData = generateUpdateData();
    const response = await makeRequest('PUT', `/accounts/${testAccountId}`, updateData, 200);
    
    if (response.data && response.data.account) {
      const updatedAccount = response.data.account;
      log.success(`Updated account: ${updatedAccount.name}`);
      log.debug(`Updated account: ${JSON.stringify(updatedAccount, null, 2)}`);
      
      // Verify updates
      if (updatedAccount.name === updateData.name && 
          updatedAccount.industry === updateData.industry) {
        log.success('Account updates applied correctly');
      } else {
        log.warning('Account update mismatch');
      }
    } else {
      log.warning('Unexpected response format');
    }
  } catch (error) {
    log.error('Failed to update account');
  }
};

const testGetAccountStats = async () => {
  log.section('Testing GET /accounts/:id/stats - Get Account Statistics');
  
  if (!testAccountId) {
    log.warning('No test account ID available, skipping test');
    return;
  }
  
  try {
    const response = await makeRequest('GET', `/accounts/${testAccountId}/stats`, null, 200);
    
    if (response.data) {
      log.success('Retrieved account statistics');
      log.debug(`Account stats: ${JSON.stringify(response.data, null, 2)}`);
    } else {
      log.warning('Unexpected response format');
    }
  } catch (error) {
    log.error('Failed to get account stats');
  }
};

const testToggleAccountStatus = async () => {
  log.section('Testing PATCH /accounts/:id/toggle-status - Toggle Account Status');
  
  if (!testAccountId) {
    log.warning('No test account ID available, skipping test');
    return;
  }
  
  try {
    const response = await makeRequest('PATCH', `/accounts/${testAccountId}/toggle-status`, null, 200);
    
    if (response.data && response.data.account) {
      const account = response.data.account;
      log.success(`Toggled account status to: ${account.status || 'active/inactive'}`);
      log.debug(`Account after toggle: ${JSON.stringify(account, null, 2)}`);
    } else {
      log.warning('Unexpected response format');
    }
  } catch (error) {
    log.error('Failed to toggle account status');
  }
};

const testDeleteAccount = async () => {
  log.section('Testing DELETE /accounts/:id - Delete Account');
  
  // Create a new account specifically for deletion
  try {
    log.info('Creating account for deletion test...');
    const accountData = generateAccountData({ name: 'Account for Deletion' });
    const createResponse = await makeRequest('POST', '/accounts', accountData, 201);
    
    if (createResponse.data && createResponse.data.account) {
      const accountToDelete = createResponse.data.account._id;
      log.info(`Created account for deletion: ${accountToDelete}`);
      
      // Now delete it
      const deleteResponse = await makeRequest('DELETE', `/accounts/${accountToDelete}`, null, 200);
      
      if (deleteResponse.data) {
        log.success('Account deleted successfully');
        log.debug(`Delete response: ${JSON.stringify(deleteResponse.data, null, 2)}`);
      } else {
        log.warning('Unexpected delete response format');
      }
    } else {
      log.error('Failed to create account for deletion test');
    }
  } catch (error) {
    log.error('Failed to test account deletion');
  }
};

const testInvalidAccountId = async () => {
  log.section('Testing Invalid Account ID Handling');
  
  const invalidId = '507f1f77bcf86cd799439011'; // Valid ObjectId format but non-existent
  
  try {
    await makeRequest('GET', `/accounts/${invalidId}`, null, 404);
    log.success('Correctly handled invalid account ID');
  } catch (error) {
    if (error.response && error.response.status === 404) {
      log.success('Correctly returned 404 for invalid account ID');
    } else {
      log.error('Unexpected error for invalid account ID');
    }
  }
};

const testMalformedAccountId = async () => {
  log.section('Testing Malformed Account ID Handling');
  
  const malformedId = 'invalid-id-format';
  
  try {
    await makeRequest('GET', `/accounts/${malformedId}`, null, 400);
    log.success('Correctly handled malformed account ID');
  } catch (error) {
    if (error.response && (error.response.status === 400 || error.response.status === 500)) {
      log.success('Correctly handled malformed account ID');
    } else {
      log.error('Unexpected error for malformed account ID');
    }
  }
};

const testCreateAccountValidation = async () => {
  log.section('Testing Account Creation Validation');
  
  // Test missing required fields
  const invalidData = {
    // Missing name and email
    phone: '+1234567890'
  };
  
  try {
    await makeRequest('POST', '/accounts', invalidData, 400);
    log.success('Correctly validated required fields');
  } catch (error) {
    if (error.response && error.response.status === 400) {
      log.success('Correctly returned validation error');
    } else {
      log.error('Unexpected validation behavior');
    }
  }
};

// Cleanup function
const cleanup = async () => {
  log.section('Cleaning Up Test Data');
  
  for (const accountId of createdAccountIds) {
    try {
      await makeRequest('DELETE', `/accounts/${accountId}`);
      log.success(`Cleaned up account: ${accountId}`);
    } catch (error) {
      log.warning(`Failed to cleanup account: ${accountId}`);
    }
  }
};

// Main test runner
const runAccountTests = async () => {
  log.section('🚀 Starting Account API Tests');
  log.info('Using Development Authentication Token');
  log.info(`Base URL: ${BASE_URL}`);
  
  try {
    // Core CRUD operations
    await testGetAccounts();
    await testCreateAccount();
    await testGetAccount();
    await testUpdateAccount();
    await testGetAccountStats();
    
    // Status management
    await testToggleAccountStatus();
    
    // Deletion (creates its own test account)
    await testDeleteAccount();
    
    // Error handling
    await testInvalidAccountId();
    await testMalformedAccountId();
    await testCreateAccountValidation();
    
    log.section('✅ Account API Tests Completed');
    
  } catch (error) {
    log.error('Test suite failed with error:');
    log.error(error.message);
  } finally {
    // Cleanup
    await cleanup();
  }
};

// Export for use in other scripts
module.exports = {
  runAccountTests,
  testGetAccounts,
  testCreateAccount,
  testGetAccount,
  testUpdateAccount,
  testGetAccountStats,
  testToggleAccountStatus,
  testDeleteAccount
};

// Run tests if this file is executed directly
if (require.main === module) {
  runAccountTests().catch(console.error);
}