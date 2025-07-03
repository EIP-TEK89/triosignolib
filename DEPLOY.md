# Automatic Deployment Configuration on npm

This document explains how to configure and use the automatic deployment process for the `triosigno-lib` packages.

## GitHub Actions

The project uses GitHub Actions to automate the npm package publishing process. The workflow is defined in `.github/workflows/deploy.yml`.

### Workflow Triggers

The workflow can be triggered in two ways:

- **Manually from the GitHub interface**:
  1. Go to the "Actions" tab of the repository
  2. Select the "Deploy NPM Packages" workflow
  3. Click "Run workflow"
  4. Choose the version update type (patch, minor, major)
  5. Click "Run workflow"

- **Automatically when creating a new GitHub release**:
  1. Go to the "Releases" tab of the repository
  2. Click "Draft a new release"
  3. Create a version tag (e.g., `v1.2.0`)
  4. Fill in the other release information
  5. Click "Publish release"

  The workflow will automatically use the version number from the tag (without the 'v' prefix) to update all packages.

### Required Configuration

To ensure the workflow works correctly, you must configure a GitHub secret named `NPM_TOKEN`:

1. Create an npm access token:
   - Log in to your npm account (https://www.npmjs.com/)
   - Go to your account settings
   - Navigate to "Access Tokens"
   - Create a new "Automation" token with "Read and write" permissions
   - Copy the generated token

2. Add the token as a GitHub secret:
   - Go to your GitHub repository settings
   - Navigate to "Secrets and variables" > "Actions"
   - Click "New repository secret"
   - Name: `NPM_TOKEN`
   - Value: Paste the npm token you copied earlier
   - Click "Add secret"

## Manual Publishing

If you prefer to publish packages manually, you can still use the `publish.sh` script:

```bash
# Run in dry-run mode (no actual publishing)
./publish.sh --dry-run

# Run with actual publishing
./publish.sh
```

## Version Management

The project uses the `version.sh` script to manage versions across all packages consistently. This script updates versions in all `package.json` files and ensures internal dependencies are correctly set.

### Using the Versioning Script

```bash
# Increment patch version (0.1.0 -> 0.1.1)
./version.sh patch

# Increment minor version (0.1.0 -> 0.2.0)
./version.sh minor

# Increment major version (0.1.0 -> 1.0.0)
./version.sh major

# Set a specific version
./version.sh 2.0.0
```

### Versioning in GitHub Actions

When manually triggering the deployment workflow, you can specify the version update type (patch, minor, major) or a specific version. The workflow will update versions, commit the changes, and publish the packages.

If the workflow is triggered by creating a GitHub release, the version will be extracted from the release tag. For example, if you create a release with the tag `v1.2.3`, the packages will be versioned as `1.2.3`.

## Automatic Deployment Specifics

### Handling "detached HEAD" in GitHub Actions

When the workflow runs via a GitHub release, the checkout action operates in a "detached HEAD" state because GitHub Actions checks out the code at the release tag instead of a branch. This can cause issues when trying to commit and push version changes.

Our workflow addresses this as follows:

1. **Detecting the target branch**: On a release event, the workflow automatically determines the repository's default branch (usually `main` or `master`).

2. **Handling detached HEAD**: If the workflow detects a "detached HEAD" state, it:
   - Fetches the latest version of the target branch
   - Creates a new temporary branch based on the target branch
   - Applies the version changes
   - Pushes the changes to the target branch

This approach ensures that version updates are properly committed and pushed to the repository, even when the workflow is triggered by a release.

### Precautions and Limitations

- Ensure the GitHub token used has sufficient permissions to push commits to the target branch.
- If you have strict branch protection rules, you may need to adjust them to allow the GitHub Actions workflow to push directly to the protected branch.

## Script Structure

All scripts are organized in the `scripts/` directory:

- `scripts/publish.sh`: Main script orchestrating the entire publishing process
- `scripts/publish-core.sh`: Publishes the core package
- `scripts/publish-web.sh`: Publishes the web package
- `scripts/publish-mobile.sh`: Publishes the mobile package
- `scripts/version.sh`: Manages version updates across all packages

For convenience, symbolic links to the main scripts are available at the project root:

- `./publish.sh` -> `scripts/publish.sh`
- `./version.sh` -> `scripts/version.sh`

The scripts are designed to be run in a CI/CD environment and include various checks and validations to ensure the publishing process runs smoothly.
