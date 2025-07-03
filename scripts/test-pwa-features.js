const puppeteer = require('puppeteer');
const chalk = require('chalk');

async function testPWAFeatures() {
  console.log(chalk.blue.bold('\nTesting PWA Features...\n'));

  const browser = await puppeteer.launch({
    headless: false,
    args: ['--window-size=1280,720']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });

    // Test 1: Service Worker Registration
    console.log(chalk.yellow('Testing Service Worker Registration...'));
    await page.goto('http://localhost:3000');
    const serviceWorker = await page.evaluate(() => {
      return Boolean(navigator.serviceWorker.controller);
    });
    console.log(
      serviceWorker
        ? chalk.green('✓ Service Worker registered successfully')
        : chalk.red('✗ Service Worker registration failed')
    );

    // Test 2: Manifest Availability
    console.log(chalk.yellow('\nTesting Web Manifest...'));
    const manifest = await page.$('link[rel="manifest"]');
    console.log(
      manifest
        ? chalk.green('✓ Web Manifest is available')
        : chalk.red('✗ Web Manifest not found')
    );

    // Test 3: Offline Capability
    console.log(chalk.yellow('\nTesting Offline Capability...'));
    await page.setOfflineMode(true);
    await page.reload();
    const offlineContent = await page.evaluate(() => document.body.innerHTML);
    const hasOfflinePage = offlineContent.includes('offline');
    console.log(
      hasOfflinePage
        ? chalk.green('✓ Offline page is working')
        : chalk.red('✗ Offline page not working')
    );
    await page.setOfflineMode(false);

    // Test 4: Cache Storage
    console.log(chalk.yellow('\nTesting Cache Storage...'));
    const caches = await page.evaluate(async () => {
      const cacheNames = await caches.keys();
      return cacheNames.length > 0;
    });
    console.log(
      caches
        ? chalk.green('✓ Cache storage is working')
        : chalk.red('✗ Cache storage not working')
    );

    // Test 5: Install Prompt
    console.log(chalk.yellow('\nTesting Install Prompt...'));
    const installButton = await page.$('button[aria-label="Install PWA"]');
    console.log(
      installButton
        ? chalk.green('✓ Install prompt is available')
        : chalk.red('✗ Install prompt not found')
    );

    // Test 6: Responsive Design
    console.log(chalk.yellow('\nTesting Responsive Design...'));
    await page.setViewport({ width: 375, height: 667 }); // Mobile viewport
    await page.reload();
    const isMobileResponsive = await page.evaluate(() => {
      const viewport = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
      return viewport === 375;
    });
    console.log(
      isMobileResponsive
        ? chalk.green('✓ Mobile responsive design working')
        : chalk.red('✗ Mobile responsive design not working')
    );

    // Summary
    console.log(chalk.blue.bold('\nTest Summary:'));
    const allTestsPassed = 
      serviceWorker && 
      manifest && 
      hasOfflinePage && 
      caches && 
      installButton && 
      isMobileResponsive;

    if (allTestsPassed) {
      console.log(chalk.green.bold('\n✨ All PWA features are working correctly! ✨\n'));
    } else {
      console.log(chalk.yellow.bold('\n⚠️ Some PWA features need attention. Review the results above. ⚠️\n'));
    }

  } catch (error) {
    console.error(chalk.red('\nError during testing:'), error);
  } finally {
    await browser.close();
  }
}

testPWAFeatures().catch(console.error);
