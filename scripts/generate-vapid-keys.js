const webpush = require('web-push');

// Generate VAPID keys
const vapidKeys = webpush.generateVAPIDKeys();

console.log('\n=== VAPID Keys for Web Push Notifications ===\n');
console.log('Public Key:');
console.log(vapidKeys.publicKey);
console.log('\nPrivate Key:');
console.log(vapidKeys.privateKey);

console.log('\n=== Instructions ===');
console.log('1. Create a .env file in the root directory');
console.log('2. Add the following environment variables:');
console.log(`
NEXT_PUBLIC_VAPID_PUBLIC_KEY=${vapidKeys.publicKey}
VAPID_PRIVATE_KEY=${vapidKeys.privateKey}
VAPID_EMAIL=your_email@example.com  # Replace with your email
`);
console.log('3. Update your email in the .env file');
console.log('4. Restart your development server\n');
