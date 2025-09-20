// Simple API test script for mobile app
const axios = require('axios');

// Test the mobile app's API configuration
const API_BASE_URL = 'https://01995e0f-5717-75d4-a678-d9763bfe9c94.mocha-app.workers.dev';
const LOCAL_URL = 'http://localhost:5173';

async function testAPIs() {
  console.log('Testing API connectivity...\n');

  // Test 1: Check if production API is accessible
  try {
    console.log('1. Testing production API...');
    const response = await axios.get(`${API_BASE_URL}/api/oauth/google/redirect_url`, {
      timeout: 5000
    });
    console.log('✅ Production API is accessible');
    console.log('Response:', response.data);
  } catch (error) {
    console.log('❌ Production API error:', error.message);
  }

  // Test 2: Check if local development server is accessible
  try {
    console.log('\n2. Testing local development API...');
    const response = await axios.get(`${LOCAL_URL}/api/oauth/google/redirect_url`, {
      timeout: 5000
    });
    console.log('✅ Local API is accessible');
    console.log('Response:', response.data);
  } catch (error) {
    console.log('❌ Local API error:', error.message);
  }

  // Test 3: Check CORS headers
  try {
    console.log('\n3. Testing CORS headers...');
    const response = await axios.options(`${LOCAL_URL}/api/dashboard-stats`, {
      headers: {
        'Origin': 'http://localhost:8081',
        'Access-Control-Request-Method': 'GET'
      },
      timeout: 5000
    });
    console.log('✅ CORS preflight successful');
  } catch (error) {
    console.log('❌ CORS error:', error.message);
  }

  console.log('\nAPI connectivity test completed!');
}

testAPIs().catch(console.error);