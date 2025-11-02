# Deployment Guide

Complete guide for deploying BYO SaaS boilerplate to production.

## Table of Contents

- [Vercel Deployment](#vercel-deployment)
- [Supabase Setup](#supabase-setup)
- [Environment Variables](#environment-variables)
- [Post-Deployment](#post-deployment)
- [Troubleshooting](#troubleshooting)

---

## Vercel Deployment

### Prerequisites

- GitHub account with repository access
- Vercel account (free tier available at https://vercel.com)

### Option 1: Deploy via Vercel Dashboard (Recommended)

This is the easiest method and requires no CLI tools.

#### Step 1: Import Repository

1. **Go to Vercel Dashboard**
   - Visit https://vercel.com
   - Click "Add New..." → "Project"

2. **Import Git Repository**
   - Connect your GitHub account if not already connected
   - Select the `byo` repository
   - Click "Import"

3. **Configure Project**
   - **Framework Preset**: Vite (auto-detected)
   - **Root Directory**: `./` (leave default)
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `dist` (auto-detected)
   - **Install Command**: `npm install` (auto-detected)

#### Step 2: Add Environment Variables

Before deploying, add these environment variables in the Vercel dashboard:

```bash
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

**How to add environment variables:**
1. In your project settings, go to "Settings" → "Environment Variables"
2. Add each variable for all environments (Production, Preview, Development)
3. Click "Save"

> **Note**: You'll get these values from Supabase in the next section.

#### Step 3: Deploy

1. Click "Deploy" button
2. Wait for the build to complete (~2-3 minutes)
3. Your app will be live at `https://your-project-name.vercel.app`

#### Step 4: Configure Custom Domain (Optional)

1. Go to "Settings" → "Domains"
2. Add your custom domain
3. Update your DNS records as instructed
4. Wait for SSL certificate to be issued (~5 minutes)

### Option 2: Deploy via Vercel CLI

If you prefer using the command line:

#### Install Vercel CLI

```bash
npm install -g vercel
```

#### Login to Vercel

```bash
vercel login
```

#### Deploy

```bash
cd /home/user/byo
vercel
```

Follow the prompts:
- Set up and deploy? **Yes**
- Which scope? Select your account
- Link to existing project? **No**
- What's your project's name? **byo** (or your preferred name)
- In which directory is your code located? **./`**

For production deployment:

```bash
vercel --prod
```

---

## Supabase Setup

### Step 1: Create Supabase Project

1. **Go to Supabase Dashboard**
   - Visit https://supabase.com
   - Click "New Project"

2. **Configure Project**
   - **Name**: BYO SaaS (or your preferred name)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free (or Pro if needed)
   - Click "Create new project"

3. **Wait for provisioning** (~2 minutes)

### Step 2: Get API Credentials

1. In your Supabase project dashboard, go to "Settings" → "API"
2. Copy these values:
   - **Project URL** → This is your `VITE_SUPABASE_URL`
   - **anon public** key → This is your `VITE_SUPABASE_ANON_KEY`

### Step 3: Run Database Migrations

1. **Install Supabase CLI** (if not already installed)

   ```bash
   npm install -g supabase
   ```

2. **Login to Supabase**

   ```bash
   supabase login
   ```

3. **Link to your project**

   ```bash
   cd /home/user/byo
   supabase link --project-ref your-project-ref
   ```

   > **Find your project ref**: In Supabase dashboard → Settings → General → Reference ID

4. **Push migrations**

   ```bash
   supabase db push
   ```

   This will:
   - Create all tables (profiles, roles, permissions, user_roles, role_permissions)
   - Set up Row Level Security (RLS) policies
   - Create database functions and triggers
   - Seed initial roles (Admin, Moderator, User, Guest)

### Step 4: Verify Database Setup

1. Go to Supabase dashboard → "Table Editor"
2. You should see these tables:
   - `profiles`
   - `roles`
   - `permissions`
   - `user_roles`
   - `role_permissions`
3. Check the `roles` table has 4 default roles

### Step 5: Configure Authentication

1. Go to "Authentication" → "Providers"
2. **Email** provider is enabled by default
3. **Optional**: Configure additional providers:
   - Google OAuth
   - GitHub OAuth
   - Magic Links

**Email Settings**:
1. Go to "Authentication" → "Email Templates"
2. Customize confirmation email template if desired
3. Configure SMTP (optional, defaults to Supabase SMTP)

---

## Environment Variables

### Required Variables

Add these to Vercel (and your local `.env.local` for development):

```bash
# Supabase
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### How to Update in Vercel

#### Via Dashboard:
1. Go to your project → "Settings" → "Environment Variables"
2. Edit the variable
3. Redeploy to apply changes

#### Via CLI:
```bash
vercel env add VITE_SUPABASE_URL
# Enter the value when prompted

vercel env add VITE_SUPABASE_ANON_KEY
# Enter the value when prompted

# Redeploy
vercel --prod
```

### Local Development

Create `.env.local` in the project root:

```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

> **Important**: `.env.local` is gitignored and will not be committed.

---

## Post-Deployment

### 1. Verify Deployment

Visit your deployed URL and check:
- ✅ Landing page loads
- ✅ Sign up creates a new user
- ✅ Login works
- ✅ Dashboard is accessible after login
- ✅ Account page shows user profile
- ✅ Logout works

### 2. Create Admin User

Your first user will have the default "User" role. To promote them to Admin:

1. **Get User ID**:
   - Sign up via your app
   - Go to Supabase dashboard → "Authentication" → "Users"
   - Copy the User ID

2. **Update role via SQL Editor**:
   ```sql
   -- Get the Admin role ID
   SELECT id FROM roles WHERE name = 'Admin';

   -- Insert admin role for user
   INSERT INTO user_roles (user_id, role_id)
   VALUES (
     'your-user-id-here',
     (SELECT id FROM roles WHERE name = 'Admin')
   );
   ```

3. **Verify**: Log out and log back in. You should now have admin permissions.

### 3. Set up Monitoring

#### Vercel Analytics
1. Go to your project → "Analytics"
2. Enable Web Analytics (free)
3. View real-time traffic and performance metrics

#### Supabase Monitoring
1. Go to Supabase dashboard → "Database" → "Logs"
2. Monitor database queries and errors
3. Set up email alerts for critical issues

### 4. Configure Security

#### Supabase RLS Verification
Run this test to verify RLS is working:

1. Create two test users
2. Try to access user A's profile as user B
3. Should be denied (403)

#### CORS Configuration
Vercel automatically handles CORS. If using custom domains:

1. Go to Supabase → "Settings" → "API"
2. Add your Vercel domain to allowed origins:
   ```
   https://your-app.vercel.app
   https://your-custom-domain.com
   ```

---

## Troubleshooting

### Build Failures

#### Error: "Module not found"
```bash
# Solution: Ensure all dependencies are in package.json
npm install
git add package.json package-lock.json
git commit -m "fix: update dependencies"
git push
```

#### Error: "TypeScript errors"
```bash
# Run locally to see errors
npm run typecheck

# Fix errors and commit
git add .
git commit -m "fix: resolve TypeScript errors"
git push
```

#### Error: "Environment variables not found"
- Verify variables are set in Vercel dashboard
- Variable names must start with `VITE_` to be accessible in browser
- Redeploy after adding variables

### Runtime Errors

#### "Supabase client failed to initialize"
**Cause**: Missing or incorrect environment variables

**Solution**:
1. Check Vercel logs: `vercel logs` or via dashboard
2. Verify environment variables are set correctly
3. Ensure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are present
4. Redeploy

#### "Failed to fetch" or CORS errors
**Cause**: Supabase URL not in allowed origins

**Solution**:
1. Go to Supabase → Settings → API
2. Add your Vercel URL to allowed origins
3. Wait 1-2 minutes for changes to propagate

#### Authentication not working
**Cause**: Email confirmation required or incorrect auth settings

**Solution**:
1. Check Supabase → Authentication → Settings
2. Disable "Confirm email" for testing (re-enable for production)
3. Check email templates are configured
4. Verify SMTP settings if using custom email

### Database Issues

#### "relation does not exist"
**Cause**: Migrations not applied

**Solution**:
```bash
cd /home/user/byo
supabase link --project-ref your-project-ref
supabase db push
```

#### RLS policies blocking queries
**Cause**: User doesn't have the required role/permission

**Solution**:
1. Check Supabase logs for RLS policy violations
2. Verify user has correct role in `user_roles` table
3. Check RLS policies in migration file

### Vercel-Specific Issues

#### Deployment succeeds but shows blank page
**Cause**: Incorrect routing configuration or missing environment variables

**Solution**:
1. Check `vercel.json` has correct rewrite rules
2. Verify environment variables are set
3. Check browser console for errors
4. View Vercel Function logs

#### Custom domain not working
**Cause**: DNS not configured correctly

**Solution**:
1. Verify DNS records match Vercel's instructions
2. Wait up to 48 hours for DNS propagation
3. Check SSL certificate status in Vercel dashboard

---

## Production Checklist

Before launching to users:

### Security
- [ ] Environment variables set in Vercel (not hardcoded)
- [ ] `.env.local` in `.gitignore`
- [ ] RLS policies enabled on all tables
- [ ] Supabase API keys are correct (anon key, not service_role key)
- [ ] HTTPS enforced (automatic with Vercel)

### Functionality
- [ ] All pages load correctly
- [ ] Sign up creates user and profile
- [ ] Login works
- [ ] Logout works
- [ ] Protected routes redirect to login
- [ ] RBAC permissions work correctly
- [ ] Forms validate input
- [ ] Error messages display properly

### Performance
- [ ] Build size is acceptable (< 500KB gzipped)
- [ ] Lighthouse score > 90
- [ ] Images optimized
- [ ] No console errors

### Monitoring
- [ ] Vercel Analytics enabled
- [ ] Supabase monitoring configured
- [ ] Error tracking set up (optional: Sentry)

### Content
- [ ] Landing page content updated
- [ ] Email templates customized
- [ ] Terms of service added (if needed)
- [ ] Privacy policy added (if needed)

---

## Useful Commands

### Vercel CLI
```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod

# View logs
vercel logs

# View deployments
vercel ls

# Remove deployment
vercel rm <deployment-url>
```

### Supabase CLI
```bash
# Link to project
supabase link --project-ref <ref>

# Push migrations
supabase db push

# Pull remote schema
supabase db pull

# Generate TypeScript types
supabase gen types typescript --project-id <ref> > src/types/database.types.ts

# View logs
supabase functions logs

# Reset database (DESTRUCTIVE)
supabase db reset
```

---

## Next Steps

After successful deployment:

1. **Add Features**
   - Implement business logic
   - Add payment processing (Stripe)
   - Create admin dashboard
   - Add email notifications

2. **Optimize**
   - Set up CDN for static assets
   - Implement caching strategies
   - Add database indexes
   - Optimize bundle size

3. **Scale**
   - Upgrade Supabase plan if needed
   - Enable Vercel Pro for advanced features
   - Set up staging environment
   - Implement CI/CD improvements

4. **Monitor**
   - Set up uptime monitoring
   - Configure error tracking
   - Analyze user behavior
   - Monitor performance metrics

---

## Support

For issues specific to:
- **Vercel**: https://vercel.com/docs
- **Supabase**: https://supabase.com/docs
- **This boilerplate**: Check `/docs` directory

---

**Deployment Complete!** 🚀

Your BYO SaaS boilerplate is now live and ready for users.
