# 🚀 Deployment & Updates Guide

## Current Deployment Status

### **Vercel (Frontend)**
- **Current**: Configured and ready
- **Config file**: `artifacts/al-shamail/vercel.json`
- **Status**: ✅ Up to date
- **Action**: No update needed - Vercel automatically deploys on push

**To deploy to Vercel:**
```bash
# Make sure you're logged in to Vercel CLI
vercel deploy --prod
```

### **Render (Backend API Server)**
- **Status**: ⚠️ Check your current configuration
- **Type**: Node.js + Express
- **Location**: `artifacts/api-server/`

---

## Backend API Server Updates

Your API server (`artifacts/api-server/`) would benefit from these updates:

### **Recommended Updates:**

1. **Node.js Version**
   - Upgrade to Node.js 20+ (current: uses what's in package.json)
   - Better performance and security

2. **Dependencies**
   - Run `cd artifacts/api-server && pnpm up` to update packages
   - Check for security vulnerabilities: `pnpm audit`

3. **Build & Deploy to Render**

   **For a fresh Render deployment:**
   - Push code to GitHub
   - Connect repo to Render.com
   - Create a new Web Service
   - Build command: `pnpm --filter @workspace/api-server run build` (if applicable)
   - Start command: `pnpm --filter @workspace/api-server run start` or `node src/index.ts`
   - Environment variables (if any): Configure in Render dashboard

   **For an existing Render deployment:**
   - Push changes to GitHub
   - Render auto-deploys on Git push (if configured)
   - Monitor logs in Render dashboard

---

## Environment Variables

### Frontend (.env.local in `artifacts/al-shamail/`)
```
VITE_API_BASE=/api
```

### Backend (.env in `artifacts/api-server/`)
- `PORT` (default: 3001)
- `NODE_ENV` (development/production)
- `DATABASE_URL` (if using a database)
- Add other secrets here

---

## Vercel Configuration

Your current `vercel.json`:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

**This is correct** - it ensures all routes go to your React app (SPA routing).

**Optional improvements:**
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }],
  "redirects": [],
  "headers": [
    {
      "source": "/api/:path*",
      "headers": [
        { "key": "Cache-Control", "value": "no-cache" }
      ]
    }
  ]
}
```

---

## Render Configuration

Create a `render.yaml` in your root for one-click deploys:

```yaml
services:
  - type: web
    name: alshamail-api
    dir: ./artifacts/api-server
    runtime: node
    plan: free
    buildCommand: pnpm install
    startCommand: pnpm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 3001
```

---

## Update Checklist

- [ ] Update dependencies: `pnpm up`
- [ ] Run audit: `pnpm audit`
- [ ] Test locally: `pnpm start`
- [ ] Build frontend: `cd artifacts/al-shamail && pnpm build`
- [ ] Deploy to Vercel: `vercel deploy --prod`
- [ ] Update Render if API changed
- [ ] Test deployed version
- [ ] Monitor logs for errors

---

## Quick Commands

```bash
# From root directory

# 1. Start development
pnpm start

# 2. Build for production
pnpm build

# 3. Update all dependencies
pnpm up

# 4. Check for security issues
pnpm audit

# 5. Type check
pnpm typecheck

# 6. Start API server only
pnpm start:api
```

---

## Monitoring

### Vercel
- Visit https://vercel.com/dashboard
- Check deployments, logs, and analytics

### Render
- Visit https://dashboard.render.com
- Monitor logs and metrics
- Set up email notifications for failures

---

## Support

For issues:
1. Check browser console for errors
2. Check Vercel logs
3. Check Render logs
4. Verify environment variables are set
5. Run `pnpm audit` for dependency issues
