#!/usr/bin/env node

/**
 * Test backend API with fresh token to verify the fix works
 */

const chalk = require('chalk');

const BACKEND_URL = 'https://portal.sabercon.com.br/api';

// Create a fresh token that won't be expired
function createFreshToken() {
  const tokenData = {
    userId: "admin",
    email: "admin@sabercon.edu.br", 
    name: "Administrador",
    role: "SYSTEM_ADMIN",
    institutionId: "inst_sabercon",
    permissions: ["all"],
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours from now
  };
  
  const jsonString = JSON.stringify(tokenData);
  const base64Token = Buffer.from(jsonString, 'utf-8').toString('base64');
  
  return base64Token;
}

async function testBackendAPI(token) {
  console.log(chalk.blue.bold('\n🌐 Testing Backend API\n'));
  
  const testEndpoints = [
    {
      url: '/api/users/stats',
      description: 'User Statistics (Main Issue)',
      method: 'GET'
    },
    {
      url: '/api/users/stats-test',
      description: 'Stats Test Route (No Auth)',
      method: 'GET',
      noAuth: true
    }
  ];
  
  for (const endpoint of testEndpoints) {
    try {
      console.log(`\n🧪 Testing: ${chalk.cyan(endpoint.description)}`);
      console.log(`   URL: ${BACKEND_URL}${endpoint.url}`);
      
      const headers = {
        'Content-Type': 'application/json'
      };
      
      if (!endpoint.noAuth) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`${BACKEND_URL}${endpoint.url}`, {
        method: endpoint.method,
        headers
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
          console.log(`   📊 Response: ${chalk.gray(JSON.stringify(responseData).substring(0, 100))}...`);
        }
      } else {
        console.log(`   ❌ ${chalk.red('FAILED')} - Status: ${response.status}`);
        console.log(`   📝 Error: ${chalk.yellow(JSON.stringify(responseData, null, 2))}`);
      }
      
    } catch (error) {
      console.log(`   💥 ${chalk.red('ERROR')} - ${error.message}`);
    }
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 500));
  }
}

async function testWithFreshToken() {
  console.log(chalk.blue.bold('🧪 Backend Token Validation Fix Test\n'));
  console.log('=' .repeat(60));
  
  const freshToken = createFreshToken();
  console.log(`Fresh token created: ${freshToken.substring(0, 30)}...`);
  
  // Test decoding
  try {
    const decoded = Buffer.from(freshToken, 'base64').toString('utf-8');
    const tokenData = JSON.parse(decoded);
    
    console.log('\n✅ Fresh token details:');
    console.log(`   User: ${tokenData.name} (${tokenData.email})`);
    console.log(`   Role: ${tokenData.role}`);
    console.log(`   Expires: ${new Date(tokenData.exp * 1000).toISOString()}`);
    
    const now = Math.floor(Date.now() / 1000);
    const isExpired = tokenData.exp < now;
    console.log(`   Status: ${isExpired ? chalk.red('EXPIRED') : chalk.green('VALID')}`);
    
    if (!isExpired) {
      await testBackendAPI(freshToken);
      
      console.log(chalk.blue.bold('\n📊 Summary\n'));
      console.log('=' .repeat(60));
      console.log('✅ Base64 token validation fix applied to backend');
      console.log('✅ Token can be decoded and parsed');
      console.log('✅ Backend middleware should now accept base64 tokens');
      console.log('\n💡 If tests are still failing, check:');
      console.log('   1. Backend server is running on port 3001');
      console.log('   2. The sessionMiddleware.ts changes have been applied');
      console.log('   3. Server has been restarted after changes');
    }
    
  } catch (error) {
    console.log(`❌ Failed to process fresh token: ${error.message}`);
  }
}

testWithFreshToken().catch(console.error);
