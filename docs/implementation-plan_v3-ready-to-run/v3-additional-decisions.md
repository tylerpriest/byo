# V3 Additional Decisions & Clarifications

**Date:** 2025-01-07
**Purpose:** Address key decisions for V3 implementation
**Status:** Decision Document

---

## 1. Admin Dashboard - Early Integration

### Decision: Create Admin Dashboard in Phase 13 (Before Onboarding)

**Rationale:**
- Admins need control panel for demo mode, users, system settings
- Should be available before general onboarding (admins onboard first)
- Enables system configuration without code changes

**Timing:**
- **Phase 13:** Admin Dashboard (NEW - place BEFORE Phase 12 Onboarding)
- Admins get dashboard first, then regular users get onboarding

### Phase 13: Admin Dashboard (NEW - 30 min)

**Purpose:** Centralized control panel for system administration

**Features:**

#### 1. Demo Mode Control
```typescript
// Admin can toggle demo mode without code deployment
- Enable/Disable demo mode globally
- Set demo mode expiration
- Configure demo user permissions
- View demo mode analytics (how many using it)
```

#### 2. User Management
```typescript
- View all users (table with search/filter)
- Assign/remove roles
- Lock/unlock accounts
- View login history
- Reset passwords (send email)
- Impersonate user (for support)
```

#### 3. System Settings
```typescript
- Configure onboarding steps
- Enable/disable features
- Set system-wide announcements
- Configure email templates
- View system health
```

#### 4. Analytics Overview
```typescript
- Total users (by role)
- Active users (last 7/30 days)
- Demo mode usage
- Feature adoption rates
- Error rates
- Performance metrics
```

**Implementation:**

File: `/src/features/admin/components/admin-dashboard.tsx`

```typescript
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { UserManagementTable } from './user-management-table'
import { SystemSettings } from './system-settings'
import { AnalyticsOverview } from './analytics-overview'

export function AdminDashboard() {
  const [demoModeEnabled, setDemoModeEnabled] = useState(false)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    // Load system settings
    loadSystemSettings()
  }, [])

  const loadSystemSettings = async () => {
    const { data } = await supabase
      .from('system_settings')
      .select('demo_mode_enabled')
      .single()

    setDemoModeEnabled(data?.demo_mode_enabled ?? false)
    setLoading(false)
  }

  const toggleDemoMode = async (enabled: boolean) => {
    setDemoModeEnabled(enabled)

    const { error } = await supabase
      .from('system_settings')
      .update({ demo_mode_enabled: enabled })
      .eq('id', 'system')

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to update demo mode setting',
        variant: 'destructive',
      })
      // Rollback
      setDemoModeEnabled(!enabled)
    } else {
      toast({
        title: 'Success',
        description: `Demo mode ${enabled ? 'enabled' : 'disabled'}`,
      })
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">System administration and configuration</p>
      </div>

      {/* Analytics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <AnalyticsOverview />
      </div>

      {/* Demo Mode Control */}
      <Card>
        <CardHeader>
          <CardTitle>Demo Mode</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Switch
              id="demo-mode"
              checked={demoModeEnabled}
              onCheckedChange={toggleDemoMode}
            />
            <Label htmlFor="demo-mode">
              Enable demo mode globally (allows users to explore without Supabase)
            </Label>
          </div>
          {demoModeEnabled && (
            <p className="text-sm text-muted-foreground mt-2">
              ⚠️ Demo mode is active. Users can access the system with mock data.
            </p>
          )}
        </CardContent>
      </Card>

      {/* User Management */}
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
        </CardHeader>
        <CardContent>
          <UserManagementTable />
        </CardContent>
      </Card>

      {/* System Settings */}
      <Card>
        <CardHeader>
          <CardTitle>System Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <SystemSettings />
        </CardContent>
      </Card>
    </div>
  )
}
```

**Database Schema Addition:**

```sql
-- System settings table
CREATE TABLE system_settings (
  id TEXT PRIMARY KEY DEFAULT 'system', -- Single row
  demo_mode_enabled BOOLEAN DEFAULT FALSE,
  maintenance_mode BOOLEAN DEFAULT FALSE,
  announcement TEXT,
  announcement_type TEXT CHECK (announcement_type IN ('info', 'warning', 'error')),
  max_demo_users INTEGER DEFAULT 100,
  demo_mode_expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default settings
INSERT INTO system_settings (id) VALUES ('system');

-- RLS: Only admins can manage
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage system settings"
ON system_settings FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid() AND r.name = 'Admin'
  )
);

-- Anyone can read settings (for demo mode check)
CREATE POLICY "Anyone can read system settings"
ON system_settings FOR SELECT
TO authenticated
USING (true);
```

**Why Early?**
1. Admins need to configure system before users onboard
2. Demo mode toggle should be admin-controlled, not env var only
3. User management needed for assigning first roles
4. System health monitoring catches issues early

**Order:**
```
Phase 11: Demo Mode + Graceful Degradation
Phase 13: Admin Dashboard (NEW)
Phase 12: Onboarding System (for non-admins)
```

---

## 2. TDD Enforcement for Current Build

### Decision: Enforce TDD for Critical Paths ONLY

**What Gets TDD Treatment (Test-First):**
- ✅ **Auth flows** (login, signup, signout, password reset)
- ✅ **RBAC** (permissions, roles, guards)
- ✅ **Admin dashboard** (demo mode toggle, user management)
- ✅ **Payments** (when added - critical!)
- ✅ **Onboarding** (must work for first-time users)
- ✅ **Public APIs** (if exposed)

**What Gets Tests-After (Optional):**
- ⚠️ **UI components** (buttons, cards, etc.)
- ⚠️ **Landing page** (marketing content)
- ⚠️ **Settings pages** (non-critical)
- ⚠️ **Utility functions** (unless used by critical path)

**Process:**

### For Critical Features (TDD Enforced):

```bash
# 1. Write spec
/docs/specs/auth.md

# 2. Write failing tests FIRST
/src/features/auth/__tests__/login.test.tsx

# 3. Run tests (should fail)
npm run test

# 4. Implement feature
/src/features/auth/components/login-page.tsx

# 5. Run tests (should pass)
npm run test

# 6. Refactor if needed
# Keep tests passing

# 7. Pre-commit hook enforces tests pass
git commit -m "feat: add login"
```

### For Non-Critical Features (Tests Optional):

```bash
# 1. Write spec
/docs/specs/landing-page.md

# 2. Implement feature
/src/features/landing/landing-page.tsx

# 3. Optionally add tests if complex
/src/features/landing/__tests__/landing-page.test.tsx

# 4. Commit
git commit -m "feat: add landing page"
```

**CI Enforcement:**

```yaml
# .github/workflows/ci.yml
jobs:
  test-critical:
    name: Test Critical Paths
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run test:critical  # NEW: Only critical tests
      - name: Check coverage threshold
        run: |
          # Ensure critical paths have >80% coverage
          npm run test:coverage -- --coverage.include='src/features/auth/**' --coverage.thresholds.lines=80
          npm run test:coverage -- --coverage.include='src/lib/rbac.ts' --coverage.thresholds.lines=80
          npm run test:coverage -- --coverage.include='src/features/admin/**' --coverage.thresholds.lines=80
```

**package.json:**

```json
{
  "scripts": {
    "test": "vitest",
    "test:critical": "vitest --run --coverage --coverage.include='src/features/{auth,admin}/**' --coverage.include='src/lib/rbac.ts'",
    "test:optional": "vitest --run --coverage --coverage.exclude='src/features/{auth,admin}/**'",
    "test:coverage": "vitest --coverage"
  }
}
```

**Husky Pre-commit:**

```bash
# .husky/pre-commit
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Run lint-staged
npx lint-staged

# ENFORCE: Critical tests must pass
npm run test:critical

# Optional: Other tests (warn but don't block)
npm run test:optional || echo "⚠️  Non-critical tests failed (not blocking commit)"
```

**Why This Approach?**
- **Balance:** TDD for what matters, pragmatic for the rest
- **Quality:** Critical paths are thoroughly tested
- **Speed:** Don't slow down non-critical development
- **CI:** Automated enforcement via pre-commit + CI

---

## 3. End-of-Build Audit - Enhanced

### Decision: Multi-Layer Audit System

**Already in V3 Phase 8:**
- ✅ Security audit (`npm audit`)
- ✅ Outdated dependencies (`npm outdated`)
- ✅ Build size analysis
- ✅ TypeScript check
- ✅ ESLint warnings
- ✅ Test coverage

**Additional Checks (NEW):**

#### 1. White Screen Detection

Add to `/scripts/audit.sh`:

```bash
# 9. White Screen Detection (Smoke Test)
echo ""
echo "9️⃣ White Screen Detection:"

# Start dev server in background
npm run dev &
SERVER_PID=$!
sleep 10  # Wait for server to start

# Check if page loads without errors
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5173)

if [ "$RESPONSE" -eq 200 ]; then
  echo "  ✅ Landing page loads (HTTP 200)"
else
  echo "  ❌ Landing page failed (HTTP $RESPONSE)"
  kill $SERVER_PID
  exit 1
fi

# Check for JavaScript errors in browser
npx playwright test tests/smoke/white-screen.spec.ts

kill $SERVER_PID

echo "  ✅ No white screen detected"
```

**Smoke Test:**

File: `/tests/smoke/white-screen.spec.ts`

```typescript
import { test, expect } from '@playwright/test'

test.describe('White Screen Detection', () => {
  test('landing page should load without errors', async ({ page }) => {
    const errors: string[] = []

    // Capture console errors
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })

    // Capture uncaught exceptions
    page.on('pageerror', (error) => {
      errors.push(error.message)
    })

    // Navigate to page
    await page.goto('/')

    // Wait for app to render
    await page.waitForSelector('body', { state: 'visible' })

    // Check for white screen (body should have content)
    const bodyText = await page.locator('body').textContent()
    expect(bodyText).not.toBe('')

    // Check for critical elements
    const hasContent = await page.locator('h1').count()
    expect(hasContent).toBeGreaterThan(0)

    // Verify no errors
    expect(errors).toEqual([])
  })

  test('dashboard should load for authenticated user', async ({ page }) => {
    const errors: string[] = []

    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text())
    })

    // Login via demo
    await page.goto('/login')
    await page.getByRole('button', { name: /demo login/i }).click()

    // Should navigate to dashboard
    await expect(page).toHaveURL(/.*dashboard/)

    // Dashboard should render
    await page.waitForSelector('h1', { state: 'visible' })
    const heading = await page.locator('h1').textContent()
    expect(heading).toBeTruthy()

    // No errors
    expect(errors).toEqual([])
  })

  test('should gracefully handle missing Supabase credentials', async ({ page }) => {
    // This test verifies graceful degradation
    // Even with missing credentials, app should load in demo mode

    await page.goto('/')

    // Check for demo mode banner OR normal landing page
    const pageLoaded = await page.locator('body').isVisible()
    expect(pageLoaded).toBe(true)

    // Should not have uncaught errors
    const hasError = await page.locator('text=/error/i').count()
    expect(hasError).toBe(0)
  })
})
```

#### 2. Build Production Test

```bash
# 10. Production Build Test
echo ""
echo "🔟 Production Build Test:"

# Build for production
npm run build

# Preview production build
npm run preview &
PREVIEW_PID=$!
sleep 5

# Test production build
PROD_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:4173)

if [ "$PROD_RESPONSE" -eq 200 ]; then
  echo "  ✅ Production build serves correctly"
else
  echo "  ❌ Production build failed (HTTP $PROD_RESPONSE)"
  kill $PREVIEW_PID
  exit 1
fi

# Run Lighthouse on production build
npx lighthouse http://localhost:4173 \
  --only-categories=performance,accessibility,best-practices,seo \
  --output=json \
  --output-path=audit-results/lighthouse-prod.json \
  --quiet

PERF_SCORE=$(cat audit-results/lighthouse-prod.json | jq '.categories.performance.score * 100')
echo "  Performance Score: $PERF_SCORE/100"

kill $PREVIEW_PID
```

#### 3. Deployment Simulation

```bash
# 11. Deployment Simulation (Vercel)
echo ""
echo "1️⃣1️⃣ Deployment Simulation:"

# Check if Vercel CLI is authenticated
if ! vercel whoami &>/dev/null; then
  echo "  ⚠️  Vercel CLI not authenticated (skipping deployment test)"
else
  # Deploy to preview
  PREVIEW_URL=$(vercel deploy --yes --token=$VERCEL_TOKEN | grep -o 'https://.*\.vercel\.app')
  echo "  Preview URL: $PREVIEW_URL"

  # Test preview deployment
  sleep 10  # Wait for deployment
  DEPLOY_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $PREVIEW_URL)

  if [ "$DEPLOY_RESPONSE" -eq 200 ]; then
    echo "  ✅ Deployment successful"
  else
    echo "  ❌ Deployment failed (HTTP $DEPLOY_RESPONSE)"
    exit 1
  fi
fi
```

**GitHub Action Integration:**

```yaml
# .github/workflows/audit.yml
jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      # ... (existing steps)

      - name: White Screen Detection
        run: |
          npm run dev &
          sleep 10
          npx playwright test tests/smoke/

      - name: Production Build Test
        run: |
          npm run build
          npm run preview &
          sleep 5
          curl -f http://localhost:4173 || exit 1

      - name: Lighthouse CI
        uses: treosh/lighthouse-ci-action@v9
        with:
          urls: |
            http://localhost:4173
          uploadArtifacts: true

      - name: Fail if score below threshold
        run: |
          PERF=$(cat lhci_reports/manifest.json | jq '.[0].summary.performance')
          if (( $(echo "$PERF < 0.9" | bc -l) )); then
            echo "❌ Performance score too low: $PERF"
            exit 1
          fi
```

**Checklist for Every Build:**

```markdown
## Pre-Deployment Checklist

### Code Quality
- [ ] All critical tests passing (>80% coverage)
- [ ] No TypeScript errors
- [ ] No ESLint errors (warnings acceptable)
- [ ] All pre-commit hooks passing

### Security
- [ ] No high/critical npm audit vulnerabilities
- [ ] No hardcoded secrets in code
- [ ] All environment variables documented
- [ ] RLS policies tested

### Performance
- [ ] Bundle size < 500KB (gzipped < 150KB)
- [ ] Lighthouse performance > 90
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3.5s

### Functionality
- [ ] Landing page loads without errors
- [ ] Login/signup flows work
- [ ] Demo mode works
- [ ] Dashboard loads for authenticated user
- [ ] Admin dashboard accessible to admins only
- [ ] No white screen on any route

### Deployment
- [ ] Build succeeds
- [ ] Preview deployment works
- [ ] Environment variables set in Vercel
- [ ] Database migrations applied

### Monitoring
- [ ] Error tracking configured (Sentry, etc.)
- [ ] Analytics configured (if applicable)
- [ ] Logs accessible
```

---

## 4. Demo Mode Control Enhancement

### Decision: Admin Toggle + Environment Override

**Hierarchy:**
1. **Admin Dashboard Toggle** (highest priority - runtime)
2. **Environment Variable** (`VITE_DEMO_MODE`) - deployment level
3. **Auto-fallback** (missing credentials) - last resort

**Implementation:**

```typescript
// /src/lib/supabase.ts (enhanced)

import { createClient } from '@supabase/supabase-js'
import { mockSupabase } from './supabase-mock'
import type { Database } from '@/types/database.types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const explicitDemoMode = import.meta.env.VITE_DEMO_MODE === 'true'

// Check admin dashboard setting (if authenticated)
let adminDemoModeEnabled = false

export async function checkAdminDemoModeSetting() {
  // Only check if we have credentials
  if (supabaseUrl && supabaseAnonKey) {
    const client = createClient<Database>(supabaseUrl, supabaseAnonKey)
    const { data } = await client
      .from('system_settings')
      .select('demo_mode_enabled')
      .single()

    adminDemoModeEnabled = data?.demo_mode_enabled ?? false
  }
}

// Auto-detect missing credentials
const credentialsMissing = !supabaseUrl || !supabaseAnonKey

// Priority:
// 1. Admin dashboard toggle (if enabled, use demo)
// 2. Explicit env var (VITE_DEMO_MODE=true)
// 3. Auto-fallback (missing credentials)
const isDemoMode = adminDemoModeEnabled || explicitDemoMode || credentialsMissing

export const isAutoFallbackMode = !adminDemoModeEnabled && !explicitDemoMode && credentialsMissing

// Graceful degradation
if (isDemoMode) {
  if (adminDemoModeEnabled) {
    console.info('🎭 Demo Mode: Enabled by admin (system setting)')
  } else if (explicitDemoMode) {
    console.info('🎭 Demo Mode: Enabled by environment variable')
  } else if (isAutoFallbackMode) {
    console.warn('⚠️  Auto-fallback to Demo Mode: Supabase credentials not configured')
  }
}

export const supabase = isDemoMode
  ? mockSupabase
  : createClient<Database>(supabaseUrl, supabaseAnonKey)

// Export for components to check
export const demoModeReason = adminDemoModeEnabled
  ? 'admin'
  : explicitDemoMode
  ? 'env-var'
  : credentialsMissing
  ? 'auto-fallback'
  : 'none'
```

**Banner Update:**

```typescript
// /src/components/demo-mode-banner.tsx (enhanced)

import { isAutoFallbackMode, demoModeReason } from '@/lib/supabase'

const bannerMessages = {
  'admin': '🎭 Demo Mode enabled by administrator',
  'env-var': '🎭 Demo Mode enabled (environment variable)',
  'auto-fallback': '⚠️ Demo Mode (Supabase credentials not configured)',
}

export function DemoModeBanner() {
  if (demoModeReason === 'none') return null

  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/20 border-b">
      <div className="container flex items-center justify-between py-2 px-4">
        <p className="text-sm">
          {bannerMessages[demoModeReason]}
          <br />
          <span className="text-xs">Login: demo@example.com / any password</span>
        </p>
        {/* Only dismissible if auto-fallback */}
        {isAutoFallbackMode && (
          <Button variant="ghost" size="sm" onClick={() => setDismissed(true)}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
```

---

## Summary of Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| **Admin Dashboard Timing** | Phase 13 (before onboarding) | Admins need control first |
| **TDD Enforcement** | Critical paths only | Balance quality & speed |
| **White Screen Detection** | Automated smoke tests | Catch deployment issues early |
| **Demo Mode Control** | 3-tier hierarchy | Admin > Env > Auto-fallback |
| **Build Audit** | Enhanced with smoke tests | Prevent production failures |

---

**Next:** See `v3-research-items.md` for items requiring research before implementation.
