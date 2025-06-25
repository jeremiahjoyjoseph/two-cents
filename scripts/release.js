#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const CHANGELOG_PATH = path.join(__dirname, '..', 'CHANGELOG.md');

function readChangelog() {
  try {
    return fs.readFileSync(CHANGELOG_PATH, 'utf8');
  } catch (error) {
    console.error('Error reading CHANGELOG.md:', error.message);
    process.exit(1);
  }
}

function writeChangelog(content) {
  try {
    fs.writeFileSync(CHANGELOG_PATH, content);
  } catch (error) {
    console.error('Error writing CHANGELOG.md:', error.message);
    process.exit(1);
  }
}

function getCurrentDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function createRelease(version, type = 'patch') {
  console.log(`Creating release for version ${version}...`);

  // Read current changelog
  const changelog = readChangelog();

  // Get current date
  const releaseDate = getCurrentDate();

  // Create new version entry
  const newVersionEntry = `## [${version}] - ${releaseDate}

### Added
- [Add new features here]

### Changed
- [Add changes here]

### Fixed
- [Add bug fixes here]

### Removed
- [Add removed features here]

`;

  // Replace [Unreleased] with the new version entry
  const updatedChangelog = changelog.replace(
    /## \[Unreleased\]/,
    `## [Unreleased]

### Added
- [Add new features here]

### Changed
- [Add changes here]

### Fixed
- [Add bug fixes here]

### Removed
- [Add removed features here]

${newVersionEntry}`
  );

  // Write updated changelog
  writeChangelog(updatedChangelog);
  console.log(`✓ Updated CHANGELOG.md with version ${version}`);

  // Bump version
  try {
    execSync(`node scripts/version.js bump ${type}`, { stdio: 'inherit' });
  } catch (error) {
    console.error('Error bumping version:', error.message);
    process.exit(1);
  }

  console.log('\n🎉 Release preparation complete!');
  console.log('\nNext steps:');
  console.log('1. Review and update the changelog entries');
  console.log('2. Commit your changes');
  console.log('3. Create a git tag: git tag v' + version);
  console.log('4. Push the tag: git push origin v' + version);
  console.log('5. Build and deploy your app');
}

function showHelp() {
  console.log(`
Release Management Script

Usage:
  node scripts/release.js <type>

Types:
  patch    - Bug fixes and minor updates (1.0.0 -> 1.0.1)
  minor    - New features, backward compatible (1.0.0 -> 1.1.0)
  major    - Breaking changes (1.0.0 -> 2.0.0)

Examples:
  node scripts/release.js patch
  node scripts/release.js minor
  node scripts/release.js major
`);
}

function main() {
  const args = process.argv.slice(2);
  const type = args[0];

  if (!type || !['patch', 'minor', 'major'].includes(type)) {
    if (!type) {
      console.error('Error: Release type required');
    }
    showHelp();
    process.exit(1);
  }

  // Get current version to create the new version entry
  const { getCurrentVersion, bumpVersion } = require('./version.js');
  const currentVersion = getCurrentVersion();

  // Calculate new version
  const [major, minor, patch] = currentVersion.split('.').map(Number);
  let newVersion;
  switch (type) {
    case 'major':
      newVersion = `${major + 1}.0.0`;
      break;
    case 'minor':
      newVersion = `${major}.${minor + 1}.0`;
      break;
    case 'patch':
      newVersion = `${major}.${minor}.${patch + 1}`;
      break;
  }

  createRelease(newVersion, type);
}

if (require.main === module) {
  main();
}
