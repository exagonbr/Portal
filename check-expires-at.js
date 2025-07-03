const fetch = require('node-fetch');

async function checkExpiresAt() {
  const response = await fetch('http://localhost:3001/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      email: 'admin@portal.com', 
      password: 'admin123' 
    })
  });
  
  const data = await response.json();
  console.log('expires_at present:', !!data.expires_at);
  console.log('expires_at value:', data.expires_at);
  console.log('All keys:', Object.keys(data));
}

checkExpiresAt(); 