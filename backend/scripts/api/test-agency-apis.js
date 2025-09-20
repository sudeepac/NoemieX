const axios = require('axios');
const colors = require('colors');

// Configuration
const BASE_URL = 'http://localhost:5000/api';

// Development authentication token from DEV_AUTH_GUIDE.md
const DEV_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImRldi11c2VyLWlkLTEyMzQ1IiwiZW1haWwiOiJkZXZAdGVzdC5jb20iLCJwb3J0YWxUeXBlIjoic3VwZXJhZG1pbiIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1ODM2MDc4NSwiZXhwIjoxNzg5ODk2Nzg1fQ.ub44Lv_NrP7oz0uHGyd91gsMeqxBmkBvw-VrNhzzztA';

// Test data storage
let testAgencyId = null;
let testAccountId = null;
let createdAgencyIds = [];

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
const generateAgencyData = (accountId, overrides = {}) => ({
  name: `Test Agency ${Date.now()}`,
  email: `test-agency-${Date.now()}@example.com`,
  phone: '+1234567890',
  address: {
    street: '456 Agency Street',
    city: 'Agency City',
    state: 'AS',
    zipCode: '54321',
    country: 'USA'
  },
  accountId: accountId,
  agencyType: 'full-service',
  specialties: ['digital-marketing', 'content-creation'],
  website: 'https://test-agency.com',
  description: 'Test agency for API testing',
  contactPerson: {
    name: 'John Doe',
    email: 'john@test-agency.com',
    phone: '+1234567890'
  },
  ...overrides
});

const generateUpdateData = () => ({
  name: `Updated Agency ${Date.now()}`,
  phone: '+9876543210',
  agencyType: 'creative',
  specialties: ['branding', 'web-design'],
  description: 'Updated test agency description'
});

// Setup function to get test account
const setupTestData = async () => {
  log.section('Setting Up Test Data');
  
  try {
    // Get accounts to use for agency creation
    const accountsResponse = await makeRequest('GET', '/accounts');
    if (accountsResponse.data && accountsResponse.data.accounts && accountsResponse.data.accounts.length > 0) {
      testAccountId = accountsResponse.data.accounts[0]._id;
      log.success(`Using account ID: ${testAccountId}`);
    } else {
      // Create a test account if none exist
      const accountData = {
        name: `Test Account for Agencies ${Date.now()}`,
        email: `test-account-${Date.now()}@example.com`,
        phone: '+1234567890',
        industry: 'Technology'
      };
      const createAccountResponse = await makeRequest('POST', '/accounts', accountData, 201);
      if (createAccountResponse.data && createAccountResponse.data.account) {
        testAccountId = createAccountResponse.data.account._id;
        log.success(`Created test account with ID: ${testAccountId}`);
      } else {
        throw new Error('Failed to create test account');
      }
    }
  } catch (error) {
    log.error('Failed to setup test data');
    throw error;
  }
};

// Test functions
const testGetAgencies = async () => {
  log.section('Testing GET /agencies - Get All Agencies');
  
  try {
    const response = await makeRequest('GET', '/agencies', null, 200);
    
    if (response.data && Array.isArray(response.data.agencies)) {
      log.success(`Retrieved ${response.data.agencies.length} agencies`);
      log.debug(`Response: ${JSON.stringify(response.data, null, 2)}`);
      
      // Store first agency ID for later tests
      if (response.data.agencies.length > 0) {
        testAgencyId = response.data.agencies[0]._id;
        log.info(`Using agency ID for tests: ${testAgencyId}`);
      }
    } else {
      log.warning('Unexpected response format');
    }
  } catch (error) {
    log.error('Failed to get agencies');
  }
};

const testCreateAgency = async () => {
  log.section('Testing POST /agencies - Create Agency');
  
  if (!testAccountId) {
    log.warning('No test account ID available, skipping agency creation');
    return;
  }
  
  try {
    const agencyData = generateAgencyData(testAccountId);
    const response = await makeRequest('POST', '/agencies', agencyData, 201);
    
    if (response.data && response.data.agency) {
      const createdAgency = response.data.agency;
      createdAgencyIds.push(createdAgency._id);
      testAgencyId = createdAgency._id; // Use this for subsequent tests
      
      log.success(`Created agency with ID: ${createdAgency._id}`);
      log.debug(`Created agency: ${JSON.stringify(createdAgency, null, 2)}`);
      
      // Verify required fields
      if (createdAgency.name === agencyData.name && 
          createdAgency.email === agencyData.email &&
          createdAgency.accountId === agencyData.accountId) {
        log.success('Agency data matches input');
      } else {
        log.warning('Agency data mismatch');
      }
    } else {
      log.warning('Unexpected response format');
    }
  } catch (error) {
    log.error('Failed to create agency');
  }
};

const testGetAgency = async () => {
  log.section('Testing GET /agencies/:id - Get Single Agency');
  
  if (!testAgencyId) {
    log.warning('No test agency ID available, skipping test');
    return;
  }
  
  try {
    const response = await makeRequest('GET', `/agencies/${testAgencyId}`, null, 200);
    
    if (response.data && response.data.agency) {
      const agency = response.data.agency;
      log.success(`Retrieved agency: ${agency.name}`);
      log.debug(`Agency details: ${JSON.stringify(agency, null, 2)}`);
      
      // Verify agency ID matches
      if (agency._id === testAgencyId) {
        log.success('Agency ID matches request');
      } else {
        log.warning('Agency ID mismatch');
      }
    } else {
      log.warning('Unexpected response format');
    }
  } catch (error) {
    log.error('Failed to get agency');
  }
};

const testUpdateAgency = async () => {
  log.section('Testing PUT /agencies/:id - Update Agency');
  
  if (!testAgencyId) {
    log.warning('No test agency ID available, skipping test');
    return;
  }
  
  try {
    const updateData = generateUpdateData();
    const response = await makeRequest('PUT', `/agencies/${testAgencyId}`, updateData, 200);
    
    if (response.data && response.data.agency) {
      const updatedAgency = response.data.agency;
      log.success(`Updated agency: ${updatedAgency.name}`);
      log.debug(`Updated agency: ${JSON.stringify(updatedAgency, null, 2)}`);
      
      // Verify updates
      if (updatedAgency.name === updateData.name && 
          updatedAgency.agencyType === updateData.agencyType) {
        log.success('Agency updates applied correctly');
      } else {
        log.warning('Agency update mismatch');
      }
    } else {
      log.warning('Unexpected response format');
    }
  } catch (error) {
    log.error('Failed to update agency');
  }
};

const testGetAgencyStats = async () => {
  log.section('Testing GET /agencies/:id/stats - Get Agency Statistics');
  
  if (!testAgencyId) {
    log.warning('No test agency ID available, skipping test');
    return;
  }
  
  try {
    const response = await makeRequest('GET', `/agencies/${testAgencyId}/stats`, null, 200);
    
    if (response.data) {
      log.success('Retrieved agency statistics');
      log.debug(`Agency stats: ${JSON.stringify(response.data, null, 2)}`);
    } else {
      log.warning('Unexpected response format');
    }
  } catch (error) {
    log.error('Failed to get agency stats');
  }
};

const testToggleAgencyStatus = async () => {
  log.section('Testing PATCH /agencies/:id/toggle-status - Toggle Agency Status');
  
  if (!testAgencyId) {
    log.warning('No test agency ID available, skipping test');
    return;
  }
  
  try {
    const response = await makeRequest('PATCH', `/agencies/${testAgencyId}/toggle-status`, null, 200);
    
    if (response.data && response.data.agency) {
      const agency = response.data.agency;
      log.success(`Toggled agency status to: ${agency.status || 'active/inactive'}`);
      log.debug(`Agency after toggle: ${JSON.stringify(agency, null, 2)}`);
    } else {
      log.warning('Unexpected response format');
    }
  } catch (error) {
    log.error('Failed to toggle agency status');
  }
};

const testDeleteAgency = async () => {
  log.section('Testing DELETE /agencies/:id - Delete Agency');
  
  if (!testAccountId) {
    log.warning('No test account ID available, skipping delete test');
    return;
  }
  
  // Create a new agency specifically for deletion
  try {
    log.info('Creating agency for deletion test...');
    const agencyData = generateAgencyData(testAccountId, { name: 'Agency for Deletion' });
    const createResponse = await makeRequest('POST', '/agencies', agencyData, 201);
    
    if (createResponse.data && createResponse.data.agency) {
      const agencyToDelete = createResponse.data.agency._id;
      log.info(`Created agency for deletion: ${agencyToDelete}`);
      
      // Now delete it
      const deleteResponse = await makeRequest('DELETE', `/agencies/${agencyToDelete}`, null, 200);
      
      if (deleteResponse.data) {
        log.success('Agency deleted successfully');
        log.debug(`Delete response: ${JSON.stringify(deleteResponse.data, null, 2)}`);
      } else {
        log.warning('Unexpected delete response format');
      }
    } else {
      log.error('Failed to create agency for deletion test');
    }
  } catch (error) {
    log.error('Failed to test agency deletion');
  }
};

const testInvalidAgencyId = async () => {
  log.section('Testing Invalid Agency ID Handling');
  
  const invalidId = '507f1f77bcf86cd799439011'; // Valid ObjectId format but non-existent
  
  try {
    await makeRequest('GET', `/agencies/${invalidId}`, null, 404);
    log.success('Correctly handled invalid agency ID');
  } catch (error) {
    if (error.response && error.response.status === 404) {
      log.success('Correctly returned 404 for invalid agency ID');
    } else {
      log.error('Unexpected error for invalid agency ID');
    }
  }
};

const testMalformedAgencyId = async () => {
  log.section('Testing Malformed Agency ID Handling');
  
  const malformedId = 'invalid-id-format';
  
  try {
    await makeRequest('GET', `/agencies/${malformedId}`, null, 400);
    log.success('Correctly handled malformed agency ID');
  } catch (error) {
    if (error.response && (error.response.status === 400 || error.response.status === 500)) {
      log.success('Correctly handled malformed agency ID');
    } else {
      log.error('Unexpected error for malformed agency ID');
    }
  }
};

const testCreateAgencyValidation = async () => {
  log.section('Testing Agency Creation Validation');
  
  // Test missing required fields
  const invalidData = {
    // Missing name, email, and accountId
    phone: '+1234567890'
  };
  
  try {
    await makeRequest('POST', '/agencies', invalidData, 400);
    log.success('Correctly validated required fields');
  } catch (error) {
    if (error.response && error.response.status === 400) {
      log.success('Correctly returned validation error');
    } else {
      log.error('Unexpected validation behavior');
    }
  }
};

const testCreateAgencyWithInvalidAccount = async () => {
  log.section('Testing Agency Creation with Invalid Account ID');
  
  const invalidAccountId = '507f1f77bcf86cd799439011';
  const agencyData = generateAgencyData(invalidAccountId);
  
  try {
    await makeRequest('POST', '/agencies', agencyData, 400);
    log.success('Correctly handled invalid account ID');
  } catch (error) {
    if (error.response && (error.response.status === 400 || error.response.status === 404)) {
      log.success('Correctly returned error for invalid account ID');
    } else {
      log.error('Unexpected error for invalid account ID');
    }
  }
};

// Cleanup function
const cleanup = async () => {
  log.section('Cleaning Up Test Data');
  
  for (const agencyId of createdAgencyIds) {
    try {
      await makeRequest('DELETE', `/agencies/${agencyId}`);
      log.success(`Cleaned up agency: ${agencyId}`);
    } catch (error) {
      log.warning(`Failed to cleanup agency: ${agencyId}`);
    }
  }
};

// Main test runner
const runAgencyTests = async () => {
  log.section('🚀 Starting Agency API Tests');
  log.info('Using Development Authentication Token');
  log.info(`Base URL: ${BASE_URL}`);
  
  try {
    // Setup test data
    await setupTestData();
    
    // Core CRUD operations
    await testGetAgencies();
    await testCreateAgency();
    await testGetAgency();
    await testUpdateAgency();
    await testGetAgencyStats();
    
    // Status management
    await testToggleAgencyStatus();
    
    // Deletion (creates its own test agency)
    await testDeleteAgency();
    
    // Error handling
    await testInvalidAgencyId();
    await testMalformedAgencyId();
    await testCreateAgencyValidation();
    await testCreateAgencyWithInvalidAccount();
    
    log.section('✅ Agency API Tests Completed');
    
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
  runAgencyTests,
  testGetAgencies,
  testCreateAgency,
  testGetAgency,
  testUpdateAgency,
  testGetAgencyStats,
  testToggleAgencyStatus,
  testDeleteAgency
};

// Run tests if this file is executed directly
if (require.main === module) {
  runAgencyTests().catch(console.error);
}