# Branching Strategy Guide

## 📋 Overview

This project follows a **Dev → UAT → Prod** branching strategy:

| Environment | Branch | Purpose | Branch Pattern |
|------------|--------|---------|----------------|
| **DEV** | `dev` | Development | `feature/*` |
| **UAT** | `uat` | User Acceptance Testing | `release/*` |
| **PROD** | `main` | Production | `hotfix/*` (emergency only) |

## 🔒 Protected Branches

The following branches are **protected** and cannot be committed/pushed to directly:
- `main` (PROD)
- `uat` (UAT)
- `dev` (DEV)

## ✅ Correct Workflow

### 1. Feature Development (DEV)

```bash
# Start from dev
git checkout dev
git pull origin dev

# Create feature branch
git checkout -b feature/add-login

# Make changes and commit
git add .
git commit -m "Add login functionality"

# Push feature branch
git push origin feature/add-login

# Create PR: feature/add-login → dev
```

### 2. Release to UAT

```bash
# Start from dev
git checkout dev
git pull origin dev

# Create release branch
git checkout -b release/v1.0.0

# Final testing and bug fixes
git commit -m "Fix: Update configuration"

# Push release branch
git push origin release/v1.0.0

# Create PR: release/v1.0.0 → uat
```

### 3. Production Release

```bash
# After UAT approval, merge to main via PR
# Create PR: uat → main (on GitHub)
```

### 4. Emergency Hotfix (PROD)

```bash
# For urgent production fixes only
git checkout main
git pull origin main

# Create hotfix branch
git checkout -b hotfix/critical-bug

# Fix and commit
git commit -m "Fix: Critical security issue"

# Push and create PR
git push origin hotfix/critical-bug
# Create PR: hotfix/critical-bug → main
```

## 🛡️ Git Hooks

### Pre-Commit Hook
Prevents commits to protected branches and enforces branch naming:

**What it checks:**
- ❌ Blocks commits to `main`, `uat`, `dev`
- ❌ Blocks invalid branch names
- ✅ Allows commits to `feature/*`, `release/*`, `hotfix/*`
- ✅ Validates git user email

**Example:**
```bash
# ❌ This will be blocked
git checkout main
git commit -m "Direct commit"

# ✅ This is allowed
git checkout -b feature/my-feature
git commit -m "Add feature"
```

### Pre-Push Hook
Prevents direct pushes to protected branches:

**What it checks:**
- ❌ Blocks pushes to `main`, `uat`, `dev`
- ✅ Allows pushes to feature/release/hotfix branches

**Example:**
```bash
# ❌ This will be blocked
git checkout main
git push origin main

# ✅ This is allowed
git checkout feature/my-feature
git push origin feature/my-feature
```

## 🤖 AI Safety Bot

When you violate a rule, the AI Safety Bot explains **why** it's dangerous:

```
📋 Branch: main

❌ Direct commits to 'main' are not allowed!

🤖 Asking AI Safety Bot for guidance...

--------- 🤖 AI Safety Bot ---------
Committing directly to 'main' bypasses code review
and automated testing, potentially introducing bugs
to production. Always use feature branches and PRs.
------------------------------------
```

## 📝 Branch Naming Conventions

| Branch Type | Pattern | Example | Use Case |
|------------|---------|---------|----------|
| Feature | `feature/*` | `feature/user-auth` | New features |
| Release | `release/*` | `release/v1.0.0` | Release preparation |
| Hotfix | `hotfix/*` | `hotfix/security-patch` | Emergency fixes |

## ⚠️ Common Mistakes

### Mistake 1: Committing to dev/uat/main
```bash
git checkout dev
git commit -m "Quick fix"  # ❌ BLOCKED
```

**Solution:**
```bash
git checkout -b feature/quick-fix
git commit -m "Quick fix"  # ✅ ALLOWED
```

### Mistake 2: Invalid branch name
```bash
git checkout -b my-feature  # ❌ BLOCKED
```

**Solution:**
```bash
git checkout -b feature/my-feature  # ✅ ALLOWED
```

### Mistake 3: Pushing to protected branch
```bash
git push origin main  # ❌ BLOCKED
```

**Solution:**
```bash
git push origin feature/my-feature  # ✅ ALLOWED
# Then create PR on GitHub
```

## 🚀 Quick Reference

```bash
# Create feature branch
git checkout -b feature/my-feature

# Commit changes
git commit -m "Description"

# Push to remote
git push origin feature/my-feature

# Create PR on GitHub
# feature/my-feature → dev
```

## 🤝 Sharing & Customization for Other Teams

If you want to share this tool with a friend or team who uses a **different branching strategy**, they will need to customize the rules.

### Important: What to Share
The VS Code extension depends on the `safety-platform` backend and Git hooks. Your friend needs to:
1.  **Clone the Repository** (or copy the `safety-platform` folder).
2.  **Install Dependencies** (`npm install` in both `server/` and `git-safety/`).
3.  **Setup Environment Variables** (Create `.env` files with their own keys).

### How to Customize Rules
The logic for accepting/rejecting pushes is found in:
`safety-platform/git-safety/validate-push.js`

To change the strategy (e.g., to allow direct pushes to `dev`), edit the `// --- BRANCHING RULES ---` section:

**Example: Allowing Feature -> Main (Simple GitHub Flow)**
If they don't use Release branches and want to merge features directly to main:

1.  Open `safety-platform/git-safety/validate-push.js`.
2.  Find the "Block feature/* -> main" rule.
3.  Change it to **ALLOW** or delete the block completely.

```javascript
// Change THIS:
if (sourceBranch.startsWith('feature/') && targetBranch === 'main') {
    // ... BLOCKED logic ...
}

// To THIS (Allowing it):
else if (sourceBranch.startsWith('feature/') && targetBranch === 'main') {
     console.log(`${C.Blue}║${C.Reset}  ${C.Green}✅ ALLOWED${C.Reset} Feature PR to main.`);
}
```

### Customizing the AI Persona
You can also change what the AI recommends by editing the `system` prompt in the same file:

```javascript
messages: [
    {
        role: 'system',
        content: 'You are a helpful Git Safety Bot... Always recommend this specific flow: [INSERT THEIR FLOW HERE]'
    },
    // ...
]
```
Changing this string ensures the AI gives advice matching *their* specific team rules.
