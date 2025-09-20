/**
 * API Testing Helper
 * 
 * This utility provides easy-to-use functions for testing backend APIs
 * using the fixed DEV_STATIC_TOKEN from the .env file.
 */

const axios = require('axios');
require('dotenv').config();

// Configuration
const BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000/api';
const DEV_TOKEN = process.env.DEV_STATIC_TOKEN;

if (!DEV_TOKEN) {
  console.error('❌ DEV_STATIC_TOKEN not found in .env file!');
  console.log('📝 Please ensure DEV_STATIC_TOKEN is set in your .env file');
  process.exit(1);
}

console.log('🔑 Using DEV_STATIC_TOKEN for API testing');
console.log('🌐 API Base URL:', BASE_URL);

/**
 * Make an authenticated API request
 * @param {string} method - HTTP method (GET, POST, PUT, DELETE)
 * @param {string} endpoint - API endpoint (e.g., '/auth/current-user')
 * @param {object} data - Request body data
 * @param {object} params - Query parameters
 * @param {boolean} useAuth - Whether to include authentication header
 * @returns {object} Response object with success, status, data, and headers
 */
async function apiRequest(method, endpoint, data = null, params = {}, useAuth = true) {
  try {
    const config = {
      method: method.toUpperCase(),
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    // Add authentication header if required
    if (useAuth) {
      config.headers['Authorization'] = `Bearer ${DEV_TOKEN}`;
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

/**
 * Convenience methods for common HTTP verbs
 */
const api = {
  get: (endpoint, params = {}, useAuth = true) => 
    apiRequest('GET', endpoint, null, params, useAuth),
  
  post: (endpoint, data = {}, useAuth = true) => 
    apiRequest('POST', endpoint, data, {}, useAuth),
  
  put: (endpoint, data = {}, useAuth = true) => 
    apiRequest('PUT', endpoint, data, {}, useAuth),
  
  delete: (endpoint, useAuth = true) => 
    apiRequest('DELETE', endpoint, null, {}, useAuth),
  
  patch: (endpoint, data = {}, useAuth = true) => 
    apiRequest('PATCH', endpoint, data, {}, useAuth)
};

/**
 * Test result formatter
 * @param {string} testName - Name of the test
 * @param {object} response - API response object
 */
function logTestResult(testName, response) {
  const status = response.success ? '✅' : '❌';
  const statusCode = response.status;
  
  console.log(`\n${status} ${testName}`);
  console.log(`   Status: ${statusCode}`);
  
  if (response.success) {
    console.log(`   Response: ${JSON.stringify(response.data, null, 2)}`);
  } else {
    console.log(`   Error: ${JSON.stringify(response.error, null, 2)}`);
  }
}

/**
 * Run a test suite
 * @param {string} suiteName - Name of the test suite
 * @param {Array} tests - Array of test functions
 */
async function runTestSuite(suiteName, tests) {
  console.log(`\n🧪 Running Test Suite: ${suiteName}`);
  console.log('='.repeat(50));
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      const result = await test();
      if (result.success) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      console.log(`❌ Test failed with exception: ${error.message}`);
      failed++;
    }
  }
  
  console.log(`\n📊 Test Suite Results: ${passed} passed, ${failed} failed`);
  return { passed, failed };
}

module.exports = {
  api,
  apiRequest,
  logTestResult,
  runTestSuite,
  BASE_URL,
  DEV_TOKEN
};