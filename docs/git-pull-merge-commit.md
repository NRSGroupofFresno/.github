# Git Pull, Merge, and Commit Guide

This document provides comprehensive guidance on the fundamental Git operations: pull, merge, and commit. These are essential commands for collaborative development workflows.

## Table of Contents

- [Overview](#overview)
- [Git Commit](#git-commit)
- [Git Pull](#git-pull)
- [Git Merge](#git-merge)
- [Common Workflows](#common-workflows)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

---

## Overview

Understanding pull, merge, and commit operations is fundamental to working with Git and GitHub. These commands enable you to save changes, incorporate updates from others, and combine different lines of development.

| Operation | Purpose | When to Use |
|-----------|---------|-------------|
| **Commit** | Save changes to local repository | After completing a logical unit of work |
| **Pull** | Fetch and merge changes from remote | Before starting new work or pushing changes |
| **Merge** | Combine branches together | Integrating feature branches or updates |

---

## Git Commit

### What is a Commit?

A commit is a snapshot of your repository at a specific point in time. Each commit records changes to files and includes metadata like author, timestamp, and a descriptive message.

### Basic Commit Workflow

```bash
# 1. Check status of your working directory
git status

# 2. Stage specific files for commit
git add <file1> <file2>

# Or stage all modified files
git add .

# 3. Commit with a descriptive message
git commit -m "Add feature: user authentication"
```

### Commit Message Best Practices

**Good commit messages:**
- Start with a verb in present tense (Add, Fix, Update, Remove)
- Keep the first line under 50 characters
- Provide additional details in the body if needed

**Examples:**

```bash
# Good commit messages
git commit -m "Fix navigation menu alignment on mobile devices"
git commit -m "Add user profile validation logic"
git commit -m "Update dependencies to latest stable versions"

# Multi-line commit message (subject and body)
git commit -m "Refactor authentication module" -m "Extract validation logic into separate functions. Add comprehensive error handling and update tests to cover new scenarios."
```

### Amending Commits

If you need to modify the most recent commit:

```bash
# Amend the last commit (add forgotten files or fix message)
git add forgotten-file.js
git commit --amend

# Amend just the commit message
git commit --amend -m "Corrected commit message"
```

**Warning:** Only amend commits that haven't been pushed to a shared repository.

### Viewing Commit History

```bash
# View commit history
git log

# Compact one-line format
git log --oneline

# Show last 5 commits
git log -5

# Show commits with file changes
git log --stat

# Show commits with actual changes
git log -p
```

---

## Git Pull

### What is Pull?

`git pull` fetches changes from a remote repository and merges them into your current branch. It's essentially a combination of `git fetch` followed by `git merge`.

### Basic Pull Workflow

```bash
# Pull changes from the default remote branch
git pull

# Pull from specific remote and branch
git pull origin main

# Pull with rebase instead of merge
git pull --rebase
```

### Pull vs Fetch

| Command | What it Does |
|---------|--------------|
| `git fetch` | Downloads changes but doesn't merge them |
| `git pull` | Downloads changes and automatically merges them |

**When to use fetch instead of pull:**

```bash
# 1. Fetch changes to review before merging
git fetch origin

# 2. View what changed
git log HEAD...origin/main  # See commits that differ
git diff HEAD..origin/main  # See actual file changes

# 3. Merge when ready
git merge origin/main
```

### Handling Pull Conflicts

If `git pull` results in conflicts:

```bash
# 1. Git will mark conflicting files
# Conflicted files will contain markers like:
# <<<<<<< HEAD
# Your changes
# =======
# Incoming changes
# >>>>>>> branch-name

# 2. Open conflicted files and resolve conflicts manually

# 3. After resolving, stage the files
git add resolved-file.js

# 4. Complete the merge
git commit -m "Merge changes from origin/main"
```

### Pull Options

```bash
# Pull and rebase your commits on top of fetched commits
git pull --rebase

# Pull only if fast-forward is possible (no merge commit)
git pull --ff-only

# Pull but don't automatically commit the merge
git pull --no-commit

# Pull and automatically choose their changes in conflicts
git pull -X theirs

# Pull and automatically choose your changes in conflicts
git pull -X ours
```

---

## Git Merge

### What is Merge?

Merging combines changes from different branches. It's used to integrate feature branches, incorporate updates, and maintain parallel development lines.

### Types of Merges

#### 1. Fast-Forward Merge

Occurs when the target branch hasn't diverged from the source branch:

```bash
# Create and switch to feature branch
git checkout -b feature/new-login

# Make commits...
git commit -m "Add login form"

# Switch back to main
git checkout main

# Fast-forward merge (no merge commit created)
git merge feature/new-login
```

#### 2. Three-Way Merge

Occurs when both branches have diverged:

```bash
# Merge feature branch into main (creates merge commit)
git checkout main
git merge feature/new-feature

# With custom merge commit message
git merge feature/new-feature -m "Merge new feature implementation"
```

#### 3. Squash Merge

Combines all commits from the feature branch into a single commit:

```bash
# Squash all commits from feature branch into one
git merge --squash feature/experimental

# Then commit the squashed changes
git commit -m "Add experimental feature (squashed)"
```

### Merge Workflow

```bash
# 1. Ensure you're on the target branch
git checkout main

# 2. Make sure your branch is up to date
git pull origin main

# 3. Merge the feature branch
git merge feature/my-feature

# 4. If no conflicts, push the changes
git push origin main
```

### Handling Merge Conflicts

When Git cannot automatically merge changes:

```bash
# 1. Attempt the merge
git merge feature/conflicting-branch
# Auto-merging file.js
# CONFLICT (content): Merge conflict in file.js
# Automatic merge failed; fix conflicts and then commit the result.

# 2. Check which files have conflicts
git status

# 3. Open each conflicted file and resolve manually
# Look for conflict markers:
# <<<<<<< HEAD (your current changes)
# =======
# >>>>>>> feature/conflicting-branch (incoming changes)

# 4. After resolving, stage the resolved files
git add file.js

# 5. Complete the merge
git commit -m "Resolve merge conflicts"

# Or abort the merge if needed
git merge --abort
```

### Merge Strategies

```bash
# Use "ours" strategy (keep current branch's changes in conflicts)
git merge -X ours feature/branch

# Use "theirs" strategy (prefer incoming branch's changes)
git merge -X theirs feature/branch

# Create merge commit even for fast-forward
git merge --no-ff feature/branch

# Merge without committing (allows review before commit)
git merge --no-commit feature/branch
```

---

## Common Workflows

### Workflow 1: Daily Development Sync

```bash
# Start your day by updating your local repository
git checkout main
git pull origin main

# Create a feature branch
git checkout -b feature/new-work

# Make changes and commit
git add .
git commit -m "Add new feature"

# Before pushing, sync with remote again
git checkout main
git pull origin main

# Merge main into your feature branch to catch conflicts early
git checkout feature/new-work
git merge main

# Push your feature branch
git push origin feature/new-work
```

### Workflow 2: Feature Branch Integration

```bash
# Complete feature work
git checkout feature/user-dashboard
git add .
git commit -m "Complete user dashboard implementation"

# Update main branch
git checkout main
git pull origin main

# Merge feature into main
git merge feature/user-dashboard

# Push to remote
git push origin main

# Delete feature branch (optional)
git branch -d feature/user-dashboard
git push origin --delete feature/user-dashboard
```

### Workflow 3: Collaborative Development

```bash
# You're working on a shared feature branch

# 1. Commit your changes locally
git add .
git commit -m "Implement user validation"

# 2. Pull latest changes (may include coworker's commits)
git pull origin feature/shared-feature

# 3. Resolve any conflicts if they occur

# 4. Push your changes
git push origin feature/shared-feature
```

---

## Best Practices

### Commit Best Practices

1. **Commit Often, Push Regularly**
   - Make small, logical commits
   - Push to remote at least daily to backup work

2. **Write Meaningful Commit Messages**
   - Explain what and why, not how
   - Use present tense ("Add feature" not "Added feature")

3. **Keep Commits Atomic**
   - Each commit should represent one logical change
   - Easier to understand, review, and revert if needed

4. **Don't Commit Sensitive Data**
   - Never commit passwords, API keys, or tokens
   - Use `.gitignore` for environment files

### Pull Best Practices

1. **Pull Before Push**
   - Always pull latest changes before pushing
   - Reduces conflicts and failed pushes

2. **Review Changes Before Merging**
   ```bash
   git fetch origin
   git log origin/main...HEAD  # See what's new
   git diff HEAD..origin/main  # See actual changes
   git merge origin/main       # Merge when ready
   ```

3. **Use Pull Rebase for Cleaner History**
   ```bash
   git pull --rebase origin main
   ```
   - Creates linear history
   - Avoids unnecessary merge commits

### Merge Best Practices

1. **Test Before Merging**
   - Always test your feature branch thoroughly
   - Run tests, lint, and build before merging to main

2. **Keep Branches Short-Lived**
   - Merge feature branches frequently
   - Long-lived branches accumulate conflicts

3. **Use Pull Requests**
   - Merge through GitHub Pull Requests
   - Enables code review and discussion
   - Provides audit trail

4. **Protect Important Branches**
   - Use branch protection rules for main/production branches
   - Require pull request reviews
   - Require status checks to pass

---

## Troubleshooting

### Common Issues and Solutions

#### Issue: "Updates were rejected because the tip of your current branch is behind"

**Solution:**
```bash
# Pull latest changes first
git pull origin main

# Resolve any conflicts, then push again
git push origin main
```

#### Issue: Accidentally committed to wrong branch

**Solution:**
```bash
# Move commit to correct branch
git checkout correct-branch
git cherry-pick <commit-hash>

# Remove commit from wrong branch
git checkout wrong-branch
git reset --hard HEAD~1
```

#### Issue: Need to undo last commit (not pushed)

**Solution:**
```bash
# Undo commit but keep changes
git reset --soft HEAD~1

# Undo commit and discard changes
git reset --hard HEAD~1
```

#### Issue: Merge conflicts are too complex

**Solution:**
```bash
# Abort the merge
git merge --abort

# Try a different strategy or resolve conflicts manually
git pull --rebase origin main
```

#### Issue: Accidentally merged wrong branch

**Solution:**
```bash
# Undo the merge (if not pushed)
git reset --hard HEAD~1

# If already pushed, revert the merge commit
git revert -m 1 <merge-commit-hash>
```

### Getting Help

```bash
# View help for any command
git help pull
git help merge
git help commit

# View quick help
git pull --help
git merge --help
git commit --help
```

---

## Additional Resources

- [Git Official Documentation](https://git-scm.com/doc)
- [GitHub Docs - Using Git](https://docs.github.com/en/get-started/using-git)
- [Git Branching Model](https://nvie.com/posts/a-successful-git-branching-model/)
- [Conventional Commits](https://www.conventionalcommits.org/)

---

## Summary

| Operation | Key Command | Primary Use Case |
|-----------|-------------|------------------|
| **Commit** | `git commit -m "message"` | Save your work locally |
| **Pull** | `git pull origin main` | Get latest changes from remote |
| **Merge** | `git merge feature-branch` | Combine branches together |

Remember: Commit often, pull regularly, merge carefully, and always test before merging to main!
