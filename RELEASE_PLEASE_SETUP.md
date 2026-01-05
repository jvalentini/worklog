# Release-Please Best Practices & Setup Guide

## Overview

Release-Please automates versioning, changelog generation, and release management based on [Conventional Commits](https://www.conventionalcommits.org/).

## How It Works

### Two-Phase Process

1. **Release PR Creation** (runs on push to `main`)
   - Analyzes commits since last release
   - Calculates next version (major/minor/patch)
   - Creates/updates PR with:
     - Version bumps in `package.json` and `.release-please-manifest.json`
     - Updated `CHANGELOG.md`
     - Label: `autorelease: pending`

2. **Tagging** (when release PR is merged)
   - Tags the merged commit with the new version
   - Optionally creates GitHub release (if `skip-github-release: false`)

## Best Practices

### 1. Use Personal Access Token (PAT)

**Problem**: `GITHUB_TOKEN` has limitations:
- Actions triggered by `GITHUB_TOKEN` won't trigger other workflows
- This prevents your `release.yml` workflow from running when tags are created

**Solution**: Create a PAT with these permissions:
- `repo` (full control of private repositories)
  - Or specifically: `contents: write`, `pull-requests: write`, `workflow: write`

**Steps**:
1. Create PAT: GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Add as secret: Repository Settings → Secrets → `RELEASE_PLEASE_TOKEN`
3. Update workflow to use it (already configured)

### 2. Conventional Commits

**Required prefixes for releases**:
- `feat:` → minor version bump
- `fix:` → patch version bump
- `feat!:` or `fix!:` → major version bump (breaking changes)
- `refactor:`, `perf:`, `docs:` → included in changelog but don't bump version

**Non-releasable** (won't trigger release):
- `chore:` (unless configured otherwise)
- `build:`
- `ci:`
- `test:` (unless configured otherwise)

### 3. Workflow Configuration

**Recommended workflow structure**:

```yaml
name: Release Please

on:
  push:
    branches:
      - main
  # Optional: manual trigger
  workflow_dispatch:

permissions:
  contents: write
  pull-requests: write
  issues: write

jobs:
  release-please:
    runs-on: ubuntu-latest
    outputs:
      release_created: ${{ steps.release.outputs.release_created }}
      tag_name: ${{ steps.release.outputs.tag_name }}
    steps:
      - uses: actions/checkout@v4
        with:
          # Important: fetch full history for accurate version calculation
          fetch-depth: 0
      
      - uses: googleapis/release-please-action@v4
        id: release
        with:
          # Use PAT instead of GITHUB_TOKEN
          token: ${{ secrets.RELEASE_PLEASE_TOKEN || secrets.GITHUB_TOKEN }}
          # Optional: specify config file explicitly
          config-file: release-please-config.json
          # Optional: specify manifest file explicitly
          manifest-file: .release-please-manifest.json
```

### 4. Configuration File Best Practices

**Current config** (`release-please-config.json`):
```json
{
  "packages": {
    ".": {
      "release-type": "node",
      "skip-github-release": true,  // Only creates tags, not GitHub releases
      "changelog-sections": [...]
    }
  }
}
```

**Options**:
- `skip-github-release: true` - Only creates tags (good if you have separate release workflow)
- `skip-github-release: false` - Creates both tags and GitHub releases
- `bump-minor-pre-major: false` - Don't bump minor versions before v1.0.0
- `changelog-sections` - Customize changelog organization

### 5. Integration with Build/Release Workflow

**Current setup** (recommended):
- Release-Please creates tags only (`skip-github-release: true`)
- Separate `release.yml` workflow triggers on tag push (`v*`)
- Builds binaries and creates GitHub release with assets

**This is the recommended pattern** because:
- Separation of concerns
- Build artifacts are created from the tagged commit
- More control over release process

### 6. Troubleshooting

**Release-Please not creating PRs?**
1. Check for existing PR with `autorelease: pending` label
2. Verify commits have releasable prefixes (`feat:`, `fix:`)
3. Check workflow runs in Actions tab
4. Verify PAT has correct permissions

**Tags not being created?**
1. Ensure release PR is merged (tags are created on merge)
2. Check that `skip-github-release: true` doesn't prevent tagging (it shouldn't)
3. Verify PAT can create tags

**Force a release**:
- Add `Release-As: x.y.z` footer to a commit message
- Or add `release-please:force-run` label to a PR

### 7. Monitoring

**Check release status**:
```bash
# List open release PRs
gh pr list --label "autorelease"

# Check manifest version
cat .release-please-manifest.json

# Check package.json version
grep version package.json
```

## Current Setup Analysis

### ✅ What's Working
- Workflow triggers on push to main
- Proper permissions configured
- PAT fallback configured
- Separate release workflow for builds
- `skip-github-release: true` (tags only)

### ⚠️ Potential Issues
1. **Missing `fetch-depth: 0`** - May not fetch full history for accurate version calculation
2. **No explicit config/manifest paths** - Should specify explicitly
3. **PAT may not be set** - Check if `RELEASE_PLEASE_TOKEN` secret exists

### 🔧 Recommended Improvements

1. Add `fetch-depth: 0` to checkout step
2. Explicitly specify config and manifest files
3. Add `workflow_dispatch` for manual triggers
4. Verify PAT secret exists and has correct permissions

## Next Steps

1. **Verify PAT exists**: Check repository secrets
2. **Check for open release PR**: `gh pr list --label "autorelease"`
3. **Review recent commits**: Ensure they have `feat:` or `fix:` prefixes
4. **Check workflow runs**: Verify release-please workflow is running
5. **Update workflow**: Apply recommended improvements above
