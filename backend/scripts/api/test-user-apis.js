const axios = require('axios');
const colors = require('colors');

// Configuration
const BASE_URL = 'http://localhost:5000/api';

// Development authentication token from DEV_AUTH_GUIDE.md
const DEV_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImRldi11c2VyLWlkLTEyMzQ1IiwiZW1haWwiOiJkZXZAdGVzdC5jb20iLCJwb3J0YWxUeXBlIjoic3VwZXJhZG1pbiIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1ODM2MDc4NSwiZXhwIjoxNzg5ODk2Nzg1fQ.ub44Lv_NrP7oz0uHGyd91gsMeqxBmkBvw-VrNhzzztA';

// Test data storage
let testUserId = null;
let testAccountId = null;
let testAgencyId = null;
let createdUserIds = [];

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
const generateUserData = (accountId = null, agencyId = null, overrides = {}) => ({
  firstName: `Test`,
  lastName: `User ${Date.now()}`,
  email: `test-user-${Date.now()}@example.com`,
  password: 'TestPassword123!',
  phone: '+1234567890',
  role: 'user',
  portalType: accountId ? 'account' : (agencyId ? 'agency' : 'superadmin'),
  accountId: accountId,
  agencyId: agencyId,
  permissions: ['read', 'write'],
  department: 'Testing',
  jobTitle: 'Test User',
  ...overrides
});

const generateUpdateData = () => ({
  firstName: 'Updated',
  lastName: `User ${Date.now()}`,
  phone: '+9876543210',
  department: 'Updated Department',
  jobTitle: 'Updated Job Title'
});

// Setup function to get test account and agency
const setupTestData = async () => {
  log.section('Setting Up Test Data');
  
  try {
    // Get accounts to use for user creation
    const accountsResponse = await makeRequest('GET', '/accounts');
    if (accountsResponse.data && accountsResponse.data.accounts && accountsResponse.data.accounts.length > 0) {
      testAccountId = accountsResponse.data.accounts[0]._id;
      log.success(`Using account ID: ${testAccountId}`);
    }

    // Get agencies to use for user creation
    const agenciesResponse = await makeRequest('GET', '/agencies');
    if (agenciesResponse.data && agenciesResponse.data.agencies && agenciesResponse.data.agencies.length > 0) {
      testAgencyId = agenciesResponse.data.agencies[0]._id;
      log.success(`Using agency ID: ${testAgencyId}`);
    }

    if (!testAccountId && !testAgencyId) {
      log.warning('No test account or agency available for user creation');
    }
  } catch (error) {
    log.error('Failed to setup test data');
    throw error;
  }
};

// Test functions
const testGetUsers = async () => {
  log.section('Testing GET /users - Get All Users');
  
  try {
    const response = await makeRequest('GET', '/users', null, 200);
    
    if (response.data && Array.isArray(response.data.users)) {
      log.success(`Retrieved ${response.data.users.length} users`);
      log.debug(`Response: ${JSON.stringify(response.data, null, 2)}`);
      
      // Store first user ID for later tests
      if (response.data.users.length > 0) {
        testUserId = response.data.users[0]._id;
        log.info(`Using user ID for tests: ${testUserId}`);
      }
    } else {
      log.warning('Unexpected response format');
    }
  } catch (error) {
    log.error('Failed to get users');
  }
};

const testCreateUser = async () => {
  log.section('Testing POST /users - Create User');
  
  try {
    // Test creating account user
    if (testAccountId) {
      const accountUserData = generateUserData(testAccountId, null, { 
        email: `account-user-${Date.now()}@example.com`,
        role: 'manager'
      });
      const accountResponse = await makeRequest('POST', '/users', accountUserData, 201);
      
      if (accountResponse.data && accountResponse.data.user) {
        const createdUser = accountResponse.data.user;
        createdUserIds.push(createdUser._id);
        testUserId = createdUser._id; // Use this for subsequent tests
        
        log.success(`Created account user with ID: ${createdUser._id}`);
        log.debug(`Created user: ${JSON.stringify(createdUser, null, 2)}`);
        
        // Verify required fields
        if (createdUser.email === accountUserData.email && 
            createdUser.accountId === accountUserData.accountId) {
          log.success('Account user data matches input');
        } else {
          log.warning('Account user data mismatch');
        }
      }
    }

    // Test creating agency user
    if (testAgencyId) {
      const agencyUserData = generateUserData(null, testAgencyId, { 
        email: `agency-user-${Date.now()}@example.com`,
        role: 'user'
      });
      const agencyResponse = await makeRequest('POST', '/users', agencyUserData, 201);
      
      if (agencyResponse.data && agencyResponse.data.user) {
        const createdUser = agencyResponse.data.user;
        createdUserIds.push(createdUser._id);
        
        log.success(`Created agency user with ID: ${createdUser._id}`);
        
        // Verify required fields
        if (createdUser.email === agencyUserData.email && 
            createdUser.agencyId === agencyUserData.agencyId) {
          log.success('Agency user data matches input');
        } else {
          log.warning('Agency user data mismatch');
        }
      }
    }

    // Test creating superadmin user
    const superadminUserData = generateUserData(null, null, { 
      email: `superadmin-user-${Date.now()}@example.com`,
      role: 'admin',
      portalType: 'superadmin'
    });
    const superadminResponse = await makeRequest('POST', '/users', superadminUserData, 201);
    
    if (superadminResponse.data && superadminResponse.data.user) {
      const createdUser = superadminResponse.data.user;
      createdUserIds.push(createdUser._id);
      
      log.success(`Created superadmin user with ID: ${createdUser._id}`);
      
      // Verify required fields
      if (createdUser.email === superadminUserData.email && 
          createdUser.portalType === superadminUserData.portalType) {
        log.success('Superadmin user data matches input');
      } else {
        log.warning('Superadmin user data mismatch');
      }
    }
  } catch (error) {
    log.error('Failed to create user');
  }
};

const testGetUser = async () => {
  log.section('Testing GET /users/:id - Get Single User');
  
  if (!testUserId) {
    log.warning('No test user ID available, skipping test');
    return;
  }
  
  try {
    const response = await makeRequest('GET', `/users/${testUserId}`, null, 200);
    
    if (response.data && response.data.user) {
      const user = response.data.user;
      log.success(`Retrieved user: ${user.firstName} ${user.lastName}`);
      log.debug(`User details: ${JSON.stringify(user, null, 2)}`);
      
      // Verify user ID matches
      if (user._id === testUserId) {
        log.success('User ID matches request');
      } else {
        log.warning('User ID mismatch');
      }
    } else {
      log.warning('Unexpected response format');
    }
  } catch (error) {
    log.error('Failed to get user');
  }
};

const testUpdateUser = async () => {
  log.section('Testing PUT /users/:id - Update User');
  
  if (!testUserId) {
    log.warning('No test user ID available, skipping test');
    return;
  }
  
  try {
    const updateData = generateUpdateData();
    const response = await makeRequest('PUT', `/users/${testUserId}`, updateData, 200);
    
    if (response.data && response.data.user) {
      const updatedUser = response.data.user;
      log.success(`Updated user: ${updatedUser.firstName} ${updatedUser.lastName}`);
      log.debug(`Updated user: ${JSON.stringify(updatedUser, null, 2)}`);
      
      // Verify updates
      if (updatedUser.firstName === updateData.firstName && 
          updatedUser.lastName === updateData.lastName) {
        log.success('User updates applied correctly');
      } else {
        log.warning('User update mismatch');
      }
    } else {
      log.warning('Unexpected response format');
    }
  } catch (error) {
    log.error('Failed to update user');
  }
};

const testToggleUserStatus = async () => {
  log.section('Testing PATCH /users/:id/toggle-status - Toggle User Status');
  
  if (!testUserId) {
    log.warning('No test user ID available, skipping test');
    return;
  }
  
  try {
    const response = await makeRequest('PATCH', `/users/${testUserId}/toggle-status`, null, 200);
    
    if (response.data && response.data.user) {
      const user = response.data.user;
      log.success(`Toggled user status to: ${user.status || 'active/inactive'}`);
      log.debug(`User after toggle: ${JSON.stringify(user, null, 2)}`);
    } else {
      log.warning('Unexpected response format');
    }
  } catch (error) {
    log.error('Failed to toggle user status');
  }
};

const testChangeUserPassword = async () => {
  log.section('Testing PATCH /users/:id/change-password - Change User Password');
  
  if (!testUserId) {
    log.warning('No test user ID available, skipping test');
    return;
  }
  
  try {
    const passwordData = {
      currentPassword: 'TestPassword123!',
      newPassword: 'NewTestPassword123!',
      confirmPassword: 'NewTestPassword123!'
    };
    
    const response = await makeRequest('PATCH', `/users/${testUserId}/change-password`, passwordData, 200);
    
    if (response.data) {
      log.success('User password changed successfully');
      log.debug(`Password change response: ${JSON.stringify(response.data, null, 2)}`);
    } else {
      log.warning('Unexpected response format');
    }
  } catch (error) {
    log.error('Failed to change user password');
  }
};

const testDeleteUser = async () => {
  log.section('Testing DELETE /users/:id - Delete User');
  
  // Create a new user specifically for deletion
  try {
    log.info('Creating user for deletion test...');
    const userData = generateUserData(testAccountId, null, { 
      email: `user-for-deletion-${Date.now()}@example.com`,
      firstName: 'Delete',
      lastName: 'Test'
    });
    const createResponse = await makeRequest('POST', '/users', userData, 201);
    
    if (createResponse.data && createResponse.data.user) {
      const userToDelete = createResponse.data.user._id;
      log.info(`Created user for deletion: ${userToDelete}`);
      
      // Now delete it
      const deleteResponse = await makeRequest('DELETE', `/users/${userToDelete}`, null, 200);
      
      if (deleteResponse.data) {
        log.success('User deleted successfully');
        log.debug(`Delete response: ${JSON.stringify(deleteResponse.data, null, 2)}`);
      } else {
        log.warning('Unexpected delete response format');
      }
    } else {
      log.error('Failed to create user for deletion test');
    }
  } catch (error) {
    log.error('Failed to test user deletion');
  }
};

const testInvalidUserId = async () => {
  log.section('Testing Invalid User ID Handling');
  
  const invalidId = '507f1f77bcf86cd799439011'; // Valid ObjectId format but non-existent
  
  try {
    await makeRequest('GET', `/users/${invalidId}`, null, 404);
    log.success('Correctly handled invalid user ID');
  } catch (error) {
    if (error.response && error.response.status === 404) {
      log.success('Correctly returned 404 for invalid user ID');
    } else {
      log.error('Unexpected error for invalid user ID');
    }
  }
};

const testMalformedUserId = async () => {
  log.section('Testing Malformed User ID Handling');
  
  const malformedId = 'invalid-id-format';
  
  try {
    await makeRequest('GET', `/users/${malformedId}`, null, 400);
    log.success('Correctly handled malformed user ID');
  } catch (error) {
    if (error.response && (error.response.status === 400 || error.response.status === 500)) {
      log.success('Correctly handled malformed user ID');
    } else {
      log.error('Unexpected error for malformed user ID');
    }
  }
};

const testCreateUserValidation = async () => {
  log.section('Testing User Creation Validation');
  
  // Test missing required fields
  const invalidData = {
    // Missing firstName, lastName, email, password
    phone: '+1234567890'
  };
  
  try {
    await makeRequest('POST', '/users', invalidData, 400);
    log.success('Correctly validated required fields');
  } catch (error) {
    if (error.response && error.response.status === 400) {
      log.success('Correctly returned validation error');
    } else {
      log.error('Unexpected validation behavior');
    }
  }
};

const testCreateUserWithDuplicateEmail = async () => {
  log.section('Testing User Creation with Duplicate Email');
  
  if (!testAccountId) {
    log.warning('No test account ID available, skipping duplicate email test');
    return;
  }
  
  const duplicateEmail = `duplicate-${Date.now()}@example.com`;
  
  try {
    // Create first user
    const userData1 = generateUserData(testAccountId, null, { email: duplicateEmail });
    const response1 = await makeRequest('POST', '/users', userData1, 201);
    
    if (response1.data && response1.data.user) {
      createdUserIds.push(response1.data.user._id);
      
      // Try to create second user with same email
      const userData2 = generateUserData(testAccountId, null, { email: duplicateEmail });
      await makeRequest('POST', '/users', userData2, 400);
      log.success('Correctly handled duplicate email');
    }
  } catch (error) {
    if (error.response && error.response.status === 400) {
      log.success('Correctly returned error for duplicate email');
    } else {
      log.error('Unexpected error for duplicate email');
    }
  }
};

const testPasswordChangeValidation = async () => {
  log.section('Testing Password Change Validation');
  
  if (!testUserId) {
    log.warning('No test user ID available, skipping password validation test');
    return;
  }
  
  // Test mismatched passwords
  const invalidPasswordData = {
    currentPassword: 'TestPassword123!',
    newPassword: 'NewPassword123!',
    confirmPassword: 'DifferentPassword123!'
  };
  
  try {
    await makeRequest('PATCH', `/users/${testUserId}/change-password`, invalidPasswordData, 400);
    log.success('Correctly validated password mismatch');
  } catch (error) {
    if (error.response && error.response.status === 400) {
      log.success('Correctly returned password validation error');
    } else {
      log.error('Unexpected password validation behavior');
    }
  }
};

// Cleanup function
const cleanup = async () => {
  log.section('Cleaning Up Test Data');
  
  for (const userId of createdUserIds) {
    try {
      await makeRequest('DELETE', `/users/${userId}`);
      log.success(`Cleaned up user: ${userId}`);
    } catch (error) {
      log.warning(`Failed to cleanup user: ${userId}`);
    }
  }
};

// Main test runner
const runUserTests = async () => {
  log.section('🚀 Starting User API Tests');
  log.info('Using Development Authentication Token');
  log.info(`Base URL: ${BASE_URL}`);
  
  try {
    // Setup test data
    await setupTestData();
    
    // Core CRUD operations
    await testGetUsers();
    await testCreateUser();
    await testGetUser();
    await testUpdateUser();
    
    // Status and password management
    await testToggleUserStatus();
    await testChangeUserPassword();
    
    // Deletion (creates its own test user)
    await testDeleteUser();
    
    // Error handling
    await testInvalidUserId();
    await testMalformedUserId();
    await testCreateUserValidation();
    await testCreateUserWithDuplicateEmail();
    await testPasswordChangeValidation();
    
    log.section('✅ User API Tests Completed');
    
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
  runUserTests,
  testGetUsers,
  testCreateUser,
  testGetUser,
  testUpdateUser,
  testToggleUserStatus,
  testChangeUserPassword,
  testDeleteUser
};

// Run tests if this file is executed directly
if (require.main === module) {
  runUserTests().catch(console.error);
}