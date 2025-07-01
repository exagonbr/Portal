
const fetch = require('node-fetch');

async function testAuthFlow() {
  console.log('🧪 Testing Authentication Flow...
');

  try {
    // Test 1: Login with proper credentials
    console.log('1️⃣ Testing login...');
    const loginResponse = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: 'admin@portal.com', 
        password: 'admin123' 
      })
    });
    
    const loginData = await loginResponse.json();
    console.log(`Status: ${loginResponse.status}`);
    console.log('Response structure:', Object.keys(loginData));
    
    if (loginData.success && loginData.token) {
      console.log('✅ Login successful - token received');
      console.log('✅ Response format is correct');
      
      // Test 2: Use token to access protected endpoint
      console.log('
2️⃣ Testing token validation...');
      const profileResponse = await fetch('http://localhost:3001/api/auth/profile', {
        headers: { 
          'Authorization': `Bearer ${loginData.token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const profileData = await profileResponse.json();
      console.log(`Profile Status: ${profileResponse.status}`);
      
      if (profileResponse.ok && profileData.success) {
        console.log('✅ Token validation successful');
        console.log('✅ Protected endpoint accessible');
      } else {
        console.log('❌ Token validation failed:', profileData.message);
      }
      
    } else {
      console.log('❌ Login failed:', loginData.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAuthFlow();
