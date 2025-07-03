const webpush = require('web-push');
const { createServer } = require('http');
const next = require('next');
const puppeteer = require('puppeteer');

// VAPID keys configuration
const vapidKeys = {
  publicKey: "BMtO0cCJmp8kM6tgNenwU9N6u5WYUfMWNHX3eim_FV44kgBwHNLZ-B_lIDHZSQOHAYgDaVS78FbsXsm_XujR_GY",
  privateKey: "3aSNvQ2kMtGBLp9OnKHTp8moWaMfRWC_3mBtiwysBwQ"
};

if (!vapidKeys.publicKey || !vapidKeys.privateKey) {
  console.log('VAPID keys not found. Please run: npm run generate:vapid');
  process.exit(1);
}

webpush.setVapidDetails(
  'mailto:estevao@programmer.net', // Replace with your email
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

const PORT = 3000;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

let server;
let browser;

async function waitForServerReady(port) {
  return new Promise((resolve) => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`http://localhost:${port}`);
        if (response.ok) {
          clearInterval(interval);
          resolve();
        }
      } catch (error) {
        // Server not ready yet
      }
    }, 100);
  });
}

async function cleanup() {
  if (browser) {
    try {
      await browser.close();
    } catch (error) {
      console.log('Error closing browser:', error);
    }
  }

  if (server) {
    try {
      await new Promise((resolve) => server.close(resolve));
    } catch (error) {
      console.log('Error closing server:', error);
    }
  }
}

process.on('SIGINT', async () => {
  await cleanup();
  process.exit(0);
});

async function runTests() {
  console.log('\n=== Testing Push Notifications ===\n');

  try {
    // 1. Start Next.js server
    await app.prepare();
    server = createServer(handle);
    
    await new Promise((resolve, reject) => {
      server.listen(PORT, (err) => {
        if (err) reject(err);
        console.log(`> Server ready on http://localhost:${PORT}`);
        resolve();
      });
    });

    // Wait for server to be fully ready
    await waitForServerReady(PORT);

    // 2. Launch browser
    browser = await puppeteer.launch({
      headless: false,
      args: ['--enable-features=WebPushAPI']
    });
    const page = await browser.newPage();

    // Enable console log capture
    page.on('console', msg => console.log('Browser console:', msg.text()));

    // 3. Test service worker registration
    console.log('Testing service worker registration...');
    await page.goto(`http://localhost:${PORT}`);
    
    const swRegistration = await page.evaluate(async () => {
      try {
        const registration = await navigator.serviceWorker.ready;
        return registration.active !== null;
      } catch (error) {
        console.log('SW registration error:', error);
        return false;
      }
    });
    
    if (!swRegistration) {
      throw new Error('Service Worker registration failed');
    }
    console.log('Service Worker registered: ✅');

    // 4. Test permission request
    console.log('\nTesting notification permission...');
    const permission = await page.evaluate(() => {
      return new Promise((resolve) => {
        Notification.requestPermission().then(resolve);
      });
    });
    console.log('Notification permission:', permission);

    if (permission !== 'granted') {
      throw new Error('Notification permission not granted');
    }

    // 5. Test push subscription
    console.log('\nTesting push subscription...');
    const subscription = await page.evaluate(async (vapidPublicKey) => {
      const registration = await navigator.serviceWorker.ready;
      return registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidPublicKey
      });
    }, vapidKeys.publicKey);

    if (!subscription) {
      throw new Error('Push subscription failed');
    }
    console.log('Push subscription created: ✅');

    // 6. Test notification creation
    console.log('\nTesting notification creation...');
    const testNotification = {
      title: 'Test Notification',
      message: 'This is a test notification',
      recipients: {
        specific: ['test-user']
      }
    };

    const response = await page.evaluate(async (notification) => {
      try {
        const res = await fetch('/api/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(notification)
        });
        return res.json();
      } catch (error) {
        console.log('Notification creation error:', error);
        return null;
      }
    }, testNotification);

    if (!response) {
      throw new Error('Notification creation failed');
    }
    console.log('Notification created: ✅');

    // 7. Wait for push notification
    console.log('\nWaiting for push notification...');
    const pushReceived = await page.evaluate(() => {
      return new Promise((resolve) => {
        navigator.serviceWorker.addEventListener('message', (event) => {
          if (event.data.type === 'PUSH_RECEIVED') {
            resolve(true);
          }
        });

        // Longer timeout for push notification
        setTimeout(() => resolve(false), 10000);
      });
    });

    if (!pushReceived) {
      throw new Error('Push notification not received');
    }
    console.log('Push notification received: ✅');

    // 8. Test unsubscribe
    console.log('\nTesting unsubscribe...');
    const unsubscribed = await page.evaluate(async () => {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        if (subscription) {
          return await subscription.unsubscribe();
        }
        return false;
      } catch (error) {
        console.log('Unsubscribe error:', error);
        return false;
      }
    });

    if (!unsubscribed) {
      throw new Error('Unsubscribe failed');
    }
    console.log('Unsubscribed successfully: ✅');

    // All tests passed
    console.log('\n✅ All push notification tests passed!\n');
    await cleanup();
    process.exit(0);

  } catch (error) {
    console.log('\n❌ Test failed:', error.message);
    await cleanup();
    process.exit(1);
  }
}

// Run tests
runTests().catch(async (error) => {
  console.log('Unexpected error:', error);
  await cleanup();
  process.exit(1);
});
