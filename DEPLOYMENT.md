# Production Deployment Guide

## Prerequisites

- Node.js 18+ installed
- npm or yarn
- Git
- Domain name (optional, for production URL)
- Server or cloud hosting (AWS, GCP, DigitalOcean, etc.)

## Environment Setup

### Backend (.env configuration)

Create `server/.env` with:

```env
# Server Configuration
PORT=3001
NODE_ENV=production

# API Keys (Required)
OPENAI_API_KEY=your_openai_key_here
GITHUB_USERNAME=your_github_username
GITHUB_TOKEN=your_github_personal_access_token

# Security (Optional)
ALLOWED_ORIGINS=https://yourdomain.com
LOG_LEVEL=info
```

### Frontend (.env configuration)

Create `client/.env.production` with:

```env
VITE_API_URL=https://api.yourdomain.com
```

## Build for Production

### 1. Install Dependencies

```bash
# From project root
npm install

# Or for specific workspaces
npm install --workspace=server
npm install --workspace=client
npm install --workspace=git-safety
```

### 2. Build Backend

```bash
cd server
npm run build
```

This creates `server/dist` with compiled TypeScript.

###3. Build Frontend

```bash
cd client
npm run build
```

This creates `client/dist` with optimized static files.

## Deployment Options

### Option 1: Traditional Server (VPS/EC2)

#### Backend Deployment

```bash
# Copy files to server
scp -r server/ user@yourserver:/var/www/safety-platform/

# On server, install dependencies (production only)
cd /var/www/safety-platform/server
npm ci --production

# Set up environment
cp .env.example .env
# Edit .env with production values

# Run with PM2 (process manager)
npm install -g pm2
pm2 start dist/index.js --name safety-platform-api
pm2 save
pm2 startup
```

#### Frontend Deployment

```bash
# Copy built files to web server
scp -r client/dist/* user@yourserver:/var/www/html/

# Or use Nginx to serve
# Configure Nginx:
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Option 2: Docker Deployment

#### Backend Dockerfile

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY dist ./dist
EXPOSE 3001
CMD ["node", "dist/index.js"]
```

#### Frontend Dockerfile

```dockerfile
FROM nginx:alpine
COPY dist /usr/share/nginx/html
EXPOSE 80
```

#### Docker Compose

```yaml
version: '3.8'
services:
  api:
    build: ./server
    ports:
      - "3001:3001"
    env_file:
      - ./server/.env
    restart: always

  web:
    build: ./client
    ports:
      - "80:80"
    depends_on:
      - api
    restart: always
```

### Option 3: Serverless (Vercel/Netlify)

#### Frontend on Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from client directory
cd client
vercel --prod
```

#### Backend on Railway/Render

1. Connect your GitHub repo
2. Set build command: `cd server && npm run build`
3. Set start command: `node dist/index.js`
4. Add environment variables via dashboard

## Post-Deployment Checklist

- [ ] Verify health check endpoint: `https://api.yourdomain.com/health`
- [ ] Test frontend loads: `https://yourdomain.com`
- [ ] Test login flow
- [ ] Test GitHub PR fetching
- [ ] Check error logs
- [ ] Set up SSL/HTTPS
- [ ] Configure firewall rules
- [ ] Set up monitoring (e.g., UptimeRobot)
- [ ] Configure backups (if using database)

## Security Hardening

### 1. HTTPS/SSL

Use Let's Encrypt with Certbot:

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

### 2. Firewall

```bash
# Allow only HTTP, HTTPS, SSH
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### 3. Environment Variables

- Never commit `.env` files
- Use secret management tools (AWS Secrets Manager, HashiCorp Vault)
- Rotate API keys regularly

## Monitoring & Logging

### 1. Application Logs

Logs are stored in `server/logs/`:
- `combined.log` - All logs
- `error.log` - Errors only

Rotate logs with `logrotate`:

```bash
/var/www/safety-platform/server/logs/*.log {
    daily
    missingok
    rotate 14
    compress
    delaycompress
    notifempty
}
```

### 2. Health Monitoring

Set up monitoring for:
- Health endpoint: `/health`
- Response time < 2s
- Uptime > 99.9%

## Troubleshooting

### Backend won't start

```bash
# Check logs
pm2 logs safety-platform-api

# Check environment
printenv | grep -E "(PORT|OPENAI|GITHUB)"

# Test manually
node dist/index.js
```

### Frontend shows 404

- Ensure nginx `try_files` is configured
- Check build output exists in `dist/`

### CORS errors

- Add frontend domain to `ALLOWED_ORIGINS` in backend `.env`

## Rollback Procedure

```bash
# With PM2
pm2 list
pm2 stop safety-platform-api
# Deploy previous version
pm2 start safety-platform-api
pm2 restart all
```

## Support

For issues, check:
1. Application logs: `server/logs/`
2. Health endpoint: `/health`
3. GitHub Issues: [your-repo-url]
