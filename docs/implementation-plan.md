# Implementation Plan: Modern SaaS Boilerplate

**Project Type:** Web App Boilerplate with SaaS capabilities (MVP focus)
**Tech Stack:** Vite, React 19, TypeScript, Vitest 4.0, Playwright, Vercel, Supabase, TailwindCSS, ShadCN UI
**Principles:** DRY, TDD, Documentation as Code, Progressive Disclosure, Living Documentation
**Estimated Time:** 1.5-2 hours

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

### Phase 4: Authentication - Supabase + ShadCN Form (10 min)

**Tasks:**
17. Use Supabase's built-in auth methods:
    - Email/password authentication
    - Magic links
    - OAuth providers (optional)

18. Install form dependencies
    ```bash
    npm install react-hook-form @hookform/resolvers zod
    ```

19. Create auth context using Supabase's `onAuthStateChange`
    - File: `/src/features/auth/context/auth-context.tsx`
    - Hooks: `useAuth()`, `useUser()`, `useSession()`

20. Build auth pages from `login-03` block:
    - Login page
    - Signup page
    - Password reset page
    - All use ShadCN Form + react-hook-form + Zod

21. Implement protected routes with React Router
    - Route guards checking session
    - Redirect to login if not authenticated

---

### Phase 5: RBAC - Supabase RLS (10 min)

**Tasks:**
22. Create permission utilities using Supabase JWT claims
    - File: `/src/lib/rbac.ts`
    - Functions: `hasPermission()`, `hasRole()`, `canAccess()`

23. Implement route guards with React Router loaders
    - Check permissions before rendering routes
    - Display 403 for unauthorized access

24. Add `hasPermission()` helper for conditional UI rendering
    ```tsx
    {hasPermission('users.write') && <EditButton />}
    ```

25. All authorization enforced via Supabase RLS
    - Database-level security
    - No client-side security bypass
    - JWT claims available in RLS policies

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

### Phase 6: Assemble Pages from ShadCN Blocks (15 min)

**Tasks:**
26. **Landing Page**
    - Compose from ShadCN hero/feature blocks
    - CTAs linking to signup
    - Feature highlights
    - Footer with links

27. **Dashboard**
    - Customize `dashboard-01` block
    - Blank canvas with permission-based sections
    - Welcome message with user's name/role
    - Example commented code for role-based content:
      ```tsx
      {/* Example: Show analytics for Admin/Moderator */}
      {hasPermission('analytics.view') && (
        <Card>
          <CardHeader>
            <CardTitle>Analytics</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Add your analytics here */}
          </CardContent>
        </Card>
      )}
      ```
    - Placeholder cards that can be customized

28. **Account/Settings Pages**
    - Use ShadCN form + card components
    - Profile editing (display_name, avatar)
    - Email/password management
    - Notification preferences
    - Connected accounts (if OAuth enabled)

29. **Layout**
    - Use `sidebar-07` for collapsible navigation
    - Header from dashboard block
    - Role-based navigation items:
      ```tsx
      {hasRole('Admin') && <SidebarItem href="/admin">Admin Panel</SidebarItem>}
      ```
    - Mobile-responsive with Sheet component

---

### Phase 7: Testing - Vitest 4.0 + Playwright (10 min)

**Tasks:**
30. Configure Vitest
    ```bash
    npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
    ```
    - Create `vitest.config.ts`
    - Add test utils in `/src/lib/test-utils.tsx`

31. Set up Playwright
    ```bash
    npm init playwright@latest
    ```
    - Configure for React app
    - Set base URL to localhost

32. Write sample auth flow tests
    - E2E: Login → Dashboard → Logout
    - Unit: Auth context, permission utilities
    - Component: Form validation

33. Add test scripts to `package.json`
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

### Phase 10: DX & Error Handling (10 min)

**Tasks:**
44. Configure Pino logger
    ```bash
    npm install pino pino-pretty
    ```
    - Create logger utility in `/src/lib/logger.ts`
    - Browser-compatible configuration
    - Log levels: debug, info, warn, error

45. Use ShadCN Toast for user notifications
    - Success messages
    - Error messages
    - Info/warning notifications
    - Consistent UX across app

46. Create React Error Boundaries
    - Catch React errors gracefully
    - Display user-friendly error UI
    - Log errors for debugging
    - File: `/src/components/error-boundary.tsx`

47. Add optimistic UI helpers
    - Update UI immediately on user action
    - Revert if server request fails
    - Use Supabase realtime for updates
    - File: `/src/lib/optimistic-ui.ts`

48. Configure ESLint + Prettier
    ```bash
    npm install -D eslint-config-prettier prettier
    ```
    - ESLint rules for React, TypeScript
    - Prettier for code formatting
    - Pre-commit hooks with Husky (optional)

---

## Key Features Implemented

✅ **Full authentication flow** with Supabase
✅ **4-tier RBAC** (Admin, Moderator/Editor, User, Guest/Viewer)
✅ **Optimistic UI patterns** with graceful fallbacks
✅ **TDD-ready testing setup** (Vitest + Playwright)
✅ **Feature-based organization** in `/src`
✅ **ShadCN MCP integration** for component management
✅ **Pino logging** with error boundaries
✅ **Zod schema validation** throughout
✅ **Fully typed with TypeScript**
✅ **Vercel deployment ready**
✅ **Mobile-responsive** with collapsible sidebar
✅ **Documentation as Code** in `/docs` (specs and tasks included)
✅ **CI/CD automation** with GitHub Actions

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
