# Deployment Guide

Guide to deploying BYO to production.

## Vercel Deployment (Recommended)

Vercel provides the best DX for Vite applications with zero configuration.

### Prerequisites

- GitHub account
- Vercel account (free tier works)
- Supabase project

### Quick Deploy

#### 1. Push to GitHub

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

#### 2. Import to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New..." → "Project"
3. Import your Git repository
4. Vercel auto-detects Vite configuration
5. Click "Deploy"

#### 3. Add Environment Variables

In your Vercel project:

1. Go to Settings → Environment Variables
2. Add these variables:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

3. Apply to all environments (Production, Preview, Development)
4. Redeploy

#### 4. Configure Domains

1. Go to Settings → Domains
2. Add your custom domain
3. Configure DNS records as instructed
4. Vercel handles SSL automatically

### Automatic Deployments

Every push triggers a deployment:

- **Push to `main`** → Production deployment
- **Pull requests** → Preview deployment
- **Other branches** → Development deployment

### Preview Deployments

Each PR gets its own URL:

```
https://byo-pr-123-username.vercel.app
```

Perfect for:
- Reviewing changes
- Testing before merge
- Sharing with team

## Manual Deployment

### Using Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### Build Locally

```bash
# Build the project
npm run build

# Test production build
npm run preview
```

Output is in `/dist` directory.

## Environment Configuration

### Production Environment Variables

Required:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-production-anon-key
```

Optional:

```env
VITE_APP_URL=https://yourdomain.com
VITE_LOG_LEVEL=error
```

### Supabase Setup

#### 1. Configure Auth

In Supabase Dashboard → Authentication → URL Configuration:

**Site URL:**
```
https://yourdomain.com
```

**Redirect URLs:**
```
https://yourdomain.com/**
https://*.vercel.app/**
```

#### 2. Configure CORS

In Supabase Dashboard → Settings → API:

Add your Vercel URLs to allowed origins.

#### 3. Environment-Specific Projects

Consider separate Supabase projects:

- **Development** - Local Supabase or dev project
- **Staging** - Preview deployments
- **Production** - Production project

## CI/CD Pipeline

GitHub Actions automatically run on every push:

### CI Workflow

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm test
      - run: npm run build
```

### Deploy Workflow

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: vercel deploy --prod
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
```

### Secrets Configuration

In GitHub repository → Settings → Secrets:

```
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-org-id
VERCEL_PROJECT_ID=your-project-id
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Performance Optimization

### Vite Build Optimizations

Already configured in `vite.config.ts`:

- Code splitting
- Tree shaking
- Minification
- Source maps (production)

### Additional Optimizations

#### 1. Enable Compression

Vercel automatically enables:
- Gzip compression
- Brotli compression

#### 2. Configure Caching

In `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

#### 3. Optimize Images

Consider adding:

```bash
npm install vite-plugin-image-optimizer
```

#### 4. Lazy Load Routes

```tsx
import { lazy, Suspense } from 'react'

const Dashboard = lazy(() => import('./features/dashboard/dashboard-page'))

<Route
  path="/dashboard"
  element={
    <Suspense fallback={<Loading />}>
      <Dashboard />
    </Suspense>
  }
/>
```

## Monitoring

### Vercel Analytics

Enable in Vercel dashboard:

1. Go to Analytics tab
2. Enable Web Analytics
3. View real-time metrics

### Error Tracking

Consider adding:

- **Sentry** - Error tracking
- **LogRocket** - Session replay
- **Datadog** - APM

Example Sentry setup:

```bash
npm install @sentry/react
```

```tsx
// src/main.tsx
import * as Sentry from '@sentry/react'

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
})
```

### Supabase Monitoring

In Supabase Dashboard:

- Database health
- API usage
- Auth events
- Logs

## Security Checklist

### Pre-Deployment

- [ ] Environment variables configured
- [ ] Secrets not in code
- [ ] HTTPS enabled (automatic with Vercel)
- [ ] CORS configured
- [ ] RLS policies enabled
- [ ] Auth redirect URLs configured
- [ ] Rate limiting enabled

### Post-Deployment

- [ ] Test auth flow in production
- [ ] Verify RLS policies work
- [ ] Check error reporting
- [ ] Monitor performance
- [ ] Review security headers

## Troubleshooting

### Build Failures

**TypeScript errors:**
```bash
npm run typecheck
```

**Dependency issues:**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Environment variables:**

Verify in Vercel dashboard under Environment Variables.

### Runtime Errors

**"Missing environment variables":**

Check Vercel environment variables are set and deployed.

**Auth errors:**

Verify redirect URLs in Supabase match deployment URL.

**CORS errors:**

Add deployment domain to Supabase CORS settings.

### Performance Issues

**Slow page loads:**

1. Check Vercel Analytics
2. Use Lighthouse
3. Enable caching
4. Optimize images

**Database slow:**

1. Check Supabase dashboard
2. Add indexes
3. Optimize queries
4. Consider caching

## Rollback

### Vercel Rollback

1. Go to Deployments
2. Find working deployment
3. Click "Promote to Production"

### Database Rollback

```bash
# Rollback last migration
npx supabase migration down

# Or restore from backup
# In Supabase Dashboard → Database → Backups
```

## Alternative Platforms

### Netlify

Similar to Vercel:

```bash
npm install -g netlify-cli
netlify deploy --prod
```

### Cloudflare Pages

1. Connect Git repository
2. Configure build:
   - Build command: `npm run build`
   - Output directory: `dist`
3. Add environment variables
4. Deploy

### Self-Hosted

#### Using Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
RUN npm install -g serve
CMD ["serve", "-s", "dist", "-l", "3000"]
```

```bash
docker build -t byo .
docker run -p 3000:3000 byo
```

#### Using Nginx

```nginx
server {
  listen 80;
  server_name yourdomain.com;

  root /var/www/byo/dist;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }

  location /assets {
    expires 1y;
    add_header Cache-Control "public, immutable";
  }
}
```

## Best Practices

### 1. Use Preview Deployments

Test every change before production.

### 2. Automate Everything

Let CI/CD handle testing and deployment.

### 3. Monitor Production

Set up alerts for errors and performance.

### 4. Keep Dependencies Updated

```bash
npm update
npm audit fix
```

### 5. Regular Backups

Supabase provides daily backups. Download them regularly.

### 6. Security Headers

Add in `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        }
      ]
    }
  ]
}
```

---

**Related Docs:**
- [Setup Guide](./setup.md)
- [Architecture](./architecture.md)
- [CI/CD Workflows](../.github/workflows/)
