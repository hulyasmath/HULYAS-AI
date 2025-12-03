# Railway Deployment Checklist

Use this checklist to verify your LibreChat deployment on Railway is complete and working correctly.

## Pre-Deployment Checks

### Code Preparation
- [ ] `railway.json` exists in project root
- [ ] `Dockerfile` is updated for Railway PORT handling
- [ ] `librechat.yaml` uses environment variables (no hardcoded values)
- [ ] All changes committed and pushed to GitHub
- [ ] Repository is connected to Railway

### Environment Variables Preparation
- [ ] JWT secrets generated (`JWT_SECRET`, `JWT_REFRESH_SECRET`)
- [ ] Encryption keys generated (`CREDS_KEY`, `CREDS_IV`)
- [ ] API keys ready (at least one AI provider)
- [ ] All required variables documented (see `RAILWAY_ENV_VARS.md`)

## Railway Setup

### Project Creation
- [ ] Railway project created
- [ ] GitHub repository connected
- [ ] Main application service created/configured

### Services
- [ ] MongoDB service added and running
- [ ] PostgreSQL service added (if using RAG) - optional
- [ ] Meilisearch service added (if using) - optional
- [ ] RAG API service added (if using) - optional

### Environment Variables Configuration
- [ ] Core variables set (`HOST`, `NODE_ENV`, `TRUST_PROXY`)
- [ ] `MONGO_URI` set (from MongoDB service)
- [ ] Domain variables set (`DOMAIN_CLIENT`, `DOMAIN_SERVER`) - after domain assignment
- [ ] Authentication variables set (`JWT_SECRET`, `JWT_REFRESH_SECRET`, `CREDS_KEY`, `CREDS_IV`)
- [ ] At least one AI provider API key set
- [ ] Optional service variables set (if using Meilisearch, RAG, SearXNG)
- [ ] Feature flags configured (`ALLOW_REGISTRATION`, etc.)

## Deployment

### Build & Deploy
- [ ] Build completed successfully (check Railway logs)
- [ ] No build errors in logs
- [ ] Service deployed and running (green status)
- [ ] All services show healthy status

### Domain Configuration
- [ ] Railway domain generated or custom domain configured
- [ ] `DOMAIN_CLIENT` updated with actual domain
- [ ] `DOMAIN_SERVER` updated with actual domain
- [ ] Service redeployed after domain variable updates

## Post-Deployment Verification

### Service Health
- [ ] Main service is running (check Railway dashboard)
- [ ] MongoDB service is running
- [ ] Optional services running (if configured)
- [ ] No error logs in Railway dashboard

### Application Access
- [ ] Application loads at Railway domain
- [ ] Health endpoint works: `https://your-domain/api/health` returns `OK`
- [ ] No 500 errors on initial load
- [ ] Login/registration page displays correctly

### Database Connection
- [ ] Application connects to MongoDB (check logs for "Connected to MongoDB")
- [ ] No database connection errors in logs
- [ ] Database operations work (if tested)

### Authentication
- [ ] Can create user account (if registration enabled)
- [ ] Can log in with created account
- [ ] JWT tokens are generated correctly
- [ ] Session persists after login

### AI Providers
- [ ] At least one AI provider configured
- [ ] Can select AI model in interface
- [ ] Can send a test message
- [ ] AI responds correctly
- [ ] No API key errors in logs

### Optional Features
- [ ] Meilisearch working (if configured) - search functionality works
- [ ] RAG API working (if configured) - can upload and query documents
- [ ] SearXNG working (if configured) - web search works
- [ ] Stripe integration working (if configured) - payment flows work

## User Management

### Admin User
- [ ] Admin user created (via CLI or registration)
- [ ] Can log in as admin
- [ ] Admin settings accessible
- [ ] Can manage users (if tested)

### User Features
- [ ] Users can create accounts (if registration enabled)
- [ ] Users can log in
- [ ] Users can start conversations
- [ ] Users can select AI models
- [ ] Users can send messages

## Security Verification

### Environment Variables
- [ ] No secrets committed to Git
- [ ] All secrets set in Railway Variables (not in code)
- [ ] JWT secrets are strong and random
- [ ] Encryption keys are strong and random

### Application Security
- [ ] HTTPS enabled (Railway provides this automatically)
- [ ] CORS configured correctly
- [ ] Authentication required for protected routes
- [ ] No sensitive data exposed in logs

## Performance & Monitoring

### Resource Usage
- [ ] Service resource usage is reasonable (check Railway dashboard)
- [ ] No memory leaks (monitor over time)
- [ ] Response times are acceptable

### Logging
- [ ] Application logs are visible in Railway
- [ ] Error logs are being captured
- [ ] Can identify issues from logs

## Configuration Verification

### librechat.yaml
- [ ] All API keys use environment variables (`${VAR_NAME}`)
- [ ] No hardcoded secrets or URLs
- [ ] Configuration matches intended setup

### Feature Flags
- [ ] `ALLOW_REGISTRATION` set as intended
- [ ] `ALLOW_SOCIAL_LOGIN` set as intended
- [ ] Other feature flags configured correctly

## Integration Testing

### Stripe (if configured)
- [ ] Stripe webhook URL configured: `https://your-domain/api/stripe/webhook`
- [ ] Webhook secret set in Railway variables
- [ ] Can process test payments (if tested)
- [ ] Subscription flows work (if tested)

### External Services
- [ ] SearXNG accessible (if using external instance)
- [ ] All external API keys valid
- [ ] External service URLs correct

## Documentation

### Documentation Complete
- [ ] `RAILWAY_ENV_VARS.md` reviewed
- [ ] `RAILWAY_SETUP.md` followed
- [ ] All environment variables documented
- [ ] Deployment process documented

## Troubleshooting Common Issues

### If Build Fails
- [ ] Check Dockerfile syntax
- [ ] Verify all dependencies in package.json
- [ ] Check build logs for specific errors
- [ ] Verify Node version compatibility

### If Application Won't Start
- [ ] Check application logs
- [ ] Verify all required environment variables set
- [ ] Check MongoDB connection string format
- [ ] Verify PORT is not overridden

### If Database Connection Fails
- [ ] Verify `MONGO_URI` is correct
- [ ] Check MongoDB service is running
- [ ] Ensure services are in same Railway project
- [ ] Check network connectivity between services

### If 500 Errors Occur
- [ ] Check application logs for stack traces
- [ ] Verify JWT secrets are set
- [ ] Check CREDS_KEY and CREDS_IV are set
- [ ] Verify API keys are valid
- [ ] Check for missing environment variables

### If Domain Not Working
- [ ] Wait for DNS propagation (can take a few minutes)
- [ ] Verify `DOMAIN_CLIENT` and `DOMAIN_SERVER` are set correctly
- [ ] Check service is deployed and running
- [ ] Verify HTTPS is enabled

## Final Verification

### End-to-End Test
- [ ] Create new user account
- [ ] Log in successfully
- [ ] Start new conversation
- [ ] Select AI model
- [ ] Send test message
- [ ] Receive AI response
- [ ] All features work as expected

### Production Readiness
- [ ] All critical features working
- [ ] No critical errors in logs
- [ ] Performance is acceptable
- [ ] Security measures in place
- [ ] Monitoring set up (optional)
- [ ] Backup strategy in place (optional)

## Sign-Off

- [ ] All critical checks completed
- [ ] Application is functional
- [ ] Ready for production use
- [ ] Team notified of deployment

---

## Quick Health Check Commands

After deployment, verify these endpoints:

```bash
# Health check
curl https://your-domain/api/health
# Should return: OK

# Check if app is running
curl https://your-domain
# Should return: HTML page
```

## Next Steps After Deployment

1. **Monitor for 24-48 hours** for any issues
2. **Set up alerts** in Railway (if available)
3. **Configure backups** for MongoDB
4. **Review resource usage** and optimize if needed
5. **Document any custom configurations**
6. **Train team** on Railway dashboard and deployment process

## Support Resources

- Railway Dashboard: https://railway.app
- Railway Docs: https://docs.railway.app
- LibreChat Docs: https://docs.librechat.ai
- Check logs: Railway Dashboard → Service → Logs

---

**Last Updated:** After completing deployment
**Deployed By:** [Your Name]
**Deployment Date:** [Date]
**Railway Project:** [Project Name]
**Domain:** [Your Domain]

