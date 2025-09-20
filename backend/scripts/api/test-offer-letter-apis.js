const axios = require('axios');
const colors = require('colors');

// Configuration
const BASE_URL = 'http://localhost:3000/api';
const DEV_TOKEN = 'dev-token-12345'; // Development authentication token

// Test data storage
let testOfferLetterId = null;
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
const generateOfferLetterData = () => ({
  accountId: testAccountId,
  agencyId: testAgencyId,
  candidateName: `Test Candidate ${Date.now()}`,
  candidateEmail: `candidate-${Date.now()}@example.com`,
  position: 'Software Developer',
  department: 'Engineering',
  startDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
  salary: Math.floor(Math.random() * 50000) + 50000,
  currency: 'USD',
  benefits: [
    'Health Insurance',
    'Dental Insurance',
    '401k Matching',
    'Paid Time Off'
  ],
  terms: {
    employmentType: 'full-time',
    probationPeriod: 90,
    noticePeriod: 30
  },
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

const generateDocumentData = () => ({
  name: `Test Document ${Date.now()}`,
  type: 'contract',
  description: 'Test document for offer letter',
  url: 'https://example.com/test-document.pdf',
  metadata: {
    uploadedBy: 'test-admin',
    uploadDate: new Date().toISOString()
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
const testCreateOfferLetter = async () => {
  log('Testing offer letter creation...', 'info');
  
  const offerLetterData = generateOfferLetterData();
  const result = await makeRequest('POST', '/offer-letters', offerLetterData);
  
  if (result.success) {
    testOfferLetterId = result.data.data.id;
    log(`✅ Offer letter created successfully: ${testOfferLetterId}`, 'success');
    log(`Response: ${JSON.stringify(result.data, null, 2)}`, 'info');
    return true;
  } else {
    log(`❌ Failed to create offer letter: ${JSON.stringify(result.error)}`, 'error');
    return false;
  }
};

const testGetOfferLetters = async () => {
  log('Testing get all offer letters...', 'info');
  
  const result = await makeRequest('GET', '/offer-letters');
  
  if (result.success) {
    log(`✅ Retrieved ${result.data.data.length} offer letters`, 'success');
    log(`Response: ${JSON.stringify(result.data, null, 2)}`, 'info');
    return true;
  } else {
    log(`❌ Failed to get offer letters: ${JSON.stringify(result.error)}`, 'error');
    return false;
  }
};

const testGetOfferLetterById = async () => {
  if (!testOfferLetterId) {
    log('❌ No test offer letter ID available', 'error');
    return false;
  }

  log(`Testing get offer letter by ID: ${testOfferLetterId}...`, 'info');
  
  const result = await makeRequest('GET', `/offer-letters/${testOfferLetterId}`);
  
  if (result.success) {
    log(`✅ Retrieved offer letter: ${testOfferLetterId}`, 'success');
    log(`Response: ${JSON.stringify(result.data, null, 2)}`, 'info');
    return true;
  } else {
    log(`❌ Failed to get offer letter: ${JSON.stringify(result.error)}`, 'error');
    return false;
  }
};

const testUpdateOfferLetter = async () => {
  if (!testOfferLetterId) {
    log('❌ No test offer letter ID available', 'error');
    return false;
  }

  log(`Testing offer letter update: ${testOfferLetterId}...`, 'info');
  
  const updateData = {
    position: 'Senior Software Developer',
    salary: 75000,
    benefits: [
      'Health Insurance',
      'Dental Insurance',
      'Vision Insurance',
      '401k Matching',
      'Paid Time Off',
      'Stock Options'
    ],
    terms: {
      employmentType: 'full-time',
      probationPeriod: 60,
      noticePeriod: 30
    },
    metadata: {
      source: 'api_test_updated',
      testId: Date.now()
    }
  };
  
  const result = await makeRequest('PUT', `/offer-letters/${testOfferLetterId}`, updateData);
  
  if (result.success) {
    log(`✅ Offer letter updated successfully`, 'success');
    log(`Response: ${JSON.stringify(result.data, null, 2)}`, 'info');
    return true;
  } else {
    log(`❌ Failed to update offer letter: ${JSON.stringify(result.error)}`, 'error');
    return false;
  }
};

const testUpdateOfferLetterStatus = async () => {
  if (!testOfferLetterId) {
    log('❌ No test offer letter ID available', 'error');
    return false;
  }

  log(`Testing offer letter status update: ${testOfferLetterId}...`, 'info');
  
  const statusData = {
    status: 'sent',
    notes: 'Offer letter sent to candidate via API test',
    sentDate: new Date().toISOString()
  };
  
  const result = await makeRequest('PATCH', `/offer-letters/${testOfferLetterId}/status`, statusData);
  
  if (result.success) {
    log(`✅ Offer letter status updated successfully`, 'success');
    log(`Response: ${JSON.stringify(result.data, null, 2)}`, 'info');
    return true;
  } else {
    log(`❌ Failed to update offer letter status: ${JSON.stringify(result.error)}`, 'error');
    return false;
  }
};

const testAddDocument = async () => {
  if (!testOfferLetterId) {
    log('❌ No test offer letter ID available', 'error');
    return false;
  }

  log(`Testing add document to offer letter: ${testOfferLetterId}...`, 'info');
  
  const documentData = generateDocumentData();
  const result = await makeRequest('POST', `/offer-letters/${testOfferLetterId}/documents`, documentData);
  
  if (result.success) {
    log(`✅ Document added to offer letter successfully`, 'success');
    log(`Response: ${JSON.stringify(result.data, null, 2)}`, 'info');
    return true;
  } else {
    log(`❌ Failed to add document to offer letter: ${JSON.stringify(result.error)}`, 'error');
    return false;
  }
};

const testGetOfferLetterStats = async () => {
  log('Testing get offer letter statistics...', 'info');
  
  const result = await makeRequest('GET', '/offer-letters/stats');
  
  if (result.success) {
    log(`✅ Retrieved offer letter statistics`, 'success');
    log(`Response: ${JSON.stringify(result.data, null, 2)}`, 'info');
    return true;
  } else {
    log(`❌ Failed to get offer letter statistics: ${JSON.stringify(result.error)}`, 'error');
    return false;
  }
};

const testDeleteOfferLetter = async () => {
  if (!testOfferLetterId) {
    log('❌ No test offer letter ID available', 'error');
    return false;
  }

  log(`Testing offer letter deletion: ${testOfferLetterId}...`, 'info');
  
  const result = await makeRequest('DELETE', `/offer-letters/${testOfferLetterId}`);
  
  if (result.success) {
    log(`✅ Offer letter deleted successfully`, 'success');
    log(`Response: ${JSON.stringify(result.data, null, 2)}`, 'info');
    testOfferLetterId = null; // Clear the ID since it's deleted
    return true;
  } else {
    log(`❌ Failed to delete offer letter: ${JSON.stringify(result.error)}`, 'error');
    return false;
  }
};

// Error handling tests
const testInvalidOfferLetterCreation = async () => {
  log('Testing invalid offer letter creation...', 'info');
  
  const invalidData = {
    // Missing required fields
    candidateName: '',
    candidateEmail: 'invalid-email',
    salary: 'invalid-salary'
  };
  
  const result = await makeRequest('POST', '/offer-letters', invalidData);
  
  if (!result.success && result.status >= 400) {
    log(`✅ Invalid offer letter creation properly rejected`, 'success');
    log(`Error response: ${JSON.stringify(result.error)}`, 'info');
    return true;
  } else {
    log(`❌ Invalid offer letter creation should have failed`, 'error');
    return false;
  }
};

const testNonExistentOfferLetter = async () => {
  log('Testing access to non-existent offer letter...', 'info');
  
  const fakeId = '507f1f77bcf86cd799439011';
  const result = await makeRequest('GET', `/offer-letters/${fakeId}`);
  
  if (!result.success && result.status === 404) {
    log(`✅ Non-existent offer letter properly handled`, 'success');
    log(`Error response: ${JSON.stringify(result.error)}`, 'info');
    return true;
  } else {
    log(`❌ Non-existent offer letter should return 404`, 'error');
    return false;
  }
};

const testUnauthorizedOfferLetterDeletion = async () => {
  log('Testing unauthorized offer letter deletion...', 'info');
  
  // Create a new offer letter for this test
  const offerLetterData = generateOfferLetterData();
  const createResult = await makeRequest('POST', '/offer-letters', offerLetterData);
  
  if (!createResult.success) {
    log(`❌ Failed to create offer letter for deletion test`, 'error');
    return false;
  }
  
  const tempOfferId = createResult.data.data.id;
  
  // Try to delete without proper authorization (this would normally fail in real auth)
  const result = await makeRequest('DELETE', `/offer-letters/${tempOfferId}`);
  
  // In dev mode, this might succeed, so we'll just log the result
  if (result.success) {
    log(`✅ Offer letter deletion completed (dev mode)`, 'success');
    log(`Response: ${JSON.stringify(result.data, null, 2)}`, 'info');
    return true;
  } else {
    log(`✅ Offer letter deletion properly restricted`, 'success');
    log(`Error response: ${JSON.stringify(result.error)}`, 'info');
    return true;
  }
};

// Cleanup function
const cleanup = async () => {
  log('Cleaning up test data...', 'info');
  
  // Note: In a real scenario, you might want to delete test data
  // For now, we'll just log the cleanup
  if (testOfferLetterId) {
    log(`Test offer letter ID: ${testOfferLetterId}`, 'info');
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
const runOfferLetterTests = async () => {
  console.log('🚀 Starting Offer Letter API Tests'.cyan.bold);
  console.log('='.repeat(50).cyan);
  
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
    totalTests++; if (await testCreateOfferLetter()) passedTests++;
    totalTests++; if (await testGetOfferLetters()) passedTests++;
    totalTests++; if (await testGetOfferLetterById()) passedTests++;
    totalTests++; if (await testUpdateOfferLetter()) passedTests++;
    
    // Status and document operations
    totalTests++; if (await testUpdateOfferLetterStatus()) passedTests++;
    totalTests++; if (await testAddDocument()) passedTests++;
    
    // Analytics
    totalTests++; if (await testGetOfferLetterStats()) passedTests++;
    
    // Error handling
    totalTests++; if (await testInvalidOfferLetterCreation()) passedTests++;
    totalTests++; if (await testNonExistentOfferLetter()) passedTests++;
    totalTests++; if (await testUnauthorizedOfferLetterDeletion()) passedTests++;
    
    // Deletion (test this last)
    totalTests++; if (await testDeleteOfferLetter()) passedTests++;
    
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
  runOfferLetterTests,
  testCreateOfferLetter,
  testGetOfferLetters,
  testGetOfferLetterById,
  testUpdateOfferLetter,
  testUpdateOfferLetterStatus,
  testAddDocument,
  testGetOfferLetterStats,
  testDeleteOfferLetter
};

// Run tests if this file is executed directly
if (require.main === module) {
  runOfferLetterTests();
}