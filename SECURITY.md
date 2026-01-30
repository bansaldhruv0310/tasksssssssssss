# Security Best Practices

## API Keys & Secrets

### ✅ Do
- Store all secrets in `.env` files
- Add `.env` to `.gitignore`
- Use environment-specific `.env` files (`.env.production`, `.env.development`)
- Rotate API keys quarterly
- Use principle of least privilege for service accounts

### ❌ Don't
- Never commit API keys to git
- Don't hardcode secrets in source code
- Don't share `.env` files via email/Slack
- Don't use the same keys for dev/staging/prod

## Authentication

### Current Implementation
- Client-side authentication with localStorage
- Demo credentials (any username + 4+ char password)

### Production Recommendations
1. **Use JWT tokens** instead of localStorage
2. **Implement backend authentication** (not just frontend)
3. **Add session expiry** (e.g., 24 hours)
4. **Use httpOnly cookies** for token storage
5. **Implement refresh tokens**
6. **Add rate limiting** on login endpoint

## HTTPS/TLS

### Required
- All production traffic must use HTTPS
- Redirect HTTP → HTTPS
- Use TLS 1.2 or higher
- Enable HSTS headers

```javascript
// In server/src/index.ts (already implemented via helmet)
app.use(helmet({
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    }
}));
```

## Input Validation

### Backend
```typescript
// Example: Validate user input
import { body, validationResult } from 'express-validator';

app.post('/api/data',
    body('email').isEmail(),
    body('username').isLength({ min: 3, max: 20 }),
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        // Process request
    }
);
```

### Frontend
- Validate all form inputs
- Sanitize user-generated content
- Use Content Security Policy headers

## Rate Limiting

Currently implemented:
- **100 requests per 15 minutes** per IP on `/priorities`

For production:
```typescript
// Stricter limits
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5, // 5 login attempts per 15 min
    message: 'Too many login attempts'
});

app.post('/login', authLimiter, loginHandler);
```

## CORS Policy

Current: Allows all origins (`*`)

Production recommendation:
```typescript
app.use(cors({
    origin: [
        'https://yourdomain.com',
        'https://www.yourdomain.com'
    ],
    credentials: true,
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
```

## Dependency Security

### Regular Audits
```bash
# Check for vulnerabilities
npm audit

# Fix automatically (use carefully)
npm audit fix

# Check specific package
npm outdated
```

### Best Practices
- Update dependencies monthly
- Use `npm ci` in production (not `npm install`)
- Enable Dependabot alerts on GitHub
- Review security advisories

## Error Handling

### ✅ Do
```typescript
// Production: Hide error details
app.use((err, req, res, next) => {
    logger.error(err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'production'
            ? 'An error occurred'
            : err.message
    });
});
```

### ❌ Don't
```typescript
// Bad: Exposing stack traces
res.status(500).json({ error: err.stack });
```

## Logging

### Current Implementation
- Winston logger with file rotation
- Logs: `logs/combined.log`, `logs/error.log`

### Production Guidelines
- **Never log secrets** (API keys, tokens, passwords)
- Log important security events (login attempts, API failures)
- Use structured logging (JSON format)
- Set up centralized logging (CloudWatch, Datadog, etc.)

```typescript
// Good logging
logger.info('User login attempt', {
    username: user.username, // OK
    ip: req.ip,              // OK
    userAgent: req.get('user-agent')
});

// Bad logging
logger.info('Login', {
    password: user.password  // NEVER do this!
});
```

## Git Hooks Security

### Pre-commit Hook
- Validates branch names
- Checks for committed secrets (TODO: add secret scanner)
- Enforces git user email

### Recommended Addition: Secret Scanner
```bash
# Install git-secrets
git secrets --install
git secrets --register-aws  # Prevents AWS keys
git secrets --scan
```

## API Security Headers

Already implemented via `helmet`:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 0`
- `Strict-Transport-Security`

## Database Security (if added later)

When adding a database:
- Use parameterized queries (prevent SQL injection)
- Encrypt sensitive data at rest
- Use connection pooling
- Limit database user permissions
- Enable SSL for database connections

## Incident Response

### If API Key is Compromised
1. **Immediately rotate** the key
2. **Update** production `.env`
3. **Check logs** for unauthorized usage
4. **Review** access patterns
5. **Document** the incident

### Regular Security Tasks
- [ ] Monthly: Update dependencies
- [ ] Quarterly: Rotate API keys
- [ ] Quarterly: Review access logs
- [ ] Annually: Security audit

## Compliance

### GDPR (if handling EU users)
- Implement data deletion requests
- Add privacy policy
- Get user consent for data collection
- Allow data export

### SOC 2 (if enterprise customers)
- Audit logging
- Access controls
- Encryption at rest and in transit
- Regular security testing

## Production Checklist

Before going live:
- [ ] All secrets in environment variables
- [ ] HTTPS enabled
- [ ] Rate limiting configured
- [ ] Error messages don't leak info
- [ ] Dependencies updated
- [ ] Security headers enabled (helmet)
- [ ] CORS restricted to known origins
- [ ] Input validation on all endpoints
- [ ] Logging configured (no secrets logged)
- [ ] Monitoring set up
- [ ] Backup strategy defined

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
