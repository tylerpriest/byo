# Implementation Plan: Modern SaaS Boilerplate

**Project Type:** Web App Boilerplate with SaaS capabilities (MVP focus)
**Tech Stack:** Vite, React 18, TypeScript, Vitest 4.0, Playwright, Vercel, Supabase, TailwindCSS, ShadCN UI
**Principles:** DRY, TDD, Documentation as Code, Progressive Disclosure, Living Documentation, Graceful Degradation
**Estimated Time:** 1.5-2 hours (MVP) | **Status:** ✅ MVP Complete

---

## Core Principles

### DRY (Don't Repeat Yourself)
- **Leverage existing solutions:** Use ShadCN official blocks instead of building custom components
- **Use Supabase Auth:** Built-in authentication methods (email/password, magic links, OAuth)
- **Use ShadCN patterns:** react-hook-form + Zod for forms (official recommendation)
- **Use TanStack Table:** For data tables (official ShadCN integration)
- **Reference, don't rebuild:** Study shadcn-admin for patterns, but use official blocks
- **Database-level security:** Supabase RLS for authorization

### TDD (Test-Driven Development)
- Vitest 4.0 for unit testing
- Testing Library for React component testing
- Playwright for E2E testing
- Test scripts in CI/CD pipeline

### Documentation as Code
- All documentation in version control
- Markdown format for accessibility
- Progressive disclosure (simple → detailed)
- Living documentation updated with code
- No documentation in root unless required

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
  /features/
    /auth/          # Authentication feature
    /dashboard/     # Dashboard feature
    /account/       # Account management
    /settings/      # User settings
    /landing/       # Landing page
  /components/
    /ui/            # ShadCN components
  /lib/             # Utilities
  /hooks/           # Custom React hooks
  /types/           # TypeScript types
/docs/              # All documentation
  /specs/           # Technical specifications
  /tasks/           # Task management
    /active/        # Current tasks
    /complete/      # Completed tasks
    /template/      # Task templates
    /draft/         # Future/planned tasks
/.github/
  /workflows/       # CI/CD workflows
/tests/             # E2E tests
/public/            # Static assets
```

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
   npx shadcn add form dialog toast breadcrumb button card input dropdown-menu avatar badge separator sheet
   ```
10. **Configure ShadCN MCP server** for component management

**Why These Blocks:**
- `dashboard-01`: Full dashboard with sidebar, charts, data table
- `sidebar-07`: Sidebar that collapses to icons (mobile-friendly)
- `login-03`: Clean login page with muted background

---

### Phase 3: Supabase Integration (15 min)

**Tasks:**
11. Install Supabase packages
    ```bash
    npm install @supabase/supabase-js @supabase/ssr
    ```
12. Initialize Supabase CLI
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

14. Configure RLS policies using Supabase helper functions
15. Generate TypeScript types
    ```bash
    npx supabase gen types typescript --local > src/types/database.types.ts
    ```
16. Create Supabase client utility in `/src/lib/supabase.ts`

---

### Phase 4: Authentication - Supabase + ShadCN Form ✅ COMPLETE

**Status:** ✅ Implemented (Email/Password Only)

**Tasks:**
17. ✅ **IMPLEMENTED:** Supabase's built-in auth methods:
    - ✅ Email/password authentication
    - ✅ Password reset (via Supabase built-in)
    - ❌ Magic links (NOT implemented)
    - ❌ OAuth providers (NOT implemented)

18. ✅ **INSTALLED:** Form dependencies
    ```bash
    npm install react-hook-form @hookform/resolvers zod
    ```

19. ✅ **IMPLEMENTED:** Auth context using Supabase's `onAuthStateChange`
    - File: `/src/features/auth/context/auth-context.tsx` (133 lines)
    - Hooks: `useAuth()`, `useUser()`, `useSession()`
    - Session persistence
    - Auto token refresh

20. ✅ **IMPLEMENTED:** Auth pages from `login-03` block:
    - ✅ Login page (with demo login button)
    - ✅ Signup page
    - ❌ Password reset page (uses Supabase built-in email flow, no custom page)
    - All use ShadCN Form + react-hook-form + Zod

21. ✅ **IMPLEMENTED:** Protected routes with React Router
    - Route guards checking session
    - Redirect to login if not authenticated
    - ProtectedRoute component

---

### Phase 5: RBAC - Supabase RLS ✅ COMPLETE

**Status:** ✅ Implemented (Basic RBAC, No Management UI)

**Tasks:**
22. ✅ **IMPLEMENTED:** Permission utilities using Supabase JWT claims
    - File: `/src/lib/rbac.ts` (156 lines)
    - Functions: `hasPermission()`, `hasRole()`, `hasAnyRole()`, `hasAllPermissions()`, etc.
    - Custom hooks in `/src/hooks/use-rbac.ts` (6 hooks)
    - In-memory caching for performance

23. ⚠️ **PARTIAL:** Route guards with React Router
    - ✅ Authentication-based route guards (ProtectedRoute)
    - ❌ Permission-based route guards (NOT implemented)
    - ❌ 403 page for unauthorized access (NOT implemented)

24. ✅ **IMPLEMENTED:** `hasPermission()` helper for conditional UI rendering
    - Used in dashboard for Admin/Moderator sections
    - Example: `{roles.includes('Admin') && <AdminSection />}`
    - Works with custom hooks from use-rbac.ts

25. ✅ **IMPLEMENTED:** Authorization enforced via Supabase RLS
    - Database-level security with 19 RLS policies
    - No client-side security bypass
    - JWT claims available in RLS policies
    - Users can only view/edit their own profile
    - Admins can view all profiles and assign roles

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

---

### Phase 6: Assemble Pages from ShadCN Blocks ✅ COMPLETE

**Status:** ✅ Implemented (Core Pages, Settings are Placeholders)

**Tasks:**
26. ✅ **IMPLEMENTED:** Landing Page
    - File: `/src/features/landing/landing-page.tsx`
    - Hero section with gradient background
    - CTAs linking to signup/login
    - Feature highlights grid
    - Footer with links

27. ✅ **IMPLEMENTED:** Dashboard
    - File: `/src/features/dashboard/dashboard-page.tsx`
    - Welcome card with user's display name
    - Shows user's roles and permission count
    - Role-based sections:
      - Admin section (shows for Admin role)
      - Moderator section (shows for Admin/Moderator roles)
      - User section (shows for all authenticated users)
    - Placeholder cards with instructions
    - Ready for customization

28. ⚠️ **PARTIAL:** Account/Settings Pages
    - ✅ Account page with display name editing (`/src/features/account/account-page.tsx`)
    - ✅ Email display (read-only)
    - ⚠️ Settings page exists but is **placeholder only** (`/src/features/settings/settings-page.tsx`)
      - ❌ Profile picture upload (NOT implemented)
      - ❌ Email change (NOT implemented)
      - ❌ Password change UI (NOT implemented)
      - ❌ Notification preferences (placeholder button only)
      - ❌ Connected accounts (NOT implemented, no OAuth)

29. ✅ **IMPLEMENTED:** Layout
    - File: `/src/components/dashboard-layout.tsx` (155 lines)
    - Collapsible sidebar (mobile: <1024px)
    - Navigation: Dashboard, Account, Settings
    - User dropdown menu with:
      - Account Settings link
      - Preferences link
      - Sign Out button
    - Mobile-responsive with backdrop
    - Shows user email and first role

---

### Phase 7: Testing - Vitest 4.0 + Playwright ✅ COMPLETE

**Status:** ✅ Infrastructure Complete, ⚠️ Minimal Test Coverage

**Tasks:**
30. ✅ **CONFIGURED:** Vitest
    ```bash
    npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
    ```
    - ✅ `vitest.config.ts` created
    - ✅ Test utils in `/src/lib/test-utils.tsx` (20 lines)
    - ✅ jsdom environment configured

31. ✅ **CONFIGURED:** Playwright
    ```bash
    npm init playwright@latest
    ```
    - ✅ `playwright.config.ts` created
    - ✅ Configured for React app (localhost:5173)
    - ✅ Chromium, Firefox, WebKit browsers

32. ⚠️ **MINIMAL:** Sample tests (examples only, low coverage)
    - ✅ Example unit test: `/src/components/__tests__/button.test.tsx`
    - ✅ Example RBAC test: `/src/lib/__tests__/rbac.test.ts`
    - ✅ Example E2E test: `/tests/example.spec.ts`
    - ❌ Comprehensive auth flow tests (NOT implemented)
    - ❌ Form validation tests (NOT implemented)
    - ❌ Component tests for pages (NOT implemented)

33. ✅ **ADDED:** Test scripts to `package.json`
    ```json
    {
      "scripts": {
        "test": "vitest",
        "test:ui": "vitest --ui",
        "test:e2e": "playwright test",
        "test:e2e:ui": "playwright test --ui"
      }
    }
    ```

**Test Coverage:** ~5% (infrastructure ready, examples provided, but comprehensive suite not implemented)

---

### Phase 8: CI/CD with GitHub Actions (10 min)

**Tasks:**
34. Create `.github/workflows/ci.yml`
    - Run on PR and push to main
    - Jobs: lint, typecheck, test (unit + E2E)
    - Fail PR if tests fail

35. Create `.github/workflows/deploy.yml`
    - Deploy to Vercel on push to main
    - Preview deployments for PRs
    - Environment variables from Vercel

36. Create `.github/workflows/types.yml`
    - Auto-generate Supabase types on schema changes
    - Create PR with updated types
    - Run weekly or on database changes

37. Configure Vercel project
    - Link GitHub repository
    - Set environment variables:
      - `VITE_SUPABASE_URL`
      - `VITE_SUPABASE_ANON_KEY`
    - Enable automatic deployments

---

### Phase 9: Documentation as Code (15 min)

**Tasks:**
38. Create `/docs/` documentation:
    - `architecture.md` - System architecture, design decisions
    - `setup.md` - Development environment setup
    - `auth.md` - Authentication flow, Supabase integration
    - `rbac.md` - RBAC system, roles, permissions
    - `deployment.md` - Vercel deployment, environment setup
    - `testing.md` - Testing strategy, running tests

39. Create `/docs/specs/` specifications:
    - `database-schema.md` - Complete database schema with diagrams
    - `api-spec.md` - API endpoints (if custom APIs added)
    - `rbac-spec.md` - Detailed RBAC permissions matrix

40. Create `/docs/tasks/` structure:
    - `/active/` - Tasks currently in progress
    - `/complete/` - Finished tasks (archived)
    - `/template/` - Task templates for common work
    - `/draft/` - Future/planned tasks

41. Create task templates in `/docs/tasks/template/`:
    - `feature-template.md`
    - `bug-template.md`
    - `refactor-template.md`

42. Add `/docs/claude.md` for AI context
    - Project overview
    - Key architectural decisions
    - Where to find things
    - Common tasks and patterns
    - Tech stack details

43. **Progressive Disclosure**
    - Simple `README.md` with quick start
    - Links to detailed documentation in `/docs/`
    - External docs link to online resources

---

### Phase 10: DX & Error Handling ✅ COMPLETE

**Status:** ✅ Implemented (Basic Infrastructure)

**Tasks:**
44. ✅ **CONFIGURED:** Pino logger
    ```bash
    npm install pino pino-pretty
    ```
    - ✅ Logger utility in `/src/lib/logger.ts` (10 lines)
    - ✅ Browser-compatible configuration
    - ✅ Log levels: debug, info, warn, error
    - ✅ Used in auth context and RBAC utilities

45. ✅ **IMPLEMENTED:** ShadCN Toast for user notifications
    - ✅ Toast component: `/src/components/ui/toast.tsx`
    - ✅ Toaster component: `/src/components/ui/toaster.tsx`
    - ✅ useToast hook: `/src/components/ui/use-toast.ts`
    - ✅ Success messages (account updates)
    - ✅ Error messages (auth failures)
    - ✅ Consistent UX across app

46. ✅ **IMPLEMENTED:** React Error Boundaries
    - ✅ File: `/src/components/error-boundary.tsx` (60+ lines)
    - ✅ Catches React errors gracefully
    - ✅ Displays user-friendly error UI
    - ✅ Logs errors for debugging
    - ✅ Reset button to retry

47. ⚠️ **PARTIAL:** Optimistic UI helpers
    - ✅ Utility file exists: `/src/lib/optimistic-ui.ts` (70 lines)
    - ✅ Basic structure for optimistic updates
    - ❌ NOT fully integrated into UI components
    - ❌ Supabase realtime NOT used in current implementation

48. ✅ **CONFIGURED:** ESLint + Prettier
    ```bash
    npm install -D eslint-config-prettier prettier
    ```
    - ✅ ESLint rules for React, TypeScript (`.eslintrc.cjs`)
    - ✅ Prettier for code formatting (`.prettierrc`)
    - ✅ Prettier ignore file (`.prettierignore`)
    - ❌ Pre-commit hooks with Husky (NOT implemented)

### Phase 11: Deployment & Graceful Degradation (COMPLETED)

**Status:** ✅ Complete (Session: 2025-11-02)

**Tasks:**
49. Create demo mode system
    - Mock Supabase client (`/src/lib/supabase-mock.ts`)
    - Complete auth and database operations
    - Demo user and role data
    - Zero network calls, instant responses

50. Implement graceful degradation
    - Auto-detect missing Supabase credentials
    - Fallback to demo mode instead of crashing
    - Remove hard error that breaks entire app
    - Add `isAutoFallbackMode` export flag

51. Add DemoModeBanner component
    - Yellow warning banner at top of page
    - Shows only in auto-fallback mode
    - Dismissible with X button
    - Dark mode support

52. Create deployment documentation
    - `DEPLOYMENT.md` - Vercel & Supabase setup (532 lines)
    - `VERCEL.md` - Troubleshooting guide (201 lines)
    - `GITHUB_CLI_SETUP.md` - GitHub CLI setup (176 lines)

53. Update README
    - Change status to "MVP Complete"
    - Add demo mode to features
    - Two quick start options (demo vs full)
    - Update roadmap with completed tasks

54. Environment variable configuration
    - Add `VITE_DEMO_MODE` type to `vite-env.d.ts`
    - Create `.env.demo` template
    - Update `.env.example` with demo mode docs

**Key Achievement:**
- **Before:** Missing Supabase credentials → Hard error → White screen
- **After:** Missing Supabase credentials → Auto demo mode → Fully functional app

**Design Pattern:** Graceful Degradation / Fault Tolerance
- System continues operating with reduced functionality when services fail
- Fail-safe approach instead of fail-hard
- Clear communication via banner when in fallback mode

**Files Created:**
- `/src/lib/supabase-mock.ts` - Mock Supabase client (278 lines)
- `/src/components/demo-mode-banner.tsx` - Warning banner (57 lines)
- `/DEPLOYMENT.md` - Deployment guide (532 lines)
- `/VERCEL.md` - Vercel troubleshooting (201 lines)
- `/GITHUB_CLI_SETUP.md` - GitHub CLI setup (176 lines)
- `/.env.demo` - Demo configuration template
- `/docs/session-summary-deployment-and-demo-mode.md` - Complete session summary

**Benefits:**
- ✅ Zero-config quick start
- ✅ Works immediately after clone
- ✅ No white screen on Vercel
- ✅ Can explore app before Supabase setup
- ✅ Demo login: demo@example.com / any password

**See Also:**
- [Session Summary](/docs/session-summary-deployment-and-demo-mode.md) - Complete details
- [DEPLOYMENT.md](/DEPLOYMENT.md) - Full deployment guide
- [VERCEL.md](/VERCEL.md) - Vercel troubleshooting

---

## Key Features Implemented

✅ **Email/password authentication** with Supabase (signIn, signUp, signOut, password reset)
✅ **4-tier RBAC** (Admin, Moderator, User, Guest roles with 10 permissions)
✅ **Demo mode system** with complete mock Supabase client (278 lines)
✅ **Graceful degradation** - auto-fallback when Supabase credentials missing
✅ **Demo login button** - one-click demo access
✅ **TDD-ready testing infrastructure** (Vitest + Playwright configured, example tests provided)
✅ **Feature-based organization** in `/src` (auth, dashboard, account, settings, landing)
✅ **ShadCN UI components** (10+ components: Button, Card, Input, Form, Toast, etc.)
✅ **Custom RBAC hooks** - 6 hooks for role/permission checking
✅ **Pino logging** with error boundaries
✅ **Zod schema validation** on all forms
✅ **Fully typed with TypeScript** (strict mode)
✅ **Vercel deployment ready** with comprehensive deployment guides
✅ **Zero-config quick start** - works without any setup (auto-fallback to demo mode)
✅ **Mobile-responsive layout** with collapsible sidebar
✅ **Documentation as Code** in `/docs` (9 docs, 2 session summaries)
✅ **CI/CD automation** with GitHub Actions (3 workflows: CI, deploy, types)
✅ **Database schema** with RLS policies (5 tables, 19 RLS policies)

## What's NOT Implemented (Claimed Features)

The following features are mentioned in documentation but **NOT actually implemented**:

### Authentication (Partial)
- ❌ **OAuth Providers** (Google, GitHub, etc.) - Claimed in README, not implemented
- ❌ **Magic Links** - Claimed in README, not implemented
- ❌ **Email Verification** - No account confirmation emails
- ❌ **Two-Factor Authentication** - Not implemented

### Pages & UI (Partial)
- ❌ **Admin Dashboard** - Only placeholder section in dashboard, no routes or management UI
- ❌ **Password Change UI** - No page/form for password changes
- ❌ **Email Change** - No UI for changing email
- ❌ **Profile Picture Upload** - No avatar upload functionality
- ❌ **403 Unauthorized Page** - No dedicated error page

### Email & Notifications
- ❌ **Email Notifications** - Only placeholder button in settings, no actual email service
- ❌ **Transactional Emails** - No SendGrid/Mailgun/Resend integration
- ❌ **Notification Preferences** - UI placeholder only, no backend

### Advanced Features
- ❌ **Payment Processing** - No Stripe integration (zero code)
- ❌ **Subscription Management** - Not implemented
- ❌ **Role/Permission Management UI** - RBAC works, but admins can't assign roles via UI
- ❌ **Anonymous/Guest Auth** - Not implemented
- ❌ **User Management** - No listing, editing, or deletion of users
- ❌ **Analytics Dashboard** - Not implemented

### Testing (Infrastructure Only)
- ❌ **Comprehensive Test Suite** - Only 3 example tests exist (~5% coverage)
- ❌ **Auth Flow Tests** - Not implemented
- ❌ **Form Validation Tests** - Not implemented
- ❌ **Component Tests** - Minimal coverage

### Developer Experience
- ❌ **Pre-commit Hooks** - Husky not configured
- ❌ **Optimistic UI Integration** - Utilities exist but not integrated
- ❌ **Supabase Realtime** - Not used in current implementation

**Note:** The above features are either listed as "Next Phase" in the roadmap or claimed in feature descriptions but consist of placeholder UI only.

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

---

## Dashboard Design (MVP)

**Blank Canvas Approach:**
- Clean, minimal layout from `dashboard-01` block
- Welcome section with user's name and role
- Empty grid/card layout ready for customization
- **Example code** (commented out) showing:
  - How to add role-based sections
  - Permission-based conditional rendering
  - Example cards/widgets structure
- Placeholder components that can be uncommented
- Ready to plug in business logic

**Example Structure:**
```tsx
<DashboardLayout>
  <Header user={user} />
  <Sidebar />
  <Main>
    <WelcomeCard user={user} />

    {/* Example: Admin-only section */}
    {hasRole('Admin') && (
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Add admin content here */}
        </CardContent>
      </Card>
    )}

    {/* Placeholder cards - customize as needed */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <PlaceholderCard title="Stats" />
      <PlaceholderCard title="Activity" />
      <PlaceholderCard title="Quick Actions" />
    </div>
  </Main>
</DashboardLayout>
```

---

## Development Workflow

1. **Create feature branch** from `main`
2. **Move task** from `/docs/tasks/draft/` to `/docs/tasks/active/`
3. **Write tests first** (TDD approach)
4. **Implement feature** using ShadCN blocks and Supabase
5. **Update documentation** as you code (Living Documentation)
6. **Run tests** locally before committing
7. **Commit with conventional commits** (feat:, fix:, docs:, etc.)
8. **Push and create PR** - CI runs automatically
9. **Review and merge** - Deploys to Vercel
10. **Move task** to `/docs/tasks/complete/`

---

## Next Steps After Setup

**Immediate:**
1. Set up Supabase project in cloud
2. Configure environment variables
3. Deploy to Vercel
4. Test auth flow end-to-end

**Short-term:**
1. Customize landing page with actual content
2. Add business-specific features to dashboard
3. Extend RBAC with custom permissions
4. Add more pages (pricing, about, etc.)

**Long-term:**
1. Add payment integration (Stripe, etc.)
2. Implement email notifications
3. Add analytics/monitoring
4. Build admin panel features
5. Add multi-tenancy (if SaaS)

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

**Community Resources:**
- shadcn-admin: https://github.com/satnaing/shadcn-admin (reference for patterns)
- Supabase Examples: https://github.com/supabase/supabase/tree/master/examples

---

## Notes

- This is a **boilerplate/starter template** - customize for your use case
- **No custom reinvention** - we leverage existing, well-maintained solutions
- **AI-friendly** - structured for easy AI agent navigation and maintenance
- **Production-ready foundation** - but add your own features on top
- **Scalable** - organized by feature, easy to extend

---

**Last Updated:** 2025-11-02
**Status:** Ready for implementation
