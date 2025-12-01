# Changing the Default Branch

This document provides guidance on managing and changing the default branch in GitHub repositories.

## Table of Contents

- [Overview](#overview)
- [About the Default Branch](#about-the-default-branch)
- [Prerequisites](#prerequisites)
- [Changing the Default Branch](#changing-the-default-branch-1)
- [Impact of Changing the Default Branch](#impact-of-changing-the-default-branch)
- [Related Operations](#related-operations)
- [Best Practices](#best-practices)

---

## Overview

The default branch is the base branch for pull requests and code commits in your repository. When someone visits your repository, the default branch is shown first. You can configure any branch as the default branch, provided your repository has more than one branch.

**Required permissions:** Admin access to the repository is required to change the default branch.

---

## About the Default Branch

The default branch serves several important functions:

| Function | Description |
|----------|-------------|
| **Base for PRs** | New pull requests are automatically targeted to the default branch |
| **Code commits** | Initial clones check out the default branch |
| **Repository landing** | Visitors see the default branch content first |
| **CI/CD triggers** | Many workflows trigger on pushes to the default branch |
| **Branch protection** | Often the most protected branch in the repository |

### Common Default Branch Names

- `main` - The current standard for new repositories
- `master` - Legacy default (still common in older repositories)
- `develop` - Used in GitFlow workflows
- `trunk` - Alternative naming convention

---

## Prerequisites

Before changing the default branch, ensure:

1. **Multiple branches exist** - Your repository must have more than one branch
2. **Admin access** - You must have admin permissions for the repository
3. **Target branch exists** - The branch you want to set as default must already exist

To create a new branch if needed:

```bash
# Create and push a new branch
git checkout -b new-branch-name
git push -u origin new-branch-name
```

---

## Changing the Default Branch

### Via GitHub Web Interface

1. Navigate to the main page of your repository on GitHub
2. Click **Settings** (under the repository name)
   - If you don't see the Settings tab, click the dropdown menu and select Settings
3. Under "Default branch", click the switch icon (⇄) next to the current default branch name
4. Select the branch dropdown menu and choose a new default branch
5. Click **Update**
6. Read the warning message, then click **I understand, update the default branch**

### Via GitHub CLI

```bash
# View current default branch
gh repo view --json defaultBranchRef --jq '.defaultBranchRef.name'

# Change default branch (requires admin access)
gh api -X PATCH repos/{owner}/{repo} -f default_branch=new-branch-name
```

### Via GitHub API

```bash
curl -X PATCH \
  -H "Authorization: token YOUR_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/repos/OWNER/REPO \
  -d '{"default_branch":"new-branch-name"}'
```

---

## Impact of Changing the Default Branch

Changing the default branch has several implications:

### Immediate Effects

| Area | Impact |
|------|--------|
| **Pull requests** | New PRs will target the new default branch |
| **Branch protection** | Rules may need updating for the new branch |
| **Repository view** | The new branch content displays on the main page |
| **Clone operations** | New clones will check out the new default branch |

### What Updates Automatically

- Open pull requests targeting the old default branch are **not** automatically retargeted
- GitHub Pages settings may need manual updating
- Branch protection rules on the old branch remain but may need adjustment

### What Requires Manual Updates

1. **Open pull requests** - May need to be retargeted manually
2. **CI/CD workflows** - Update workflow triggers if they reference the old branch name
3. **Documentation** - Update any references to the old branch name
4. **External integrations** - Services that reference the branch by name
5. **Local clones** - Collaborators may need to update their local configuration

### Updating Local Repositories

Collaborators should update their local repositories:

```bash
# Fetch the latest branches
git fetch origin

# Update the local default branch reference
git remote set-head origin -a

# Switch to the new default branch
git checkout new-default-branch

# Optionally delete the old local branch
git branch -d old-default-branch
```

---

## Related Operations

### Renaming a Branch

Instead of changing the default branch, you may want to rename an existing branch:

```bash
# Rename local branch
git branch -m old-name new-name

# Push the new branch and delete the old one
git push origin -u new-name
git push origin --delete old-name
```

GitHub also provides a web interface for renaming branches in Settings > Branches.

### Setting Default Branch Name for New Repositories

Configure the default branch name for all new repositories:

**Personal account:**
1. Go to Settings > Repositories
2. Under "Repository default branch", change the default branch name

**Organization:**
1. Go to Organization Settings > Repository defaults
2. Under "Repository default branch", set the preferred name

**Enterprise (if applicable):**
Enterprise administrators can enforce a default branch name across all organizations.

---

## Best Practices

### Before Changing

- [ ] Notify all collaborators about the upcoming change
- [ ] Review open pull requests that may be affected
- [ ] Document the change in your team communication channels
- [ ] Plan the change during low-activity periods

### Naming Conventions

| Recommendation | Reason |
|----------------|--------|
| Use `main` for new projects | Industry standard, inclusive language |
| Be consistent across repositories | Reduces confusion for contributors |
| Avoid special characters | Prevents issues with scripts and tools |

### Security Considerations

1. **Apply branch protection** to the new default branch immediately
2. **Require pull request reviews** before merging to the default branch
3. **Enable status checks** to ensure CI passes before merging
4. **Restrict who can push** directly to the default branch

Example branch protection settings to apply:

```
Recommended protection rules for default branch:
├── Require pull request reviews (at least 1 reviewer)
├── Require status checks to pass
├── Require conversation resolution before merging
├── Require signed commits (if applicable)
├── Include administrators in restrictions
└── Restrict who can push to matching branches
```

### After Changing

- [ ] Verify the new default branch displays correctly
- [ ] Test that new PRs target the correct branch
- [ ] Update CI/CD workflows if needed
- [ ] Update documentation references
- [ ] Communicate completion to team members

---

## Additional Resources

- [About branches](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-branches)
- [Renaming a branch](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-branches-in-your-repository/renaming-a-branch)
- [Managing branch protection rules](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/managing-a-branch-protection-rule)
- [GitHub CLI documentation](https://cli.github.com/manual/)
