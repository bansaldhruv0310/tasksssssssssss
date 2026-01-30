# Production Readiness Checklist

Use this checklist before deploying to production.

## Backend Readiness

### Security
- [ ] All API keys stored in `.env` (not in code)
- [ ] `.env` added to `.gitignore`
- [ ] Helmet security headers enabled
- [ ] Rate limiting configured
- [ ] CORS restricted to specific origins
- [ ] Input validation on all endpoints
- [ ] Error messages don't expose sensitive data

### Configuration
- [ ] `NODE_ENV=production` set
- [ ] Environment variables validated on startup
- [ ] Correct PORT configured
- [ ] GITHUB_TOKEN has correct permissions
- [ ] OPENAI_API_KEY is valid

### Reliability
- [ ] Health check endpoint working (`/health`)
- [ ] Logging configured (Winston)
- [ ] Global error handler in place
- [ ] Graceful shutdown handlers implemented

### Performance
- [ ] Response times < 2 seconds
- [ ] No memory leaks (run with `--inspect`)
- [ ] Connection pooling if using database

## Frontend Readiness

### User Experience
- [ ] Loading states for async operations
- [ ] Error boundaries configured
- [ ] User-friendly error messages
- [ ] Empty states handled gracefully
- [ ] Responsive design (mobile/tablet/desktop)

### Security
- [ ] No API keys in frontend code
- [ ] Authentication properly implemented
- [ ] Protected routes working
- [ ] Session timeout configured

### Performance
- [ ] Bundle size optimized (`npm run build`)
- [ ] Images optimized
- [ ] Code splitting implemented
- [ ] Lighthouse score > 90

### Accessibility
- [ ] Keyboard navigation works
- [ ] ARIA labels present
- [ ] Color contrast meets WCAG standards
- [ ] Screen reader tested

## Git Hooks

- [ ] Pre-commit hook working
- [ ] Pre-push hook working
- [ ] Branch naming validation active
- [ ] Protected branches enforced
- [ ] AI explanations functional

## Documentation

- [ ] README updated with current features
- [ ] DEPLOYMENT.md reviewed
- [ ] SECURITY.md guidelines followed
- [ ] BRANCHING_STRATEGY.md shared with team
- [ ] API endpoints documented

## Testing

- [ ] All user flows manually tested
- [ ] Error scenarios tested
- [ ] API endpoints tested
- [ ] Cross-browser testing done (Chrome, Firefox, Safari)
- [ ] Mobile testing done

## Deployment

- [ ] Build process tested locally
  - [ ] `cd server && npm run build` works
  - [ ] `cd client && npm run build` works
- [ ] Environment variables set on hosting provider
- [ ] SSL/HTTPS configured
- [ ] Domain configured
- [ ] Firewall rules set

## Monitoring & Operations

- [ ] Error tracking set up (Sentry, etc.)
- [ ] Uptime monitoring configured
- [ ] Health check monitored
- [ ] Log aggregation set up
- [ ] Alerts configured for:
  - [ ] Service downtime
  - [ ] High error rates
  - [ ] High response times

## Post-Deployment

- [ ] Smoke test in production
  - [ ] Landing page loads
  - [ ] Login works
  - [ ] Dashboard displays priorities
  - [ ] Logout works
  - [ ] Health check returns 200
- [ ] SSL certificate verified
- [ ] DNS propagated
- [ ] Monitoring dashboards checked
- [ ] Team notified of deployment

## Rollback Plan

- [ ] Previous version tagged in git
- [ ] Rollback procedure documented
- [ ] Rollback tested in staging
- [ ] Team knows rollback process

## Compliance (if applicable)

- [ ] Privacy policy added
- [ ] Terms of service added
- [ ] GDPR compliance (if EU users)
- [ ] Data retention policy defined
- [ ] Cookie consent implemented (if needed)

## Performance Benchmarks

Test and record:
- [ ] API response time: ____ms (target: < 500ms)
- [ ] Page load time: ____ms (target: < 3s)
- [ ] Time to interactive: ____ms (target: < 5s)
- [ ] Lighthouse performance: ____/100 (target: > 90)

## Load Testing

- [ ] Tested with 10 concurrent users
- [ ] Tested with 100 concurrent users
- [ ] API rate limits verified
- [ ] No memory leaks under load

## Security Audit

- [ ] `npm audit` run and fixed
- [ ] Dependencies updated
- [ ] Secrets not in git history
- [ ] Security headers verified (securityheaders.com)
- [ ] Penetration testing done (if required)

## Final Sign-off

- [ ] Product Owner reviewed
- [ ] Tech Lead approved
- [ ] Security team approved (if applicable)
- [ ] Go-live date confirmed
- [ ] Rollback plan confirmed

---

**Deployment Date:** _________________  
**Deployed By:** _________________  
**Environment:** _________________  
**Version/Tag:** _________________
