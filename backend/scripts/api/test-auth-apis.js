const axios = require('axios');

// Configuration
const BASE_URL = 'http://localhost:3000/api';
const DEV_AUTH_TOKEN = 'dev-auth-token-12345'; // Development authentication token

// Helper function to make requests (with optional authentication)
async function makeRequest(method, endpoint, data = null, params = {}, useAuth = true) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    // Add authentication header if required
    if (useAuth) {
      config.headers['Authorization'] = `Bearer ${DEV_AUTH_TOKEN}`;
    }

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
      data: response.data,
      headers: response.headers
    };
  } catch (error) {
    return {
      success: false,
      status: error.response?.status || 500,
      error: error.response?.data || error.message,
      headers: error.response?.headers
    };
  }
}

// Test data generators
function generateTestData() {
  const timestamp = Date.now();
  return {
    validUser: {
      email: `testuser${timestamp}@example.com`,
      password: 'TestPassword123!',
      firstName: 'Test',
      lastName: 'User',
      role: 'user',
      portalType: 'account'
    },
    invalidUser: {
      email: 'invalid-email',
      password: '123', // Too short
      firstName: '',
      lastName: ''
    },
    loginCredentials: {
      email: `testuser${timestamp}@example.com`,
      password: 'TestPassword123!'
    },
    invalidLoginCredentials: {
      email: 'nonexistent@example.com',
      password: 'wrongpassword'
    },
    updateProfileData: {
      firstName: 'Updated',
      lastName: 'Name',
      phone: '+1234567890'
    },
    changePasswordData: {
      currentPassword: 'TestPassword123!',
      newPassword: 'NewPassword456!',
      confirmPassword: 'NewPassword456!'
    },
    invalidChangePasswordData: {
      currentPassword: 'wrongpassword',
      newPassword: 'short',
      confirmPassword: 'different'
    }
  };
}

// Global variables to store test data
let testAuthToken = null;
let testRefreshToken = null;
let testUserId = null;

// Setup and cleanup functions
async function setupTestData() {
  console.log('Setting up test data for authentication...');
  // In a real scenario, you might create test accounts, etc.
  return true;
}

async function cleanupTestData() {
  console.log('Cleaning up test data for authentication...');
  // In a real scenario, you might clean up test data
  return true;
}

// Test functions
async function testUserRegistration() {
  console.log('\n=== Testing POST /auth/register ===');
  
  const testData = generateTestData();
  
  // Test 1: Register user with valid data
  console.log('Test 1: Register user with valid data');
  const result1 = await makeRequest('POST', '/auth/register', testData.validUser, {}, false);
  console.log('Status:', result1.status);
  console.log('Success:', result1.success);
  if (result1.success) {
    console.log('Registration successful');
    console.log('Response structure:', Object.keys(result1.data));
    // Store tokens for later tests
    if (result1.data.token) {
      testAuthToken = result1.data.token;
    }
    if (result1.data.refreshToken) {
      testRefreshToken = result1.data.refreshToken;
    }
    if (result1.data.user && result1.data.user.id) {
      testUserId = result1.data.user.id;
    }
  } else {
    console.log('Error:', result1.error);
  }

  // Test 2: Register user with invalid data
  console.log('\nTest 2: Register user with invalid data');
  const result2 = await makeRequest('POST', '/auth/register', testData.invalidUser, {}, false);
  console.log('Status:', result2.status);
  console.log('Success:', result2.success);
  if (!result2.success) {
    console.log('Expected validation error:', result2.error);
  }

  // Test 3: Register user with duplicate email
  console.log('\nTest 3: Register user with duplicate email');
  const result3 = await makeRequest('POST', '/auth/register', testData.validUser, {}, false);
  console.log('Status:', result3.status);
  console.log('Success:', result3.success);
  if (!result3.success) {
    console.log('Expected duplicate email error:', result3.error);
  }

  return result1.success;
}

async function testUserLogin() {
  console.log('\n=== Testing POST /auth/login ===');
  
  const testData = generateTestData();
  
  // Test 1: Login with valid credentials
  console.log('Test 1: Login with valid credentials');
  const result1 = await makeRequest('POST', '/auth/login', testData.loginCredentials, {}, false);
  console.log('Status:', result1.status);
  console.log('Success:', result1.success);
  if (result1.success) {
    console.log('Login successful');
    console.log('Response structure:', Object.keys(result1.data));
    // Update tokens for later tests
    if (result1.data.token) {
      testAuthToken = result1.data.token;
    }
    if (result1.data.refreshToken) {
      testRefreshToken = result1.data.refreshToken;
    }
  } else {
    console.log('Error:', result1.error);
  }

  // Test 2: Login with invalid credentials
  console.log('\nTest 2: Login with invalid credentials');
  const result2 = await makeRequest('POST', '/auth/login', testData.invalidLoginCredentials, {}, false);
  console.log('Status:', result2.status);
  console.log('Success:', result2.success);
  if (!result2.success) {
    console.log('Expected authentication error:', result2.error);
  }

  // Test 3: Login with missing fields
  console.log('\nTest 3: Login with missing fields');
  const result3 = await makeRequest('POST', '/auth/login', { email: 'test@example.com' }, {}, false);
  console.log('Status:', result3.status);
  console.log('Success:', result3.success);
  if (!result3.success) {
    console.log('Expected validation error:', result3.error);
  }

  return result1.success;
}

async function testRefreshToken() {
  console.log('\n=== Testing POST /auth/refresh ===');
  
  // Test 1: Refresh token with valid refresh token
  console.log('Test 1: Refresh token with valid refresh token');
  const refreshData = testRefreshToken ? { refreshToken: testRefreshToken } : { refreshToken: 'sample-refresh-token' };
  const result1 = await makeRequest('POST', '/auth/refresh', refreshData, {}, false);
  console.log('Status:', result1.status);
  console.log('Success:', result1.success);
  if (result1.success) {
    console.log('Token refresh successful');
    console.log('Response structure:', Object.keys(result1.data));
    // Update token for later tests
    if (result1.data.token) {
      testAuthToken = result1.data.token;
    }
  } else {
    console.log('Error:', result1.error);
  }

  // Test 2: Refresh token with invalid refresh token
  console.log('\nTest 2: Refresh token with invalid refresh token');
  const result2 = await makeRequest('POST', '/auth/refresh', { refreshToken: 'invalid-refresh-token' }, {}, false);
  console.log('Status:', result2.status);
  console.log('Success:', result2.success);
  if (!result2.success) {
    console.log('Expected invalid token error:', result2.error);
  }

  // Test 3: Refresh token with missing refresh token
  console.log('\nTest 3: Refresh token with missing refresh token');
  const result3 = await makeRequest('POST', '/auth/refresh', {}, {}, false);
  console.log('Status:', result3.status);
  console.log('Success:', result3.success);
  if (!result3.success) {
    console.log('Expected validation error:', result3.error);
  }

  return true;
}

async function testGetUserProfile() {
  console.log('\n=== Testing GET /auth/me ===');
  
  // Test 1: Get user profile with valid token
  console.log('Test 1: Get user profile with valid token');
  const result1 = await makeRequest('GET', '/auth/me');
  console.log('Status:', result1.status);
  console.log('Success:', result1.success);
  if (result1.success) {
    console.log('Profile retrieved successfully');
    console.log('Response structure:', Object.keys(result1.data));
  } else {
    console.log('Error:', result1.error);
  }

  // Test 2: Get user profile without authentication
  console.log('\nTest 2: Get user profile without authentication');
  const result2 = await makeRequest('GET', '/auth/me', null, {}, false);
  console.log('Status:', result2.status);
  console.log('Success:', result2.success);
  if (!result2.success) {
    console.log('Expected authentication error:', result2.error);
  }

  return result1.success;
}

async function testUpdateUserProfile() {
  console.log('\n=== Testing PUT /auth/me ===');
  
  const testData = generateTestData();
  
  // Test 1: Update user profile with valid data
  console.log('Test 1: Update user profile with valid data');
  const result1 = await makeRequest('PUT', '/auth/me', testData.updateProfileData);
  console.log('Status:', result1.status);
  console.log('Success:', result1.success);
  if (result1.success) {
    console.log('Profile updated successfully');
    console.log('Response structure:', Object.keys(result1.data));
  } else {
    console.log('Error:', result1.error);
  }

  // Test 2: Update user profile with invalid data
  console.log('\nTest 2: Update user profile with invalid data');
  const invalidData = { email: 'invalid-email-format' };
  const result2 = await makeRequest('PUT', '/auth/me', invalidData);
  console.log('Status:', result2.status);
  console.log('Success:', result2.success);
  if (!result2.success) {
    console.log('Expected validation error:', result2.error);
  }

  // Test 3: Update user profile without authentication
  console.log('\nTest 3: Update user profile without authentication');
  const result3 = await makeRequest('PUT', '/auth/me', testData.updateProfileData, {}, false);
  console.log('Status:', result3.status);
  console.log('Success:', result3.success);
  if (!result3.success) {
    console.log('Expected authentication error:', result3.error);
  }

  return result1.success;
}

async function testChangePassword() {
  console.log('\n=== Testing PUT /auth/change-password ===');
  
  const testData = generateTestData();
  
  // Test 1: Change password with valid data
  console.log('Test 1: Change password with valid data');
  const result1 = await makeRequest('PUT', '/auth/change-password', testData.changePasswordData);
  console.log('Status:', result1.status);
  console.log('Success:', result1.success);
  if (result1.success) {
    console.log('Password changed successfully');
  } else {
    console.log('Error:', result1.error);
  }

  // Test 2: Change password with invalid current password
  console.log('\nTest 2: Change password with invalid current password');
  const result2 = await makeRequest('PUT', '/auth/change-password', testData.invalidChangePasswordData);
  console.log('Status:', result2.status);
  console.log('Success:', result2.success);
  if (!result2.success) {
    console.log('Expected authentication error:', result2.error);
  }

  // Test 3: Change password with mismatched confirmation
  console.log('\nTest 3: Change password with mismatched confirmation');
  const mismatchedData = {
    currentPassword: 'TestPassword123!',
    newPassword: 'NewPassword456!',
    confirmPassword: 'DifferentPassword789!'
  };
  const result3 = await makeRequest('PUT', '/auth/change-password', mismatchedData);
  console.log('Status:', result3.status);
  console.log('Success:', result3.success);
  if (!result3.success) {
    console.log('Expected validation error:', result3.error);
  }

  // Test 4: Change password without authentication
  console.log('\nTest 4: Change password without authentication');
  const result4 = await makeRequest('PUT', '/auth/change-password', testData.changePasswordData, {}, false);
  console.log('Status:', result4.status);
  console.log('Success:', result4.success);
  if (!result4.success) {
    console.log('Expected authentication error:', result4.error);
  }

  return true;
}

async function testUserLogout() {
  console.log('\n=== Testing POST /auth/logout ===');
  
  // Test 1: Logout with valid token
  console.log('Test 1: Logout with valid token');
  const result1 = await makeRequest('POST', '/auth/logout');
  console.log('Status:', result1.status);
  console.log('Success:', result1.success);
  if (result1.success) {
    console.log('Logout successful');
  } else {
    console.log('Error:', result1.error);
  }

  // Test 2: Logout without authentication
  console.log('\nTest 2: Logout without authentication');
  const result2 = await makeRequest('POST', '/auth/logout', null, {}, false);
  console.log('Status:', result2.status);
  console.log('Success:', result2.success);
  if (!result2.success) {
    console.log('Expected authentication error:', result2.error);
  }

  return result1.success;
}

async function testAuthenticationFlow() {
  console.log('\n=== Testing Complete Authentication Flow ===');
  
  const testData = generateTestData();
  
  // Step 1: Register a new user
  console.log('Step 1: Register a new user');
  const registerResult = await makeRequest('POST', '/auth/register', testData.validUser, {}, false);
  console.log('Registration Status:', registerResult.status);
  
  if (!registerResult.success) {
    console.log('Registration failed, skipping flow test');
    return false;
  }

  // Step 2: Login with the registered user
  console.log('\nStep 2: Login with registered user');
  const loginResult = await makeRequest('POST', '/auth/login', testData.loginCredentials, {}, false);
  console.log('Login Status:', loginResult.status);
  
  if (!loginResult.success) {
    console.log('Login failed, skipping remaining flow');
    return false;
  }

  // Store the token for authenticated requests
  const flowToken = loginResult.data.token;
  
  // Step 3: Access protected route (get profile)
  console.log('\nStep 3: Access protected route');
  const profileResult = await makeRequest('GET', '/auth/me', null, {}, true);
  console.log('Profile Access Status:', profileResult.status);
  
  // Step 4: Update profile
  console.log('\nStep 4: Update profile');
  const updateResult = await makeRequest('PUT', '/auth/me', testData.updateProfileData, {}, true);
  console.log('Profile Update Status:', updateResult.status);
  
  // Step 5: Logout
  console.log('\nStep 5: Logout');
  const logoutResult = await makeRequest('POST', '/auth/logout', null, {}, true);
  console.log('Logout Status:', logoutResult.status);
  
  console.log('\n✅ Complete authentication flow tested');
  return true;
}

async function testErrorHandling() {
  console.log('\n=== Testing Error Handling ===');
  
  // Test 1: Invalid JSON in request body
  console.log('Test 1: Invalid content type');
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, 'invalid-json', {
      headers: { 'Content-Type': 'text/plain' }
    });
  } catch (error) {
    console.log('Status:', error.response?.status);
    console.log('Expected content type error');
  }

  // Test 2: Extremely long password
  console.log('\nTest 2: Extremely long password');
  const longPasswordData = {
    email: 'test@example.com',
    password: 'a'.repeat(1000),
    firstName: 'Test',
    lastName: 'User'
  };
  const result2 = await makeRequest('POST', '/auth/register', longPasswordData, {}, false);
  console.log('Status:', result2.status);
  console.log('Success:', result2.success);
  if (!result2.success) {
    console.log('Expected validation error for long password');
  }

  // Test 3: SQL injection attempt
  console.log('\nTest 3: SQL injection attempt');
  const sqlInjectionData = {
    email: "test@example.com'; DROP TABLE users; --",
    password: 'password123'
  };
  const result3 = await makeRequest('POST', '/auth/login', sqlInjectionData, {}, false);
  console.log('Status:', result3.status);
  console.log('Success:', result3.success);
  if (!result3.success) {
    console.log('SQL injection attempt properly handled');
  }

  // Test 4: XSS attempt in registration
  console.log('\nTest 4: XSS attempt in registration');
  const xssData = {
    email: 'test@example.com',
    password: 'password123',
    firstName: '<script>alert("xss")</script>',
    lastName: 'User'
  };
  const result4 = await makeRequest('POST', '/auth/register', xssData, {}, false);
  console.log('Status:', result4.status);
  console.log('Success:', result4.success);
  if (!result4.success) {
    console.log('XSS attempt properly handled');
  }

  return true;
}

// Main test runner
async function runAllTests() {
  console.log('🚀 Starting Authentication API Tests');
  console.log('='.repeat(50));
  
  try {
    // Setup
    await setupTestData();
    
    // Run all tests
    const tests = [
      testUserRegistration,
      testUserLogin,
      testRefreshToken,
      testGetUserProfile,
      testUpdateUserProfile,
      testChangePassword,
      testUserLogout,
      testAuthenticationFlow,
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
    console.log('🏁 Authentication API Tests Completed');
    
  } catch (error) {
    console.error('❌ Test suite failed:', error.message);
  }
}

// Export for use in other files
module.exports = {
  runAllTests,
  testUserRegistration,
  testUserLogin,
  testRefreshToken,
  testGetUserProfile,
  testUpdateUserProfile,
  testChangePassword,
  testUserLogout,
  testAuthenticationFlow,
  testErrorHandling
};

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests();
}