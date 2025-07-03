const puppeteer = require('puppeteer');
const chalk = require('chalk');

async function testPWA() {
  console.log(chalk.blue('🔍 Starting PWA tests...\n'));

  const browser = await puppeteer.launch({
    headless: false,
    args: ['--enable-features=NetworkService']
  });

  try {
    const page = await browser.newPage();
    
    // Enable offline mode detection
    await page.setRequestInterception(true);
    page.on('request', request => request.continue());

    // Test 1: Service Worker Registration
    console.log(chalk.yellow('Testing Service Worker Registration...'));
    await page.goto('http://localhost:3000');
    const swRegistration = await page.evaluate(() => {
      return Boolean(navigator.serviceWorker.controller);
    });
    console.log(swRegistration 
      ? chalk.green('✅ Service Worker registered successfully')
      : chalk.red('❌ Service Worker registration failed'));

    // Test 2: Manifest Loading
    console.log(chalk.yellow('\nTesting Web Manifest...'));
    const manifest = await page.evaluate(() => {
      const manifestLink = document.querySelector('link[rel="manifest"]');
      return Boolean(manifestLink);
    });
    console.log(manifest
      ? chalk.green('✅ Web Manifest loaded successfully')
      : chalk.red('❌ Web Manifest not found'));

    // Test 3: Offline Functionality
    console.log(chalk.yellow('\nTesting Offline Functionality...'));
    await page.setOfflineMode(true);
    await page.reload();
    const offlineContent = await page.evaluate(() => {
      return document.body.innerText.includes('offline');
    });
    console.log(offlineContent
      ? chalk.green('✅ Offline page loaded successfully')
      : chalk.red('❌ Offline functionality failed'));
    await page.setOfflineMode(false);

    // Test 4: Cache Storage
    console.log(chalk.yellow('\nTesting Cache Storage...'));
    const caches = await page.evaluate(() => {
      return caches.keys();
    });
    console.log(caches.length > 0
      ? chalk.green(`✅ Cache storage working (${caches.length} caches found)`)
      : chalk.red('❌ No caches found'));

    // Test 5: Install Prompt
    console.log(chalk.yellow('\nTesting Install Prompt...'));
    const installButton = await page.evaluate(() => {
      return Boolean(document.querySelector('button[aria-label="Install PWA"]'));
    });
    console.log(installButton
      ? chalk.green('✅ Install prompt available')
      : chalk.red('❌ Install prompt not found'));

    // Test 6: Notification Permission
    console.log(chalk.yellow('\nTesting Notification Permission...'));
    const notificationPermission = await page.evaluate(() => {
      return Notification.permission;
    });
    console.log(chalk.blue(`ℹ️ Notification permission status: ${notificationPermission}`));

    console.log(chalk.blue('\n📊 Test Summary:'));
    console.log('=====================================');
    console.log(`Service Worker: ${swRegistration ? '✅' : '❌'}`);
    console.log(`Web Manifest: ${manifest ? '✅' : '❌'}`);
    console.log(`Offline Mode: ${offlineContent ? '✅' : '❌'}`);
    console.log(`Cache Storage: ${caches.length > 0 ? '✅' : '❌'}`);
    console.log(`Install Prompt: ${installButton ? '✅' : '❌'}`);
    console.log(`Notifications: ${notificationPermission !== 'denied' ? '✅' : '❌'}`);

  } catch (error) {
    console.error(chalk.red('\n❌ Test failed:'), error);
  } finally {
    await browser.close();
  }
}

testPWA().catch(console.error);
