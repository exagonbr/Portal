const chalk = require('chalk');
const fs = require('fs');
const path = require('path');

function checkFile(filePath, description) {
  const fullPath = path.join(process.cwd(), filePath);
  const exists = fs.existsSync(fullPath);
  console.log(
    `${exists ? chalk.green('✓') : chalk.red('✗')} ${description} (${filePath})`
  );
  return exists;
}

function validateManifest() {
  const manifestPath = 'public/manifest.json';
  if (!checkFile(manifestPath, 'Web Manifest')) return false;

  try {
    const manifest = JSON.parse(fs.readFileSync(path.join(process.cwd(), manifestPath), 'utf8'));
    const requiredFields = [
      'name',
      'short_name',
      'start_url',
      'display',
      'background_color',
      'theme_color',
      'icons'
    ];

    const missingFields = requiredFields.filter(field => !manifest[field]);
    
    if (missingFields.length > 0) {
      console.log(chalk.red(`\nMissing required fields in manifest:`));
      missingFields.forEach(field => console.log(chalk.red(`  - ${field}`)));
      return false;
    }

    if (!manifest.icons || !manifest.icons.length) {
      console.log(chalk.red('\nNo icons defined in manifest'));
      return false;
    }

    console.log(chalk.green('\nManifest validation passed ✓'));
    return true;
  } catch (error) {
    console.log(chalk.red(`\nError parsing manifest: ${error.message}`));
    return false;
  }
}

function validateServiceWorker() {
  const swPath = 'public/sw.js';
  if (!checkFile(swPath, 'Service Worker')) return false;

  try {
    const sw = fs.readFileSync(path.join(process.cwd(), swPath), 'utf8');
    
    // Check for essential service worker features
    const checks = {
      'Cache handling': sw.includes('caches.open'),
      'Offline support': sw.includes('fetch'),
      'Cache cleanup': sw.includes('caches.delete'),
      'Skip waiting': sw.includes('skipWaiting'),
      'Clients claim': sw.includes('clients.claim'),
    };

    console.log('\nService Worker features:');
    Object.entries(checks).forEach(([feature, exists]) => {
      console.log(
        `${exists ? chalk.green('✓') : chalk.red('✗')} ${feature}`
      );
    });

    const missingFeatures = Object.entries(checks).filter(([_, exists]) => !exists);
    if (missingFeatures.length > 0) {
      console.log(chalk.yellow('\nWarning: Some recommended features are missing'));
    } else {
      console.log(chalk.green('\nService Worker validation passed ✓'));
    }

    return true;
  } catch (error) {
    console.log(chalk.red(`\nError reading service worker: ${error.message}`));
    return false;
  }
}

function validateNextConfig() {
  const configPath = 'next.config.js';
  if (!checkFile(configPath, 'Next.js Config')) return false;

  try {
    const config = require(path.join(process.cwd(), configPath));
    
    if (!config.pwa) {
      console.log(chalk.red('\nPWA configuration not found in next.config.js'));
      return false;
    }

    console.log(chalk.green('\nNext.js PWA configuration found ✓'));
    return true;
  } catch (error) {
    console.log(chalk.red(`\nError reading Next.js config: ${error.message}`));
    return false;
  }
}

function validateComponents() {
  const components = [
    'src/components/PWARegistration.tsx',
    'src/components/PWAInstallPrompt.tsx',
    'src/components/OfflineIndicator.tsx'
  ];

  console.log('\nChecking PWA components:');
  const allExist = components.every(comp => checkFile(comp, `Component ${path.basename(comp)}`));

  if (allExist) {
    console.log(chalk.green('\nAll PWA components found ✓'));
  }

  return allExist;
}

function runChecks() {
  console.log(chalk.blue.bold('\nVerifying PWA Implementation...\n'));

  const results = {
    manifest: validateManifest(),
    serviceWorker: validateServiceWorker(),
    nextConfig: validateNextConfig(),
    components: validateComponents()
  };

  console.log(chalk.blue.bold('\nSummary:'));
  Object.entries(results).forEach(([check, passed]) => {
    console.log(
      `${passed ? chalk.green('✓') : chalk.red('✗')} ${check}`
    );
  });

  const allPassed = Object.values(results).every(Boolean);
  if (allPassed) {
    console.log(chalk.green.bold('\nAll checks passed! Your PWA is properly configured. ✨'));
  } else {
    console.log(chalk.yellow.bold('\nSome checks failed. Review the issues above. ⚠️'));
  }
}

runChecks();
