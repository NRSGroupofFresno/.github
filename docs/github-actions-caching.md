# GitHub Actions Dependency Caching Guide

This document provides comprehensive guidance on using caching in GitHub Actions workflows to speed up builds and reduce redundant dependency installations.

## Table of Contents

- [Overview](#overview)
- [Cache Action Behavior](#cache-action-behavior)
- [Input/Output Parameters](#inputoutput-parameters)
- [Cache Key Creation](#cache-key-creation)
- [Complete Examples](#complete-examples)
- [Key Matching Process](#key-matching-process)
- [Setup Actions with Built-in Caching](#setup-actions-with-built-in-caching)
- [Access Restrictions](#access-restrictions)
- [Usage Limits](#usage-limits)
- [Best Practices](#best-practices)
- [Current Project Usage](#current-project-usage)

---

## Overview

GitHub Actions caching allows you to store and restore dependencies, build outputs, and other files between workflow runs. This significantly reduces execution time by avoiding repeated downloads and builds.

The primary caching mechanism is provided by the `actions/cache` action, while many setup actions (like `actions/setup-node`) include built-in caching support.

---

## Cache Action Behavior

### Exact Match

When a cache key exactly matches an existing cache entry, it's called an **exact match** (cache hit). The cached files are restored to the specified path immediately.

### Partial Match

When no exact match exists but a `restore-keys` pattern matches, it's called a **partial match**. The most recently created cache that matches the restore key is used.

### Search Sequence

The cache restoration follows this order:

1. **Exact match**: Check for a cache with the exact `key` value
2. **Restore keys**: If no exact match, search through `restore-keys` in order
3. **Prefix matching**: Each restore key is matched as a prefix against existing caches
4. **Most recent selection**: If multiple caches match, the most recently created one is selected

---

## Input/Output Parameters

### Inputs

| Parameter | Required | Description |
|-----------|----------|-------------|
| `key` | Yes | The cache key to use for saving/restoring |
| `path` | Yes | Path(s) to cache (file, directory, or glob pattern) |
| `restore-keys` | No | Ordered list of fallback keys for partial matching |
| `enableCrossOsArchive` | No | Enable cross-OS cache restoration (default: false) |

### Outputs

| Output | Description |
|--------|-------------|
| `cache-hit` | Boolean indicating if an exact match was found (`'true'` or `'false'`) |

### Example Usage

```yaml
- uses: actions/cache@v4
  id: cache
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-node-

- name: Install dependencies
  if: steps.cache.outputs.cache-hit != 'true'
  run: npm ci
```

---

## Cache Key Creation

### Using `hashFiles()`

The `hashFiles()` function creates a hash from one or more files, typically lock files:

```yaml
# Single file
key: ${{ runner.os }}-npm-${{ hashFiles('package-lock.json') }}

# Multiple files with glob
key: ${{ runner.os }}-npm-${{ hashFiles('**/package-lock.json') }}

# Multiple patterns
key: ${{ runner.os }}-build-${{ hashFiles('**/*.gradle*', '**/gradle-wrapper.properties') }}
```

### Using Expressions

Combine multiple context values for unique keys:

```yaml
# Include branch name
key: ${{ runner.os }}-${{ github.ref }}-npm-${{ hashFiles('package-lock.json') }}

# Include run ID for unique per-run caches
key: build-${{ github.run_id }}-${{ github.run_attempt }}
```

### Multi-Component Keys

Build keys from multiple components for granular cache control:

```yaml
key: ${{ runner.os }}-${{ runner.arch }}-node-${{ matrix.node-version }}-${{ hashFiles('package-lock.json') }}
```

### Key Design Principles

1. **Include OS**: Different operating systems have different binary formats
2. **Include dependency hash**: Invalidate when dependencies change
3. **Use prefixes**: Enable effective restore-keys matching
4. **Be specific**: More specific keys reduce unnecessary cache restores

---

## Complete Examples

### npm Caching Workflow

```yaml
name: Node.js CI with Caching

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Cache node modules
        id: cache-npm
        uses: actions/cache@v4
        with:
          path: ~/.npm
          key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
          restore-keys: |
            ${{ runner.os }}-node-

      - name: Install dependencies
        if: steps.cache-npm.outputs.cache-hit != 'true'
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Build
        run: npm run build
```

### Caching node_modules Directly

```yaml
- name: Cache node_modules
  id: cache-node-modules
  uses: actions/cache@v4
  with:
    path: node_modules
    key: ${{ runner.os }}-node-modules-${{ hashFiles('**/package-lock.json') }}

- name: Install dependencies
  if: steps.cache-node-modules.outputs.cache-hit != 'true'
  run: npm ci
```

### Multiple Path Caching

```yaml
- uses: actions/cache@v4
  with:
    path: |
      ~/.npm
      node_modules
      .next/cache
    key: ${{ runner.os }}-nextjs-${{ hashFiles('**/package-lock.json') }}-${{ hashFiles('**/*.js', '**/*.jsx', '**/*.ts', '**/*.tsx') }}
    restore-keys: |
      ${{ runner.os }}-nextjs-${{ hashFiles('**/package-lock.json') }}-
      ${{ runner.os }}-nextjs-
```

---

## Key Matching Process

### Search Order

1. Search for exact `key` match in current branch
2. Search for exact `key` match in base branch (for PRs)
3. Search for exact `key` match in default branch
4. Iterate through `restore-keys` in order, using prefix matching
5. Select most recently created cache among matches

### Priority Rules

- **Exact matches** always take precedence over partial matches
- **Current branch** caches are searched before base/default branch
- **More specific** restore-keys should be listed before less specific ones
- **Most recent** cache wins when multiple caches match the same key

### PR-Specific Behavior

Pull requests have restricted cache access:

- **Can read**: Caches from the PR branch, base branch, and default branch
- **Can write**: Only to the PR branch's cache scope
- **Cannot access**: Caches from other unrelated branches

```
PR branch (feature/xyz) can access:
├── feature/xyz caches (read/write)
├── main caches (read only)
└── default branch caches (read only)
```

---

## Setup Actions with Built-in Caching

Many setup actions include built-in caching support, simplifying configuration:

### Node.js (actions/setup-node)

```yaml
- uses: actions/setup-node@v4
  with:
    node-version: '20'
    cache: 'npm'  # or 'yarn', 'pnpm'
```

### Python (actions/setup-python)

```yaml
- uses: actions/setup-python@v5
  with:
    python-version: '3.12'
    cache: 'pip'  # or 'pipenv', 'poetry'
```

### Gradle (actions/setup-java)

```yaml
- uses: actions/setup-java@v4
  with:
    distribution: 'temurin'
    java-version: '21'
    cache: 'gradle'  # or 'maven', 'sbt'
```

### Ruby (ruby/setup-ruby)

```yaml
- uses: ruby/setup-ruby@v1
  with:
    ruby-version: '3.3'
    bundler-cache: true
```

### Go (actions/setup-go)

```yaml
- uses: actions/setup-go@v5
  with:
    go-version: '1.22'
    cache: true
```

### .NET (actions/setup-dotnet)

```yaml
- uses: actions/setup-dotnet@v4
  with:
    dotnet-version: '8.0.x'
    cache: true
    cache-dependency-path: '**/packages.lock.json'
```

---

## Access Restrictions

### Branch Isolation Rules

Caches are isolated by branch with specific access patterns:

| Context | Read Access | Write Access |
|---------|-------------|--------------|
| Feature branch | Own branch + base + default | Own branch only |
| Pull request | PR branch + base + default | PR branch only |
| Default branch | Default branch only | Default branch |
| Tags | Default branch | Cannot write |

### Security Boundaries

- **Fork restrictions**: Forked repositories cannot access caches from the upstream repository
- **Repository isolation**: Caches are strictly isolated between repositories
- **Workflow isolation**: All workflows in a repository share the same cache namespace
- **Token scope**: Cache access uses the `GITHUB_TOKEN` with repository scope

### Cross-OS Considerations

By default, caches are OS-specific. Enable `enableCrossOsArchive` for cross-platform sharing:

```yaml
- uses: actions/cache@v4
  with:
    path: ./my-cache
    key: cross-os-cache-${{ hashFiles('data.json') }}
    enableCrossOsArchive: true
```

---

## Usage Limits

### Storage Limits

| Limit | Value |
|-------|-------|
| Default storage per repository | 10 GB |
| Maximum storage (configurable) | Varies by plan |
| Individual cache size limit | 10 GB |

### Expiration Policy

- **Automatic expiry**: Caches not accessed for **7 days** are automatically deleted
- **FIFO eviction**: When storage limit is reached, oldest caches are deleted first
- **No manual expiry control**: Cannot set custom expiration times

### Eviction Behavior

```
Cache storage at limit:
1. List all caches by last access time
2. Delete oldest accessed caches
3. Continue until under storage limit
4. New cache is saved
```

### Monitoring Usage

View cache usage in repository settings:
- Settings > Actions > Caches
- Shows total size, individual cache sizes, and last access times

---

## Best Practices

### What to Cache

**Good candidates:**
- Package manager caches (`~/.npm`, `~/.cache/pip`, `~/.gradle`)
- Downloaded dependencies (`node_modules`, `vendor`)
- Build outputs that are expensive to recreate
- Compiled artifacts that don't change frequently

**Avoid caching:**
- Frequently changing files (defeats the purpose)
- Sensitive data (tokens, credentials, secrets)
- Large files that compress poorly
- Files with absolute paths that vary between runners

### Security Considerations

1. **Never cache secrets**: Cached data persists and could be accessed by other workflows
2. **Validate restored caches**: Verify integrity of restored files when security matters
3. **Be cautious with PR caches**: PRs from forks have limited cache access for security
4. **Review cache contents**: Audit what's being cached periodically

### Common Pitfalls

| Pitfall | Solution |
|---------|----------|
| Cache key never matches | Check for typos, verify `hashFiles()` paths exist |
| Cache too large | Split into multiple smaller caches, exclude unnecessary files |
| Stale cache causing issues | Include more specific hashes in key, use save-always for debugging |
| Cross-OS cache failures | Enable `enableCrossOsArchive` or use OS-specific keys |
| Cache not restoring in PRs | Ensure base branch has caches, check branch access rules |

### Restore Keys Strategy

Order restore-keys from most specific to least specific:

```yaml
restore-keys: |
  ${{ runner.os }}-node-${{ github.ref }}-
  ${{ runner.os }}-node-main-
  ${{ runner.os }}-node-
  ${{ runner.os }}-
```

### Conditional Cache Saving

Use `actions/cache/save` and `actions/cache/restore` for fine-grained control:

```yaml
- uses: actions/cache/restore@v4
  id: cache
  with:
    path: ~/.npm
    key: ${{ runner.os }}-npm-${{ hashFiles('package-lock.json') }}

# ... do work ...

- uses: actions/cache/save@v4
  if: always() && steps.cache.outputs.cache-hit != 'true'
  with:
    path: ~/.npm
    key: ${{ runner.os }}-npm-${{ hashFiles('package-lock.json') }}
```

---

## Current Project Usage

This repository uses GitHub Actions with built-in caching support. The recommended approach for this project is to use `actions/setup-node` with its integrated caching feature:

```yaml
- uses: actions/setup-node@v4
  with:
    node-version: '20'
    cache: 'npm'
```

This approach:
- Automatically determines the correct cache path for npm
- Creates appropriate cache keys based on `package-lock.json`
- Handles cache restoration and saving transparently
- Reduces workflow configuration complexity

For more complex caching needs (multiple cache paths, custom keys), consider using `actions/cache` directly as shown in the examples above.

---

## Additional Resources

- [GitHub Actions Cache Action](https://github.com/actions/cache)
- [Caching dependencies to speed up workflows](https://docs.github.com/en/actions/using-workflows/caching-dependencies-to-speed-up-workflows)
- [actions/setup-node](https://github.com/actions/setup-node)
- [GitHub Actions documentation](https://docs.github.com/en/actions)
