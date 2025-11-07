# Ready-to-Run Implementation Plan: Modern SaaS Boilerplate

**Project Type:** Web App Boilerplate with SaaS capabilities (MVP focus)
**Tech Stack:** Vite, React 18, TypeScript, Vitest 4.0, Playwright, Vercel, Supabase, TailwindCSS, ShadCN UI
**Principles:** DRY, TDD-Ready, Documentation as Code, Progressive Disclosure, Graceful Degradation, Zero-Config, Fail-Safe
**Estimated Time:** 2-3 hours (MVP with demo mode)

---

## Core Principles

### DRY (Don't Repeat Yourself)
- **Leverage existing solutions:** Use ShadCN official blocks instead of building custom components
- **Use Supabase Auth:** Built-in authentication methods (email/password, magic links, OAuth)
- **Use ShadCN patterns:** react-hook-form + Zod for forms (official recommendation)
- **Use TanStack Table:** For data tables (official ShadCN integration)
- **Reference, don't rebuild:** Study existing patterns, but use official blocks
- **Database-level security:** Supabase RLS for authorization
- **Mock for testing:** Create compatible mock clients for zero-config experience

### TDD-Ready (Not TDD-Enforced)
- Vitest 4.0 for unit testing (infrastructure ready)
- Testing Library for React component testing
- Playwright for E2E testing
- Test scripts in CI/CD pipeline
- Example tests provided, comprehensive suite optional
- Enable TDD, don't mandate it

### Documentation as Code
- All documentation in version control
- Markdown format for accessibility
- Progressive disclosure (simple → detailed)
- Living documentation updated with code
- No documentation in root unless required
- Single Source of Truth (SSOT)

### Graceful Degradation & Fail-Safe
- **Never crash on missing config** - Provide fallbacks instead
- **Zero-config quick start** - Works immediately after clone
- **Auto-detect missing credentials** - Fall back to demo mode
- **Clear communication** - Show banners/warnings when in fallback mode
- **Fail-safe over fail-hard** - System enters safe state on errors
- **Mock clients for dependencies** - Enable offline/testing without external services

### Zero-Config Approach
- **Works out of the box** - No setup required for initial exploration
- **Demo mode by default** - Auto-fallback when credentials missing
- **Two-tier quick start** - Demo (instant) vs. Full setup (when ready)
- **Progressive enhancement** - Add real services when needed
- **Lower barrier to entry** - Users can explore before committing

---

## Implementation Phases

### Phase 1: Fresh Vite + React + TypeScript Setup (5 min)

**Tasks:**
1. Initialize with `npm create vite@latest byo -- --template react-ts`
2. Install base dependencies
3. Configure TypeScript (`tsconfig.json`, `tsconfig.node.json`)
4. Set up Git repository with `.gitignore`
5. Create directory structure

**Directory Structure:**
```
/src/
  /features/          # Feature-based organization
    /auth/            # Authentication (login, signup, context)
    /dashboard/       # Dashboard page and components
    /account/         # Account management
    /settings/        # User settings
    /landing/         # Landing page
  /components/
    /ui/              # ShadCN components
  /lib/               # Utilities
    supabase.ts       # Supabase client with auto-fallback
    supabase-mock.ts  # Mock Supabase client for demo mode
    rbac.ts           # Permission utilities
    logger.ts         # Pino logger
    utils.ts          # General utilities (cn, etc.)
  /hooks/             # Custom React hooks
  /types/             # TypeScript types
    database.types.ts # Generated Supabase types
/docs/                # All documentation
  /specs/             # Technical specifications
  /tasks/             # Task management
    /active/          # Current tasks
    /complete/        # Completed tasks
    /template/        # Task templates
    /draft/           # Future/planned tasks
  /prompts/           # AI prompts and session summaries
/.github/
  /workflows/         # CI/CD workflows
    ci.yml            # Lint, typecheck, test
    deploy.yml        # Vercel deployment
    types.yml         # Supabase type generation
/tests/               # E2E tests
/public/              # Static assets
```

**Notes:**
- Feature-based organization scales better than file-type organization
- Mock client alongside real client for graceful degradation
- Task management structure from the start

---

### Phase 2: TailwindCSS + ShadCN UI (10 min)

**Tasks:**
6. Install TailwindCSS + PostCSS + Autoprefixer
   ```bash
   npm install -D tailwindcss postcss autoprefixer
   npx tailwindcss init -p
   ```
7. Initialize ShadCN UI
   ```bash
   npx shadcn@latest init
   ```
8. Install official ShadCN blocks via CLI:
   ```bash
   npx shadcn add dashboard-01    # Complete dashboard layout
   npx shadcn add sidebar-07      # Collapsible sidebar
   npx shadcn add login-03        # Auth UI
   ```
9. Install core components:
   ```bash
   npx shadcn add form dialog toast breadcrumb button card input dropdown-menu avatar badge separator sheet alert
   ```
10. **Configure ShadCN MCP server** for component management (optional)
    ```bash
    npx shadcn@latest mcp
    ```

**Why These Blocks:**
- `dashboard-01`: Full dashboard with sidebar, charts, data table
- `sidebar-07`: Sidebar that collapses to icons (mobile-friendly)
- `login-03`: Clean login page with muted background

**Additional Components:**
- `alert`: For demo mode banner

---

### Phase 3: Supabase Integration + Mock Client (20 min)

**Tasks:**
11. Install Supabase packages
    ```bash
    npm install @supabase/supabase-js @supabase/ssr
    ```
12. Initialize Supabase CLI (optional for local development)
    ```bash
    npx supabase init
    ```
13. Create database schema with migrations

**Database Schema:**

**Tables:**
- `auth.users` (Supabase built-in)
- `profiles` - Extended user information
  - `id` (uuid, FK to auth.users)
  - `display_name` (text)
  - `avatar_url` (text)
  - `created_at` (timestamp)
  - `updated_at` (timestamp)

- `roles` - User roles
  - `id` (uuid, PK)
  - `name` (text) - 'Admin', 'Moderator', 'User', 'Guest'
  - `description` (text)
  - `created_at` (timestamp)

- `user_roles` - User-role mapping (many-to-many)
  - `user_id` (uuid, FK to auth.users)
  - `role_id` (uuid, FK to roles)
  - `assigned_at` (timestamp)
  - `assigned_by` (uuid, FK to auth.users)
  - Primary key: (user_id, role_id)

- `permissions` - Available permissions
  - `id` (uuid, PK)
  - `name` (text) - e.g., 'users.read', 'users.write'
  - `resource` (text) - e.g., 'users', 'settings'
  - `action` (text) - e.g., 'read', 'write', 'delete'
  - `description` (text)

- `role_permissions` - Role-permission mapping
  - `role_id` (uuid, FK to roles)
  - `permission_id` (uuid, FK to permissions)
  - Primary key: (role_id, permission_id)

**Four Roles:**
1. **Admin** - Full system access, user management
2. **Moderator/Editor** - Elevated permissions, content management
3. **User** - Standard user permissions
4. **Guest/Viewer** - Read-only or limited access

**10 Permissions (Example):**
- `users.read`, `users.write`, `users.delete`
- `settings.read`, `settings.write`
- `content.read`, `content.write`, `content.delete`
- `reports.read`, `reports.write`

14. **Create Mock Supabase Client** (`/src/lib/supabase-mock.ts`):
    - Implement compatible API with real Supabase client
    - Mock auth methods: signInWithPassword, signUp, signOut, getSession, getUser
    - Mock database methods: select, insert, update, delete
    - Mock query filters: eq, in, single
    - Include demo data: demo user, roles, permissions
    - Zero network calls, instant responses
    - ~280 lines

**Demo Data in Mock:**
```typescript
const DEMO_USER = {
  id: 'demo-user-123',
  email: 'demo@example.com',
  user_metadata: { display_name: 'Demo User' },
  created_at: new Date().toISOString(),
}

const DEMO_ROLES = [
  { id: 'role-1', name: 'Admin', description: 'Full access' },
  { id: 'role-2', name: 'User', description: 'Standard access' },
]
```

15. **Configure RLS policies** using Supabase helper functions (19 policies)

16. Generate TypeScript types
    ```bash
    npx supabase gen types typescript --local > src/types/database.types.ts
    ```

17. **Create Supabase client utility** (`/src/lib/supabase.ts`) with graceful degradation:
    ```typescript
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
    const explicitDemoMode = import.meta.env.VITE_DEMO_MODE === 'true'

    // Auto-detect missing credentials
    const isDemoMode = explicitDemoMode || !supabaseUrl || !supabaseAnonKey
    export const isAutoFallbackMode = !explicitDemoMode && (!supabaseUrl || !supabaseAnonKey)

    // Graceful degradation: fallback to mock instead of crashing
    if (isDemoMode) {
      console.warn('⚠️  Demo Mode: Using mock Supabase client')
      export const supabase = mockSupabase
    } else {
      export const supabase = createClient(supabaseUrl, supabaseAnonKey)
    }
    ```

18. **Create environment files:**
    - `.env.example` - Template with all variables documented
    - `.env.demo` - Quick demo setup (just `VITE_DEMO_MODE=true`)
    - Update `vite-env.d.ts` with `VITE_DEMO_MODE` type

**RLS Policy Examples:**
```sql
-- Users can read their own profile
CREATE POLICY "Users can read own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

-- Admins can read all profiles
CREATE POLICY "Admins can read all profiles"
ON profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid()
    AND r.name = 'Admin'
  )
);
```

**Key Pattern: Graceful Degradation**
- Missing config → Demo mode (not error)
- Clear warnings (not silent)
- Works offline
- Zero barriers to exploration

---

### Phase 4: Authentication - Supabase + ShadCN Form + Demo Login (20 min)

**Tasks:**
19. Implement Supabase's built-in auth methods:
    - ✅ Email/password authentication
    - ✅ Password reset (via Supabase built-in)
    - ⏭️ Magic links (optional, not in MVP)
    - ⏭️ OAuth providers (optional, not in MVP)

20. Install form dependencies
    ```bash
    npm install react-hook-form @hookform/resolvers zod
    ```

21. Create auth context using Supabase's `onAuthStateChange`
    - File: `/src/features/auth/context/auth-context.tsx`
    - Hooks: `useAuth()`, `useUser()`, `useSession()`
    - Session persistence
    - Auto token refresh
    - ~130 lines

22. Create auth pages from `login-03` block:
    - **Login page** with:
      - Email/password form (react-hook-form + Zod)
      - **Demo Login button** (one-click demo access)
      - Link to signup
      - "Forgot password" link
    - **Signup page**
    - Password reset page (optional, can use Supabase built-in email flow)

**Demo Login Button Implementation:**
```typescript
const handleDemoLogin = () => {
  // Auto-fill demo credentials
  form.setValue('email', 'demo@example.com')
  form.setValue('password', 'demo123') // Any password works in demo mode
  // Submit form
  form.handleSubmit(onSubmit)()
}

// In UI (after main sign-in button):
<div className="relative">
  <div className="absolute inset-0 flex items-center">
    <span className="w-full border-t" />
  </div>
  <div className="relative flex justify-center text-xs uppercase">
    <span className="bg-background px-2 text-muted-foreground">Or</span>
  </div>
</div>
<Button
  type="button"
  variant="outline"
  className="w-full"
  onClick={handleDemoLogin}
  disabled={isLoading}
>
  Demo Login
</Button>
```

23. Implement protected routes with React Router
    - Route guards checking session
    - Redirect to login if not authenticated
    - ProtectedRoute component

**Benefits of Demo Login Button:**
- One-click demo access
- No manual credential entry
- Lower barrier to entry
- Better first impression
- Faster testing during development

---

### Phase 5: RBAC - Supabase RLS (15 min)

**Tasks:**
24. Create permission utilities using Supabase JWT claims
    - File: `/src/lib/rbac.ts` (~160 lines)
    - Functions: `hasPermission()`, `hasRole()`, `hasAnyRole()`, `hasAllPermissions()`, etc.
    - In-memory caching for performance
    - Works with demo data in mock client

25. Create custom RBAC hooks
    - File: `/src/hooks/use-rbac.ts`
    - 6 hooks: `useHasPermission`, `useHasRole`, `useHasAnyRole`, `useUserRoles`, `useUserPermissions`, `useIsAdmin`

26. Implement route guards with React Router
    - ✅ Authentication-based route guards (ProtectedRoute)
    - ⏭️ Permission-based route guards (optional for MVP)
    - ⏭️ 403 page for unauthorized access (optional for MVP)

27. Use `hasPermission()` helper for conditional UI rendering
    - Example: `{hasRole('Admin') && <AdminSection />}`
    - Example: `{hasPermission('users.write') && <EditButton />}`

28. Implement authorization via Supabase RLS
    - Database-level security with 19 RLS policies
    - No client-side security bypass
    - JWT claims available in RLS policies
    - Users can only view/edit their own profile
    - Admins can view all profiles and assign roles

**RBAC Implementation Example:**
```typescript
// /src/lib/rbac.ts
export async function hasPermission(permission: string): Promise<boolean> {
  const user = await supabase.auth.getUser()
  if (!user.data.user) return false

  const { data: permissions } = await supabase
    .from('role_permissions')
    .select('permissions(name)')
    .eq('user_id', user.data.user.id)

  return permissions?.some(p => p.permissions.name === permission) ?? false
}

// In components:
{hasRole('Admin') && <AdminDashboard />}
{hasPermission('users.write') && <EditUserButton />}
```

---

### Phase 6: Assemble Pages from ShadCN Blocks (15 min)

**Tasks:**
29. Create Landing Page
    - File: `/src/features/landing/landing-page.tsx`
    - Hero section with gradient background
    - CTAs linking to signup/login
    - Feature highlights grid
    - Footer with links
    - Use ShadCN components (Button, Card)

30. Create Dashboard (Blank Canvas Approach)
    - File: `/src/features/dashboard/dashboard-page.tsx`
    - Welcome card with user's display name
    - Shows user's roles and permission count
    - **Role-based sections** (placeholder cards):
      - Admin section (shows for Admin role)
      - Moderator section (shows for Admin/Moderator roles)
      - User section (shows for all authenticated users)
    - Commented examples showing how to add features
    - Ready for customization

**Dashboard Structure:**
```tsx
<DashboardLayout>
  <Header user={user} />
  <Sidebar />
  <Main>
    <WelcomeCard user={user} roles={roles} />

    {/* Admin-only section */}
    {hasRole('Admin') && (
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>Manage users and roles</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Add your admin content here
          </p>
        </CardContent>
      </Card>
    )}

    {/* Placeholder cards for future features */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <PlaceholderCard title="Analytics" />
      <PlaceholderCard title="Recent Activity" />
      <PlaceholderCard title="Quick Actions" />
    </div>
  </Main>
</DashboardLayout>
```

31. Create Account/Settings Pages
    - Account page: Display name editing, email display
    - Settings page: Placeholder sections for future features
    - Use ShadCN Form components
    - Optimistic UI with toast notifications

32. Create Layout with collapsible sidebar
    - File: `/src/components/dashboard-layout.tsx`
    - Collapsible sidebar (mobile: <1024px)
    - Navigation: Dashboard, Account, Settings
    - User dropdown menu:
      - Account Settings link
      - Preferences link
      - Sign Out button
    - Mobile-responsive with backdrop
    - Shows user email and primary role
    - Uses `sidebar-07` block as base

---

### Phase 7: Testing - Vitest 4.0 + Playwright (15 min)

**Tasks:**
33. Configure Vitest
    ```bash
    npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom @testing-library/user-event
    ```
    - Create `vitest.config.ts`
    - Create test utils in `/src/lib/test-utils.tsx`
    - Configure jsdom environment
    - Add global test setup

34. Configure Playwright
    ```bash
    npm init playwright@latest
    ```
    - Create `playwright.config.ts`
    - Configure for React app (localhost:5173)
    - Configure browsers: Chromium, Firefox, WebKit
    - Enable trace on first retry
    - Enable screenshot on failure

35. Create example tests (TDD-ready, not comprehensive)
    - Example unit test: `/src/components/__tests__/button.test.tsx`
    - Example RBAC test: `/src/lib/__tests__/rbac.test.ts`
    - Example E2E test: `/tests/login.spec.ts`
    - Test mock Supabase client compatibility
    - ~5% coverage (infrastructure ready, comprehensive suite optional)

36. Add test scripts to `package.json`
    ```json
    {
      "scripts": {
        "test": "vitest",
        "test:ui": "vitest --ui",
        "test:e2e": "playwright test",
        "test:e2e:ui": "playwright test --ui",
        "test:coverage": "vitest --coverage"
      }
    }
    ```

**Example Test:**
```typescript
// /tests/demo-login.spec.ts
import { test, expect } from '@playwright/test'

test('demo login button works', async ({ page }) => {
  await page.goto('http://localhost:5173')
  await page.click('text=Demo Login')
  await expect(page).toHaveURL(/.*dashboard/)
  await expect(page.locator('text=Demo User')).toBeVisible()
})
```

**Note:** Testing infrastructure is complete, but comprehensive test coverage is optional for MVP. Add tests based on your team's needs.

---

### Phase 8: CI/CD with GitHub Actions (10 min)

**Tasks:**
37. Create `.github/workflows/ci.yml`
    - Run on PR and push to main
    - Jobs: lint, typecheck, test (unit + E2E)
    - Fail PR if tests fail
    - Cache node_modules for speed

38. Create `.github/workflows/deploy.yml`
    - Deploy to Vercel on push to main
    - Preview deployments for PRs
    - Environment variables from Vercel
    - Auto-comment PR with preview URL

39. Create `.github/workflows/types.yml`
    - Auto-generate Supabase types on schema changes
    - Create PR with updated types
    - Run weekly or on database migration changes
    - Requires Supabase project and access token

40. Configure Vercel project
    - Link GitHub repository
    - Set environment variables:
      - `VITE_SUPABASE_URL` (optional - will use demo mode if missing)
      - `VITE_SUPABASE_ANON_KEY` (optional - will use demo mode if missing)
      - `VITE_DEMO_MODE=true` (for explicit demo deployments)
    - Enable automatic deployments

**Zero-Config Deployment:**
- Vercel deployment works without any environment variables
- Auto-falls back to demo mode
- Shows yellow warning banner
- Can add Supabase credentials later

---

### Phase 9: Documentation as Code (15 min)

**Tasks:**
41. Create `/docs/` documentation:
    - `architecture.md` - System architecture, design decisions
    - `setup.md` - Development environment setup
    - `auth.md` - Authentication flow, Supabase integration
    - `rbac.md` - RBAC system, roles, permissions
    - `deployment.md` - Vercel deployment, environment setup
    - `testing.md` - Testing strategy, running tests
    - `demo-mode.md` - Demo mode system, mock client

42. Create `/docs/specs/` specifications:
    - `database-schema.md` - Complete database schema with diagrams
    - `api-spec.md` - API endpoints (if custom APIs added)
    - `rbac-spec.md` - Detailed RBAC permissions matrix

43. Create `/docs/tasks/` structure:
    - `/active/` - Tasks currently in progress
    - `/complete/` - Finished tasks (archived)
    - `/template/` - Task templates for common work
    - `/draft/` - Future/planned tasks

44. Create task templates in `/docs/tasks/template/`:
    - `feature-template.md`
    - `bug-template.md`
    - `refactor-template.md`

45. Create `/docs/prompts/` for AI context:
    - `ready-to-run.md` - This document
    - Session summaries for major implementations
    - AI assistant guidelines

46. Add `/docs/claude.md` for AI context (or keep in root as `/CLAUDE.md`)
    - Project overview
    - Key architectural decisions
    - Where to find things
    - Common tasks and patterns
    - Tech stack details

47. **Progressive Disclosure**
    - Simple `README.md` with quick start (two options: demo vs full)
    - Links to detailed documentation in `/docs/`
    - External docs link to online resources

---

### Phase 10: DX & Error Handling (10 min)

**Tasks:**
48. Configure Pino logger
    ```bash
    npm install pino pino-pretty
    ```
    - Create logger utility in `/src/lib/logger.ts`
    - Browser-compatible configuration
    - Log levels: debug, info, warn, error
    - Use in auth context and RBAC utilities

49. Implement ShadCN Toast for user notifications
    - Toast component: `/src/components/ui/toast.tsx`
    - Toaster component: `/src/components/ui/toaster.tsx`
    - useToast hook: `/src/components/ui/use-toast.ts`
    - Success messages (account updates)
    - Error messages (auth failures)
    - Consistent UX across app

50. Create React Error Boundaries
    - File: `/src/components/error-boundary.tsx`
    - Catches React errors gracefully
    - Displays user-friendly error UI
    - Logs errors for debugging
    - Reset button to retry
    - Wrap app in error boundary

51. Create optimistic UI helpers (optional for MVP)
    - Utility file: `/src/lib/optimistic-ui.ts`
    - Basic structure for optimistic updates
    - Not fully integrated initially
    - Ready for future enhancements

52. Configure ESLint + Prettier
    ```bash
    npm install -D eslint-config-prettier prettier
    ```
    - ESLint rules for React, TypeScript (`.eslintrc.cjs`)
    - Prettier for code formatting (`.prettierrc`)
    - Prettier ignore file (`.prettierignore`)
    - ⏭️ Pre-commit hooks with Husky (optional, not in MVP)

---

### Phase 11: Demo Mode & Graceful Degradation (15 min)

**Tasks:**
53. **Create DemoModeBanner component** (`/src/components/demo-mode-banner.tsx`):
    - Yellow warning banner at top of page
    - Shows only in auto-fallback mode (not explicit demo mode)
    - Dismissible with X button
    - Shows demo login credentials
    - Responsive design (mobile/desktop)
    - Dark mode support
    - ~60 lines

**Banner Design:**
```tsx
{!isAutoFallbackMode || dismissed ? null : (
  <div className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200">
    <div className="container flex items-center justify-between py-2 px-4">
      <div className="flex items-center gap-2">
        <AlertTriangle className="h-4 w-4" />
        <p className="text-sm">
          Running in Demo Mode - using mock data (Supabase credentials not configured)
          <br />
          <span className="text-xs">Login: demo@example.com / any password</span>
        </p>
      </div>
      <Button variant="ghost" size="sm" onClick={() => setDismissed(true)}>
        <X className="h-4 w-4" />
      </Button>
    </div>
  </div>
)}
```

54. **Add banner to App component** (`/src/App.tsx`):
    - Import DemoModeBanner
    - Render at top of app (before routes)
    - Only shows in auto-fallback mode

55. **Create deployment documentation**:
    - `DEPLOYMENT.md` - Comprehensive Vercel & Supabase deployment guide (~530 lines)
    - `VERCEL.md` - Vercel troubleshooting guide (~200 lines)
    - `GITHUB_CLI_SETUP.md` - GitHub CLI setup (~180 lines)

56. **Update README** with demo mode instructions:
    - Add demo mode to features list
    - Two quick start options (demo vs full)
    - Update roadmap
    - Update status to "MVP Complete"

57. **Environment variable configuration**:
    - `.env.example` - Full setup with all variables
    - `.env.demo` - Quick demo setup (`VITE_DEMO_MODE=true`)
    - Update `vite-env.d.ts` with `VITE_DEMO_MODE` type

**Key Achievement:**
- **Before:** Missing Supabase credentials → Hard error → White screen
- **After:** Missing Supabase credentials → Auto demo mode → Fully functional app

**Design Pattern:** Graceful Degradation / Fault Tolerance
- System continues operating with reduced functionality when services fail
- Fail-safe approach instead of fail-hard
- Clear communication via banner when in fallback mode

---

## Key Features Implemented

✅ **Email/password authentication** with Supabase (signIn, signUp, signOut, password reset)
✅ **4-tier RBAC** (Admin, Moderator, User, Guest roles with 10 permissions)
✅ **Demo mode system** with complete mock Supabase client (~280 lines)
✅ **Graceful degradation** - auto-fallback when Supabase credentials missing
✅ **Demo login button** - one-click demo access on login page
✅ **Demo mode banner** - notifies users when in auto-fallback mode
✅ **TDD-ready testing infrastructure** (Vitest + Playwright configured, example tests provided)
✅ **Feature-based organization** in `/src` (auth, dashboard, account, settings, landing)
✅ **ShadCN UI components** (15+ components: Button, Card, Input, Form, Toast, Alert, etc.)
✅ **ShadCN blocks** (dashboard-01, sidebar-07, login-03)
✅ **Custom RBAC hooks** - 6 hooks for role/permission checking
✅ **Pino logging** with error boundaries
✅ **Zod schema validation** on all forms
✅ **Fully typed with TypeScript** (strict mode)
✅ **Vercel deployment ready** with comprehensive deployment guides
✅ **Zero-config quick start** - works without any setup (auto-fallback to demo mode)
✅ **Mobile-responsive layout** with collapsible sidebar
✅ **Documentation as Code** in `/docs` (15+ docs)
✅ **CI/CD automation** with GitHub Actions (3 workflows: CI, deploy, types)
✅ **Database schema** with RLS policies (5 tables, 19 RLS policies)
✅ **Mock client pattern** for offline/testing without external dependencies

---

## What's NOT Implemented (Optional for MVP)

These features are **not required for MVP** but can be added later:

### Authentication (Optional)
- ❌ OAuth Providers (Google, GitHub, etc.)
- ❌ Magic Links
- ❌ Email Verification
- ❌ Two-Factor Authentication

### Pages & UI (Optional)
- ❌ Admin Dashboard with user management UI
- ❌ Password Change UI (can use Supabase built-in email flow)
- ❌ Email Change UI
- ❌ Profile Picture Upload
- ❌ 403 Unauthorized Page

### Email & Notifications (Optional)
- ❌ Email Notifications (SendGrid/Mailgun/Resend integration)
- ❌ Transactional Emails
- ❌ Notification Preferences

### Advanced Features (Optional)
- ❌ Payment Processing (Stripe integration)
- ❌ Subscription Management
- ❌ Role/Permission Management UI (RBAC works, but no admin UI)
- ❌ User Management (listing, editing, deletion)
- ❌ Analytics Dashboard

### Testing (Optional)
- ❌ Comprehensive Test Suite (infrastructure ready, comprehensive coverage optional)
- ❌ Full auth flow tests
- ❌ Form validation tests
- ❌ Component tests for all pages

### Developer Experience (Optional)
- ❌ Pre-commit Hooks (Husky)
- ❌ Optimistic UI Integration (utilities exist but not integrated)
- ❌ Supabase Realtime (can be added when needed)

---

## DRY Principles Applied

| Instead of Building... | We Use... |
|------------------------|-----------|
| Custom dashboard layout | ShadCN `dashboard-01` block |
| Custom sidebar | ShadCN `sidebar-07` block |
| Custom login UI | ShadCN `login-03` block |
| Custom auth system | Supabase Auth (email, magic links, OAuth) |
| Custom form validation | react-hook-form + Zod (ShadCN pattern) |
| Custom data tables | TanStack Table (ShadCN integration) |
| Custom authorization | Supabase RLS policies |
| Custom session management | Supabase `onAuthStateChange` |
| Custom type generation | Supabase CLI `gen types` |
| Custom component library | ShadCN UI official components |
| Custom mock for testing | Mock Supabase client (compatible API) |
| Hard errors on missing config | Graceful degradation to demo mode |

---

## Dashboard Design (MVP)

**Blank Canvas Approach:**
- Clean, minimal layout from `dashboard-01` block
- Welcome section with user's name and role
- Empty grid/card layout ready for customization
- **Role-based sections:**
  - Admin section (only admins see this)
  - Moderator section (admins and moderators)
  - User section (all authenticated users)
- Placeholder components that can be uncommented
- Ready to plug in business logic
- No assumptions about what features you need

---

## Development Workflow

1. **Create feature branch** from `main`
2. **Move task** from `/docs/tasks/draft/` to `/docs/tasks/active/`
3. **Write tests first** (optional, TDD approach)
4. **Implement feature** using ShadCN blocks and Supabase
5. **Update documentation** as you code (Living Documentation)
6. **Run tests** locally before committing
7. **Commit with conventional commits** (feat:, fix:, docs:, refactor:, test:)
8. **Push and create PR** - CI runs automatically
9. **Review and merge** - Deploys to Vercel
10. **Move task** to `/docs/tasks/complete/`

---

## Quick Start (Two Options)

### Option 1: Demo Mode (Zero Config, Instant)
```bash
# Clone the repo
git clone <repo-url>
cd byo

# Install dependencies
npm install

# Option 1A: Use demo env file
cp .env.demo .env.local

# Option 1B: Skip env file (auto-fallback to demo mode)
# (No .env.local file at all - just works!)

# Start development server
npm run dev

# Visit http://localhost:5173
# Click "Demo Login" or use: demo@example.com / any password
```

### Option 2: Full Setup (With Supabase)
```bash
# Clone the repo
git clone <repo-url>
cd byo

# Install dependencies
npm install

# Set up Supabase
npx supabase init
npx supabase start  # Starts local Supabase

# Or create cloud Supabase project at https://supabase.com

# Copy environment template
cp .env.example .env.local

# Edit .env.local with your Supabase credentials
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Run migrations (if using cloud)
npx supabase db push

# Start development server
npm run dev
```

---

## Next Steps After Setup

### Immediate:
1. Explore the demo mode
2. Customize landing page with actual content
3. Add business-specific features to dashboard
4. Decide if you need Supabase (or stay in demo mode for prototyping)

### Short-term:
1. Set up Supabase project in cloud (if not using demo mode)
2. Configure environment variables for production
3. Deploy to Vercel
4. Test auth flow end-to-end
5. Customize dashboard with your features
6. Add more pages (pricing, about, etc.)

### Long-term:
1. Add payment integration (Stripe, etc.)
2. Implement email notifications
3. Add analytics/monitoring
4. Build admin panel features
5. Add multi-tenancy (if SaaS)
6. Expand test coverage

---

## Future Enhancements (Post-MVP)

### Product Management & Task Organization
- [ ] Import task templates and commands from ChemJungle project
- [ ] Study best practices with AI agents (Nov 2025)
- [ ] Research: https://github.com/steveyegge/beads
- [ ] Implement structured spec and task workflow

### Claude AI Integration
- [ ] Research Claude Skills
- [ ] Research Claude Plugins
- [ ] Research Claude Agents
- [ ] ShadCN MCP server integration (already available: `npx shadcn@latest mcp`)

### Testing Enhancements
- [ ] Comprehensive test coverage (currently ~5%)
- [ ] Vitest 4.0 with all features enabled
- [ ] Playwright with MCP and Agents integration
- [ ] Consider TDD enforcement vs. optional

### Infrastructure
- [ ] Docker for local Supabase (vs. npx supabase start)
- [ ] Pre-commit hooks with Husky
- [ ] Identify MCPs/CLIs that need authentication setup

### Documentation
- [ ] Consolidate documentation (avoid duplication)
- [ ] Single Source of Truth (SSOT) enforcement
- [ ] Review: Should this be a new doc or update existing?

### Authentication
- [ ] OAuth providers (Google, GitHub)
- [ ] Magic links
- [ ] Email verification
- [ ] Two-factor authentication

### Payment & Subscriptions
- [ ] Stripe integration
- [ ] Subscription plans
- [ ] Billing portal
- [ ] Usage tracking

### Admin Features
- [ ] User management UI
- [ ] Role assignment interface
- [ ] Permission management
- [ ] Analytics dashboard

### Email & Notifications
- [ ] SendGrid/Mailgun/Resend integration
- [ ] Transactional emails
- [ ] Welcome emails
- [ ] Password reset emails
- [ ] Notification preferences

---

## Environment Variables Reference

```bash
# Supabase (Optional - will use demo mode if missing)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Demo Mode (Optional - auto-detected if Supabase vars missing)
VITE_DEMO_MODE=true  # Explicit demo mode (no auto-fallback banner)

# Local Development (Optional)
VITE_SUPABASE_LOCAL_URL=http://localhost:54321
```

**Behavior:**
- **No env file:** Auto-fallback to demo mode (shows banner)
- **`VITE_DEMO_MODE=true`:** Explicit demo mode (no banner)
- **Supabase vars present:** Real Supabase mode
- **Missing one Supabase var:** Auto-fallback to demo mode (shows banner)

---

## Code Patterns & Conventions

### Naming Conventions
- **Components:** PascalCase (`LoginForm.tsx`)
- **Utilities:** camelCase (`hasPermission()`)
- **Files:** kebab-case for non-components (`auth-context.tsx`)
- **Types:** PascalCase with `Type` or `Interface` suffix if needed

### Import Aliases
- `@/components` → `/src/components`
- `@/lib` → `/src/lib`
- `@/hooks` → `/src/hooks`
- `@/types` → `/src/types`
- `@/features` → `/src/features`

### Component Structure
```tsx
// 1. Imports (external, then internal)
import { useState } from 'react'
import { Button } from '@/components/ui/button'

// 2. Types
interface MyComponentProps {
  title: string
}

// 3. Component
export function MyComponent({ title }: MyComponentProps) {
  // Hooks first
  const [state, setState] = useState(false)

  // Event handlers
  const handleClick = () => {}

  // Render
  return <div>{title}</div>
}
```

### Permission Checking
```tsx
// In components
{hasPermission('users.write') && <EditButton />}
{hasRole('Admin') && <AdminSection />}

// In routes (loaders)
if (!hasRole('Admin')) {
  throw redirect('/403')
}
```

### Supabase Queries
```tsx
// With RLS, security is at database level
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .single()
// RLS automatically filters based on JWT
```

### Graceful Degradation Pattern
```typescript
// For any external dependency:
const isAvailable = checkAvailability()

if (!isAvailable) {
  console.warn('⚠️  Falling back to mock/demo mode')
  return mockImplementation
}

return realImplementation
```

**Apply this pattern to:**
- Payment processing (mock Stripe)
- Email service (mock SendGrid)
- Storage (mock S3)
- Analytics (mock Mixpanel)

---

## Common Pitfalls & Solutions

### Pitfall: RLS Policy Not Working
**Solution:** Ensure JWT includes necessary claims, check policy with `explain`

### Pitfall: Types Out of Sync
**Solution:** Regenerate types after schema changes: `npx supabase gen types typescript`

### Pitfall: ShadCN Component Not Found
**Solution:** Install the component: `npx shadcn add [component-name]`

### Pitfall: Environment Variables Not Loading
**Solution:**
- Prefix with `VITE_` for client-side access
- Restart dev server after changing `.env.local`
- Check if auto-fallback to demo mode is happening

### Pitfall: Tests Failing After Supabase Change
**Solution:** Mock Supabase in tests, don't use real database

### Pitfall: White Screen on Vercel
**Solution:**
- Check if Supabase credentials are set in Vercel
- If intentional demo deployment, verify demo mode is working
- Check browser console for errors
- See VERCEL.md for troubleshooting

### Pitfall: Demo Mode Not Activating
**Solution:**
- Remove all Supabase env vars to trigger auto-fallback
- Or set `VITE_DEMO_MODE=true` explicitly
- Check console for warnings

---

## Resources & References

**Official Documentation:**
- ShadCN UI: https://ui.shadcn.com/
- ShadCN Blocks: https://ui.shadcn.com/blocks
- Supabase Docs: https://supabase.com/docs
- Supabase Auth: https://supabase.com/docs/guides/auth
- Supabase RLS: https://supabase.com/docs/guides/database/postgres/row-level-security
- Vite: https://vitejs.dev/
- Vitest: https://vitest.dev/
- Playwright: https://playwright.dev/
- React Hook Form: https://react-hook-form.com/
- Zod: https://zod.dev/

**Community Resources:**
- shadcn-admin: https://github.com/satnaing/shadcn-admin (reference for patterns)
- Supabase Examples: https://github.com/supabase/supabase/tree/master/examples

---

## AI Assistant Guidelines

### When Working on This Project

1. **Check this document first** for the overall plan
2. **Leverage ShadCN blocks** - don't rebuild what exists
3. **Use Supabase built-in features** - don't reinvent auth/RLS
4. **Follow feature-based organization** - keep related code together
5. **Update documentation as you code** - Living Documentation principle
6. **Write tests for new features** - TDD-ready approach (optional but encouraged)
7. **Check existing patterns** - consistency matters
8. **Use TypeScript strictly** - no `any` types
9. **Update task status** - Move tasks from draft → active → complete
10. **Commit with conventional commits** - Clear commit messages
11. **Apply graceful degradation** - Never crash on missing config

### When Adding Features

- Check if ShadCN has a block for it
- Check if Supabase provides it built-in
- Look for similar patterns in existing features
- Update documentation in `/docs/`
- Add tests (optional but encouraged)
- Consider demo mode compatibility

### When Fixing Bugs

- Check if it's a configuration issue first
- Look at error logs (Pino logger, browser console)
- Check RLS policies if database-related
- Check TypeScript types if type-related
- Add regression test

### When Refactoring

- Ensure tests pass before and after
- Update documentation if APIs change
- Follow existing patterns
- Don't break DRY principle

### When Adding External Dependencies

**Apply Graceful Degradation Pattern:**
1. Create mock version for testing/demos
2. Auto-detect missing credentials
3. Fallback to mock gracefully
4. Show clear warning when in fallback mode
5. Document both real and mock setups

**Examples:**
- Payment (mock Stripe)
- Email (mock SendGrid/Resend)
- Storage (mock S3/Supabase Storage)
- Analytics (mock Mixpanel/PostHog)

---

## Project Philosophy

### Boilerplate, Not Framework
This is a **starting point**, not a rigid framework. Customize freely!

### MVP Focus
**Build fast, iterate faster.** This template provides production-ready foundation with graceful degradation, not every feature under the sun.

### DRY Everything
**Never reinvent the wheel.** If a battle-tested solution exists (ShadCN, Supabase, etc.), use it.

### TDD-Ready, Not TDD-Enforced
**Enable good practices, don't mandate them.** Testing infrastructure is ready, but users decide their testing strategy.

### Graceful Degradation First
**Never crash on missing config.** Provide fallbacks, show warnings, enable exploration without barriers.

### Zero-Config by Default
**Works out of the box.** Demo mode allows instant exploration, production setup when ready.

### Documentation as Code
**Documentation lives with code, updates with code.** No separate wiki or Notion docs - everything in `/docs/`.

### AI-Friendly
**Structured for AI assistant collaboration.** Clear patterns, good documentation, consistent conventions.

---

## Architectural Decisions

### Why Mock Client Instead of Supabase Anonymous Auth?
**Decision:** Custom Mock Supabase Client

**Reasoning:**
- **Zero Dependencies** - Works without any Supabase project
- **True Zero-Config** - No API keys needed at all
- **Faster** - No network calls, instant responses
- **Offline** - Works without internet connection
- **Predictable** - Same demo data every time
- **Simple** - No Supabase setup for demos/testing

**Tradeoff:** Must maintain mock to match Supabase API changes

**Mitigation:** Use TypeScript to ensure mock matches Supabase types

### Why Auto-Fallback Instead of Required Flag?
**Decision:** Auto-Fallback with Banner

**Reasoning:**
- **Better DX** - Works out of the box, zero config
- **Fail-Safe** - Never crashes, always works
- **Clear Communication** - Banner explains what's happening
- **Flexibility** - Can still use explicit flag if desired

**Tradeoff:** Might confuse users who forgot to set env vars

**Mitigation:** Yellow warning banner + console warnings

### Why Feature-Based Organization?
**Decision:** `/src/features/[name]/` not `/src/components/[type]/`

**Reasoning:**
- **Better scalability** - Clear boundaries
- **Clear ownership** - Each feature is self-contained
- **Easier to locate** - Related code together
- **Supports micro-frontends** - Can extract features later

### Why Database-Level Security (RLS)?
**Decision:** Enforce via RLS, not API layer

**Reasoning:**
- **Security even if client bypassed** - No way to circumvent
- **Single source of truth** - One place to manage permissions
- **No API layer needed** - Direct client-to-database with security
- **Automatic enforcement** - Supabase client respects RLS automatically

### Why Blank Dashboard?
**Decision:** Minimal dashboard with examples, not pre-filled

**Reasoning:**
- **Boilerplate should be flexible** - Don't assume business logic
- **Business logic varies** - Every app needs different features
- **Provide structure + examples** - Show the way, let users customize
- **Avoid assumptions** - Don't build features users might not need

---

## Notes

- This is a **boilerplate/starter template** - customize for your use case
- **No custom reinvention** - we leverage existing, well-maintained solutions
- **AI-friendly** - structured for easy AI agent navigation and maintenance
- **Production-ready foundation** - but add your own features on top
- **Scalable** - organized by feature, easy to extend
- **Zero-config** - works immediately, add real services when ready
- **Graceful degradation** - never crashes, always provides fallback
- **TDD-ready** - infrastructure complete, comprehensive tests optional

---

**Last Updated:** 2025-11-03
**Status:** Ready to Run
**Version:** 2.0 (Incorporates demo mode, graceful degradation, and session learnings)

---

## How to Use This Document

### For AI Assistants:
1. Read this entire document before starting implementation
2. Follow the phases in order
3. Don't skip the mock client implementation (Phase 3)
4. Don't skip the demo login button (Phase 4)
5. Don't skip the demo mode banner (Phase 11)
6. Apply graceful degradation pattern throughout
7. Create all files and directories as specified
8. Use the exact tech stack and versions mentioned
9. Follow the code patterns and conventions
10. Update documentation as you build

### For Human Developers:
1. This document is a comprehensive guide to building the entire app
2. Each phase can be implemented independently
3. MVP can be completed in 2-3 hours
4. Demo mode enables instant exploration
5. Production setup is optional - add when ready
6. Customize freely - this is a starting point
7. Add features based on your needs
8. Follow DRY principles
9. Leverage existing solutions
10. Document as you go

---

**Ready to Build? Start with Phase 1!**
