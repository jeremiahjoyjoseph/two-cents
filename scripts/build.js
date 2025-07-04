#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Get version from package.json
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const version = packageJson.version;

console.log(`🚀 Starting build for Two Cents v${version}`);

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function runCommand(command, description) {
  log(`\n${colors.cyan}${description}...${colors.reset}`);
  try {
    const output = execSync(command, { stdio: 'inherit' });
    log(`${colors.green}✅ ${description} completed successfully${colors.reset}`);
    return output;
  } catch (error) {
    log(`${colors.red}❌ ${description} failed${colors.reset}`, 'red');
    process.exit(1);
  }
}

// Check if EAS CLI is installed
try {
  execSync('eas --version', { stdio: 'ignore' });
} catch (error) {
  log('❌ EAS CLI is not installed. Please install it first:', 'red');
  log('npm install -g @expo/eas-cli', 'yellow');
  process.exit(1);
}

// Check if user is logged in to Expo
try {
  execSync('eas whoami', { stdio: 'ignore' });
} catch (error) {
  log('❌ You are not logged in to Expo. Please login first:', 'red');
  log('eas login', 'yellow');
  process.exit(1);
}

// Build for both platforms
log(`\n${colors.bright}Building for iOS and Android...${colors.reset}`);

try {
  runCommand('eas build --platform all --non-interactive', 'Building for iOS and Android');

  log(`\n${colors.green}🎉 Build completed successfully!${colors.reset}`);
  log(`\n${colors.yellow}Next steps:${colors.reset}`);
  log(
    '1. Check your build status at: https://expo.dev/accounts/[your-username]/projects/two-cents/builds',
    'cyan'
  );
  log('2. Once builds are complete, you can download the apps from the Expo dashboard', 'cyan');
  log('3. Update the README.md with the download links', 'cyan');
} catch (error) {
  log(`\n${colors.red}❌ Build failed${colors.reset}`, 'red');
  log('Check the error messages above for more details.', 'yellow');
  process.exit(1);
}
