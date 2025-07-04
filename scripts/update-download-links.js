#!/usr/bin/env node

const fs = require('fs');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function updateReadme(androidLink) {
  const readmePath = 'README.md';
  let readmeContent = fs.readFileSync(readmePath, 'utf8');

  // Update Android download link
  readmeContent = readmeContent.replace(
    /- \*\*Android\*\*: \[Download Android App\]\([^)]+\)/,
    `- **Android**: [Download Android App](${androidLink})`
  );

  // Remove the "(Coming Soon)" text
  readmeContent = readmeContent.replace(/\s*_\*Coming Soon\*\)_/g, '');

  fs.writeFileSync(readmePath, readmeContent);
  console.log('✅ README.md updated with Android download link!');
}

function promptForLinks() {
  console.log('\n📱 Update Android Download Link in README\n');

  rl.question('Enter Android download link: ', androidLink => {
    if (androidLink) {
      updateReadme(androidLink);
    } else {
      console.log('❌ Android link is required');
    }
    rl.close();
  });
}

// Get version from package.json
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const version = packageJson.version;

console.log(`🚀 Updating download links for Two Cents v${version}`);

promptForLinks();
