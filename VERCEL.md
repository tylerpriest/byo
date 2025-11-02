# Vercel Deployment Fix

## Current Issue

Vercel is deploying from the `main` branch (commit `253223e`) which is **outdated** and doesn't have the complete MVP implementation.

The error you're seeing:
```
sh: line 1: vite: command not found
Error: Command "vite build" exited with 127
```

This happens because the old `main` branch doesn't have the proper build configuration.

## Solution Options

### Option 1: Deploy from Feature Branch (Quick Fix)

Deploy directly from the feature branch where all the MVP code lives:

**Via Vercel Dashboard:**

1. Go to your project in Vercel dashboard
2. Click **"Settings"** → **"Git"**
3. Under **"Production Branch"**, change from `main` to:
   ```
   claude/continue-implementation-plan-011CUi6ZncE3Vg78V1CWf5Hf
   ```
4. Click **"Save"**
5. Go to **"Deployments"** → Click **"Redeploy"**

**Via Vercel CLI:**

```bash
# Deploy specific branch to production
vercel --prod --branch claude/continue-implementation-plan-011CUi6ZncE3Vg78V1CWf5Hf
```

### Option 2: Merge to Main (Recommended)

Merge the feature branch to `main` so future deployments work as expected:

```bash
# Switch to main
git checkout main

# Merge feature branch
git merge claude/continue-implementation-plan-011CUi6ZncE3Vg78V1CWf5Hf

# Push to remote
git push origin main
```

Then Vercel will automatically redeploy from the updated `main` branch.

### Option 3: Use Demo Mode (No Supabase Required)

If you want to deploy without setting up Supabase, use demo mode:

**Via Vercel Dashboard:**

1. Go to **Settings** → **Environment Variables**
2. Add:
   - **Name**: `VITE_DEMO_MODE`
   - **Value**: `true`
   - **Environments**: Production, Preview, Development
3. Click **"Save"**
4. **Redeploy** your project

**Via Vercel CLI:**

```bash
vercel env add VITE_DEMO_MODE production
# Enter: true

vercel --prod
```

With demo mode enabled:
- No Supabase connection required
- Login with: `demo@example.com` / any password
- All features work with mock data

## Environment Variables

Once deployed, add these in Vercel dashboard (**Settings** → **Environment Variables**):

### For Demo Mode:
```bash
VITE_DEMO_MODE=true
```

### For Production (with real Supabase):
```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## Build Configuration

The current `vercel.json` configuration is correct:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

This will work once you deploy from the updated branch.

## Testing Locally

To test demo mode locally:

```bash
# Copy demo environment
cp .env.demo .env.local

# Start dev server
npm run dev
```

Visit http://localhost:5173 and login with:
- Email: `demo@example.com`
- Password: (any password)

## Troubleshooting White Screen

If your deployment succeeds but shows a **white screen**:

### Cause
The app is trying to connect to Supabase but the environment variables are missing, causing a runtime error.

### Quick Fix: Enable Demo Mode

**Via Vercel Dashboard:**

1. Go to your project → **Settings** → **Environment Variables**
2. Click **Add New**
3. Enter:
   - **Name**: `VITE_DEMO_MODE`
   - **Value**: `true`
   - **Environments**: ✅ Production, ✅ Preview, ✅ Development
4. Click **Save**
5. Go to **Deployments** tab
6. Click the three dots (•••) on your latest deployment
7. Click **Redeploy**

**Via Vercel CLI:**

```bash
# Add environment variable
vercel env add VITE_DEMO_MODE

# When prompted:
# - Value: true
# - Environments: Production

# Redeploy
vercel --prod
```

### Verify It Works

After redeployment (~2 minutes):

1. Visit your Vercel URL
2. You should see the landing page
3. Click "Get Started"
4. Login with:
   - **Email**: `demo@example.com`
   - **Password**: (any password)

You should now see the dashboard with mock data!

### Check Browser Console

If it's still white:

1. Open browser DevTools (F12)
2. Check **Console** tab for errors
3. Common errors and fixes:
   - `VITE_SUPABASE_URL is not defined` → Add `VITE_DEMO_MODE=true`
   - `Failed to fetch` → CORS issue, enable demo mode
   - `Unexpected token` → Build issue, check Vercel build logs

## Next Steps

1. **Enable demo mode** (quickest solution)
2. **Verify** deployment works
3. **Later**: Set up real Supabase and replace demo mode with production credentials

The white screen should now be fixed! ✅
