# Setup Guide

Complete guide to set up the BYO development environment.

## Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **npm** or **yarn**
- **Git**
- **Supabase Account** (free tier works)

## Initial Setup

### 1. Clone and Install

```bash
# Clone the repository
git clone [your-repo-url] byo
cd byo

# Install dependencies
npm install
```

### 2. Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

**Where to find these:**
1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Go to Settings → API
4. Copy the URL and anon/public key

### 3. Database Setup

#### Option A: Local Development (Recommended)

```bash
# Start Supabase locally
npx supabase start

# This will output local credentials
# Update your .env.local with these local values
```

**Local URLs:**
- API URL: `http://localhost:54321`
- Studio: `http://localhost:54323`
- Inbucket (emails): `http://localhost:54324`

#### Option B: Cloud Database

```bash
# Link to your Supabase project
npx supabase link --project-ref your-project-ref

# Push migrations to cloud
npx supabase db push
```

### 4. Run Migrations

```bash
# Apply database migrations
npx supabase migration up

# Or if using cloud
npx supabase db push
```

This creates:
- `profiles` table
- `roles` table with default roles (Admin, Moderator, User, Guest)
- `user_roles` table
- `permissions` table with default permissions
- `role_permissions` table
- RLS policies
- Triggers for auto-creating profiles

### 5. Verify Database Setup

Open Supabase Studio:

**Local:** `http://localhost:54323`
**Cloud:** Go to your project in Supabase Dashboard → Table Editor

You should see these tables:
- ✅ profiles
- ✅ roles (with 4 roles)
- ✅ user_roles
- ✅ permissions (with ~10 permissions)
- ✅ role_permissions

## Development

### Start Dev Server

```bash
npm run dev
```

Visit `http://localhost:5173`

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm test             # Run unit tests
npm run test:ui      # Open Vitest UI
npm run test:e2e     # Run E2E tests
npm run test:e2e:ui  # Open Playwright UI
npm run lint         # Lint code
npm run typecheck    # Check TypeScript types
```

## First Steps

### 1. Create Your First User

1. Start the dev server (`npm run dev`)
2. Navigate to `http://localhost:5173/signup`
3. Create an account

**Note:** In local development, check Inbucket (`http://localhost:54324`) for confirmation emails.

### 2. Verify User Creation

Check Supabase Studio:

1. Go to Authentication → Users
2. Your user should be listed
3. Check Table Editor → profiles
4. Your profile should exist
5. Check Table Editor → user_roles
6. You should have the "User" role

### 3. Grant Admin Access (Optional)

To make yourself an admin for testing:

```sql
-- Run this in Supabase SQL Editor
UPDATE user_roles
SET role_id = (SELECT id FROM roles WHERE name = 'Admin')
WHERE user_id = 'your-user-id';
```

Or insert a new role:

```sql
INSERT INTO user_roles (user_id, role_id)
VALUES (
  'your-user-id',
  (SELECT id FROM roles WHERE name = 'Admin')
);
```

## Testing

### Unit Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with UI
npm run test:ui
```

### E2E Tests

```bash
# Install Playwright browsers (first time only)
npx playwright install

# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Run specific test
npm run test:e2e -- tests/example.spec.ts
```

## Deployment

### Vercel Deployment

1. **Push to GitHub**

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Import to Vercel**

- Go to [Vercel](https://vercel.com)
- Click "Import Project"
- Select your GitHub repository
- Vercel will auto-detect Vite configuration

3. **Add Environment Variables**

In Vercel project settings → Environment Variables:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

4. **Deploy**

Vercel will automatically deploy on every push to `main`.

### Vercel CLI (Alternative)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod
```

## Troubleshooting

### Common Issues

#### 1. "Missing Supabase environment variables"

**Solution:** Make sure `.env.local` exists with correct values.

```bash
cp .env.example .env.local
# Edit .env.local with your credentials
```

#### 2. Database connection errors

**Solution:** Verify your Supabase URL and key are correct.

```bash
# Test connection
curl https://your-project.supabase.co/rest/v1/
```

#### 3. "Table does not exist"

**Solution:** Run migrations.

```bash
npx supabase migration up
# or
npx supabase db push
```

#### 4. RLS policy errors

**Solution:** Make sure RLS policies are created by running migrations.

Check in Supabase Studio → Authentication → Policies

#### 5. Build errors

**Solution:** Clear cache and reinstall.

```bash
rm -rf node_modules
rm package-lock.json
npm install
```

### Debug Mode

Enable debug logging:

```env
# Add to .env.local
VITE_LOG_LEVEL=debug
```

## Development Workflow

### Creating a New Feature

1. Create feature branch

```bash
git checkout -b feature/my-feature
```

2. Move task from `/docs/tasks/draft/` to `/docs/tasks/active/`

3. Write tests first (TDD)

```bash
# Create test file
touch src/features/my-feature/__tests__/my-feature.test.ts
```

4. Implement feature

5. Run tests

```bash
npm test
npm run test:e2e
```

6. Update documentation

7. Commit and push

```bash
git add .
git commit -m "feat: add my feature"
git push origin feature/my-feature
```

8. Create PR → CI runs automatically

9. Merge → Deploys to Vercel

10. Move task to `/docs/tasks/complete/`

## Next Steps

- Read [Architecture](./architecture.md) to understand the system design
- Read [RBAC Guide](./rbac.md) to learn about permissions
- Read [Testing Guide](./testing.md) for testing best practices
- Explore [Implementation Plan](./implementation-plan.md) for roadmap

---

**Need Help?**
- Check [troubleshooting](#troubleshooting) section
- Read [Architecture docs](./architecture.md)
- Open an issue on GitHub
