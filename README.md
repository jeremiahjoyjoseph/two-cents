# Two Cents

Two Cents is a collaborative finance tracking app for couples and partners. It allows users to:

- Track personal and shared transactions
- Link accounts with a partner using a secure code
- Import transactions from Cashew CSV exports
- Manage account settings, theme, and data privacy
- Delete all data or unlink from a partner at any time

Built with Expo, React Native, and Firebase.

## 📱 Downloads

### Latest Release

- **Android**: [Download Android App](https://expo.dev/artifacts/eas/[BUILD_ID].apk) _(Coming Soon)_

### iOS Distribution

iOS builds are available for internal testing through TestFlight or can be distributed via Expo's internal distribution system. Contact the development team for access.

### Previous Releases

Check our [releases page](https://github.com/[your-username]/two-cents/releases) for older versions.

> **Note**: Android download links will be updated after each successful build. To get the latest builds, run `npm run build` and check the Expo dashboard for the download URLs.

## 🏗️ Building

### Prerequisites

1. Install EAS CLI: `npm install -g @expo/eas-cli`
2. Login to Expo: `eas login`
3. Configure your project: `eas build:configure`

### Build Commands

```bash
# Build for all platforms (iOS & Android)
npm run build

# Build for specific platforms
npm run build:ios
npm run build:android

# Build preview versions (for testing)
npm run build:preview
```

### Build Process

1. Run `npm run build` to start the build process
2. Monitor build progress at: https://expo.dev/accounts/[your-username]/projects/two-cents/builds
3. Once complete, download links will be available in the Expo dashboard
4. Update the download links in this README using: `npm run update-links`

## Version Management

This project uses semantic versioning and includes tools for managing versions and releases.

### Current Version

```bash
npm run version:get
```

### Version Management Commands

#### Check Current Version

```bash
npm run version:get
```

#### Bump Version

```bash
# Patch version (1.0.0 -> 1.0.1) - Bug fixes
npm run version:bump:patch

# Minor version (1.0.0 -> 1.1.0) - New features
npm run version:bump:minor

# Major version (1.0.0 -> 2.0.0) - Breaking changes
npm run version:bump:major
```

#### Set Specific Version

```bash
npm run version:set 1.2.3
```

### Release Management

The release process automatically updates the changelog and bumps the version.

#### Create a Release

```bash
# Patch release
npm run release:patch

# Minor release
npm run release:minor

# Major release
npm run release:major
```

#### Release Process

1. Run the release command
2. Review and update the changelog entries
3. Commit your changes
4. Create a git tag: `git tag v1.2.3`
5. Push the tag: `git push origin v1.2.3`
6. Build and deploy your app

### Changelog

All changes are documented in [CHANGELOG.md](./CHANGELOG.md) following the [Keep a Changelog](https://keepachangelog.com/) format.

### Displaying Version in App

Use the `VersionDisplay` component to show the current version:

```tsx
import { VersionDisplay } from '@/components/VersionDisplay';

// In your component
<VersionDisplay showBuildNumber={true} />;
```
