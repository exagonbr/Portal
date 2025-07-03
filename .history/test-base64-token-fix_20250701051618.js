#!/usr/bin/env node

/**
 * Test script to verify base64 token validation fix
 * Tests both JWT and base64-encoded fallback tokens
 */

const chalk = require('chalk');

const FRONTEND_URL = 'https://portal.sabercon.com.br';
const BACKEND_URL = 'https://portal.sabercon.com.br/api';

// Test token from cookie_jar.txt (base64-encoded JSON)
const BASE64_TOKEN = 'eyJ1c2VySWQiOiJhZG1pbiIsImVtYWlsIjoiYWRtaW5Ac2FiZXJjb24uZWR1LmJyIiwibmFtZSI6IkFkbWluaXN0cmFkb3IiLCJyb2xlIjoiU1lTVEVNX0FETUlOIiwiaW5zdGl0dXRpb25JZCI6Imluc3Rfc2FiZXJjb24iLCJwZXJtaXNzaW9ucyI6WyJhbGwiXSwiaWF0IjoxNzUwMTA5MTg0LCJleHAiOjE3NTAxOTU1ODR9';

// Test endpoints that were failing
const TEST_ENDPOINTS = [
  {
    url: '/api/dashboard/metrics/realtime',
    description: 'Realtime Metrics (Main Issue)',
    server: 'Frontend'
  },
  {
    url: '/api/dashboard/system',
    description: 'System Dashboard',
    server: 'Frontend'
  },
  {
    url: '/api/dashboard/engagement',
    description: 'Engagement Metrics',
    server: 'Frontend'
  }
];

async function testEndpoint(endpoint, baseUrl, token) {
  const fullUrl = `${baseUrl}${endpoint.url}`;
  
  try {
    console.log(`\n🧪 Testing: ${chalk.cyan(endpoint.description)}`);
    console.log(`   URL: ${fullUrl}`);
    
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Cookie': `auth_token=${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const responseText = await response.text();
    let responseData;
    
    try {
      responseData = JSON.parse(responseText);
    } catch {
      responseData = { raw: responseText };
    }
    
    if (response.ok) {
      console.log(`   ✅ ${chalk.green('SUCCESS')} - Status: ${response.status}`);
      if (responseData.success) {
        console.log(`   📊 Data received: ${chalk.gray(JSON.stringify(responseData).substring(0, 100))}...`);
      }
      return { success: true, status: response.status, data: responseData };
    } else {
      console.log(`   ❌ ${chalk.red('FAILED')} - Status: ${response.status}`);
      console.log(`   📝 Response: ${chalk.yellow(JSON.stringify(responseData, null, 2))}`);
      return { success: false, status: response.status, error: responseData };
    }
    
  } catch (error) {
    console.log(`   💥 ${chalk.red('ERROR')} - ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function testBase64TokenDecoding() {
  console.log(chalk.blue.bold('\n🔍 Testing Base64 Token Decoding\n'));
  
  try {
    // Test the token decoding directly
    const decoded = Buffer.from(BASE64_TOKEN, 'base64').toString('utf-8');
    const tokenData = JSON.parse(decoded);
    
    console.log('✅ Base64 token decodes successfully:');
    console.log(`   User ID: ${tokenData.userId}`);
    console.log(`   Email: ${tokenData.email}`);
    console.log(`   Role: ${tokenData.role}`);
    console.log(`   Institution: ${tokenData.institutionId}`);
    console.log(`   Expires: ${new Date(tokenData.exp * 1000).toISOString()}`);
    
    return true;
  } catch (error) {
    console.log(`❌ Failed to decode base64 token: ${error.message}`);
    return false;
  }
}

async function runTests() {
  console.log(chalk.blue.bold('🧪 Base64 Token Validation Fix Test\n'));
  console.log('=' .repeat(60));
  
  // Test 1: Verify base64 token can be decoded
  const canDecode = await testBase64TokenDecoding();
  if (!canDecode) {
    console.log(chalk.red('\n❌ Base64 token decoding failed - stopping tests'));
    return;
  }
  
  // Test 2: Test endpoints with base64 token
  console.log(chalk.blue.bold('\n🌐 Testing API Endpoints\n'));
  
  const results = [];
  
  for (const endpoint of TEST_ENDPOINTS) {
    const baseUrl = endpoint.server === 'Frontend' ? FRONTEND_URL : BACKEND_URL;
    const result = await testEndpoint(endpoint, baseUrl, BASE64_TOKEN);
    results.push({
      endpoint: endpoint.description,
      ...result
    });
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  // Summary
  console.log(chalk.blue.bold('\n📊 Test Results Summary\n'));
  console.log('=' .repeat(60));
  
  const successful = results.filter(r => r.success).length;
  const total = results.length;
  
  results.forEach(result => {
    const status = result.success ? 
      chalk.green('✅ PASS') : 
      chalk.red('❌ FAIL');
    console.log(`${status} ${result.endpoint}`);
  });
  
  console.log(`\n📈 Success Rate: ${successful}/${total} (${Math.round(successful/total*100)}%)`);
  
  if (successful === total) {
    console.log(chalk.green.bold('\n🎉 ALL TESTS PASSED! Base64 token validation fix is working correctly.'));
  } else {
    console.log(chalk.yellow.bold('\n⚠️  Some tests failed. Check the logs above for details.'));
  }
  
  console.log(chalk.gray('\n💡 If tests are failing, make sure:'));
  console.log(chalk.gray('   1. Frontend server is running on port 3000'));
  console.log(chalk.gray('   2. Backend server is running on port 3001'));
  console.log(chalk.gray('   3. The auth-utils.ts changes have been applied'));
}

// Run the tests
runTests().catch(console.log);
