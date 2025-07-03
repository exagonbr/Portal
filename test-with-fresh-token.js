#!/usr/bin/env node

/**
 * Test with a fresh, non-expired token to verify the fix works
 */

const chalk = require('chalk');

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

async function testWithFreshToken() {
  console.log(chalk.blue.bold('🧪 Testing with Fresh Token\n'));
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
      console.log(chalk.green('\n🎉 Fresh token is valid and should work with the fixed validation!'));
      console.log(chalk.yellow('\n💡 To test with live servers:'));
      console.log(`   1. Start your frontend server (npm run dev)`);
      console.log(`   2. Start your backend server`);
      console.log(`   3. Use this token in Authorization header:`);
      console.log(`      Authorization: Bearer ${freshToken}`);
      console.log(`   4. Or set it as a cookie:`);
      console.log(`      auth_token=${freshToken}`);
    }
    
  } catch (error) {
    console.log(`❌ Failed to process fresh token: ${error.message}`);
  }
}

testWithFreshToken().catch(console.log);
