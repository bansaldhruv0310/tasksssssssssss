# AI-Powered Developer Productivity & Git Safety Platform

## 🚀 Quick Start

```bash
#start
npm run dev
```

This starts both:
- **Backend API**: http://localhost:3001
- **Frontend Dashboard**: http://localhost:5173

## ✅ What's Working

### 1. Priority Dashboard
- Fetches your GitHub Pull Requests
- Uses OpenAI to analyze and rank them by importance
- Displays AI-generated explanations

### 2. AI Git Safety Hooks
When you try to commit to a protected branch (like `main`), an AI chatbot intercepts and explains why it's dangerous.

**Test it:**
```bash
git checkout main
git commit --allow-empty -m "Test commit"
```

You'll see the AI Safety Bot explain the risk!

### 3. Real Data Integrations
- **GitHub**: Connected via Personal Access Token
- **OpenAI**: GPT-4o analyzes your priorities

### 4. Authentication
- Secure landing page with login
- Protected dashboard routes
- Session persistence

### 5. Branching Strategy Enforcement
- Dev → UAT → Prod workflow
- Pre-commit and pre-push hooks
- Branch naming conventions enforced

## 📋 How to See Real PRs

If you're seeing the "[DEMO]" message, it means:
1. You have no **open** PRs right now, OR
2. The GitHub search needs a moment

**To test with real data:**
1. Create a Pull Request on any of your GitHub repositories
2. Make sure it's **open** (not merged or closed)
3. Refresh the dashboard at http://localhost:5173

## 🔒 Production Ready

This platform includes enterprise-grade features:
- ✅ Security headers (Helmet.js)
- ✅ Rate limiting
- ✅ Structured logging (Winston)
- ✅ Error boundaries
- ✅ Health check endpoint
- ✅ Environment validation
- ✅ Graceful shutdown

**For deployment:** See [`DEPLOYMENT.md`](DEPLOYMENT.md)  
**For security:** See [`SECURITY.md`](SECURITY.md)

## 📚 Documentation

- **[`BRANCHING_STRATEGY.md`](BRANCHING_STRATEGY.md)** - Git workflow guide
- **[`DEPLOYMENT.md`](DEPLOYMENT.md)** - Production deployment
- **[`SECURITY.md`](SECURITY.md)** - Security best practices

## 🔐 Security Note

Your credentials are stored in:
- `server/.env` (Backend)
- `git-safety/.env` (Git Hooks)

**Never commit these files to version control!**

## 🏗️ Architecture

```
safety-platform/
├── client/          # React + Vite frontend
├── server/          # Express backend + APIs
├── git-safety/      # Git hooks
└── .husky/          # Husky hook management
```

## 🛠️ Tech Stack

**Frontend:** React, TypeScript, TailwindCSS, React Router  
**Backend:** Node.js, Express, TypeScript, Winston  
**APIs:** GitHub (Octokit), OpenAI (GPT-4o)  
**Security:** Helmet, Rate Limiting, CORS  
**Git:** Husky, Custom hooks with AI

## 📊 Monitoring

**Health Check:** `GET http://localhost:3001/health`

Returns:
```json
{
  "status": "healthy",
  "timestamp": "2026-01-29T12:00:00.000Z",
  "uptime": 3600,
  "environment": "development"
}
```

## 🚀 Build for Production

```bash
# Backend
cd server
npm run build

# Frontend
cd client
npm run build
```

## 📝 License

MIT
