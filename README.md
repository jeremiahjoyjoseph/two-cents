# Two Cents

Two Cents is a collaborative finance tracking app for couples and partners. It allows users to:

- Track personal and shared transactions
- Link accounts with a partner using a secure code
- Import transactions from Cashew CSV exports
- Manage account settings, theme, and data privacy
- Delete all data or unlink from a partner at any time

Built with Expo, React Native, and Firebase.

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
