# Claude AI Context - BYO (Build Your Own) SaaS Boilerplate

This file provides context for AI assistants (like Claude Code) working on this project.

---

## Project Overview

**Name:** BYO (Build Your Own)
**Type:** Modern SaaS Boilerplate / Web App Starter Template
**Purpose:** MVP-focused starter template with production-ready foundation for SaaS applications
**Status:** In Development
**Created:** 2025-11-02

---

## Tech Stack

### Core Framework
- **Vite** - Build tool and dev server
- **React 19** - UI library
- **TypeScript** - Type safety
- **React Router** - Client-side routing

### Styling & UI
- **TailwindCSS** - Utility-first CSS
- **ShadCN UI** - Component library (Radix UI + Tailwind)
- **ShadCN Blocks** - Pre-built component compositions
  - `dashboard-01` - Dashboard layout
  - `sidebar-07` - Collapsible sidebar
  - `login-03` - Authentication UI

### Backend & Database
- **Supabase** - Backend as a Service
  - PostgreSQL database
  - Built-in authentication
  - Row Level Security (RLS)
  - Realtime subscriptions
  - Storage
- **Supabase CLI** - Local development and migrations

### Authentication & Authorization
- **Supabase Auth** - Email/password, magic links, OAuth
- **Custom RBAC** - Role-Based Access Control
  - 4 roles: Admin, Moderator/Editor, User, Guest/Viewer
  - Permission-based UI rendering
  - Database-level enforcement via RLS

### Form Management & Validation
- **react-hook-form** - Form state management
- **Zod** - Schema validation
- ShadCN Form component integration

### Testing
- **Vitest 4.0** - Unit testing framework
- **@testing-library/react** - React component testing
- **Playwright** - E2E testing
- **jsdom** - DOM implementation for Node

### Logging & Error Handling
- **Pino** - Fast JSON logger (browser-compatible)
- React Error Boundaries
- ShadCN Toast for user notifications
- Optimistic UI patterns with graceful fallbacks

### Deployment & CI/CD
- **Vercel** - Hosting and deployment
- **GitHub Actions** - CI/CD pipelines
  - Lint, typecheck, test on PRs
  - Auto-deploy to Vercel
  - Supabase type generation

### Code Quality
- **ESLint** - Linting
- **Prettier** - Code formatting
- **TypeScript strict mode** - Maximum type safety

### Developer Tools
- **ShadCN MCP Server** - Component management via Model Context Protocol

---

## Project Structure

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
  /lib/               # Shared utilities
    supabase.ts       # Supabase client
    rbac.ts           # Permission utilities
    logger.ts         # Pino logger
    utils.ts          # General utilities (cn, etc.)
  /hooks/             # Custom React hooks
  /types/             # TypeScript types
    database.types.ts # Generated Supabase types
  main.tsx            # App entry point
  App.tsx             # Root component
  index.css           # Global styles

/docs/                # All documentation (Documentation as Code)
  /specs/             # Technical specifications
  /tasks/             # Task management (active, complete, template, draft)
  implementation-plan.md  # Full implementation plan
  claude.md           # This file - AI context
  architecture.md     # System architecture
  setup.md            # Dev environment setup
  auth.md             # Auth flow details
  rbac.md             # RBAC system details
  deployment.md       # Deployment guide
  testing.md          # Testing strategy

/.github/
  /workflows/         # CI/CD pipelines
    ci.yml            # Lint, typecheck, test
    deploy.yml        # Vercel deployment
    types.yml         # Supabase type generation

/tests/               # E2E tests
/public/              # Static assets
```

---

## Key Architectural Decisions

### 1. Feature-Based Organization
**Decision:** Organize code by feature, not by file type
**Rationale:**
- Better scalability
- Clear ownership
- Easier to locate related code
- Supports micro-frontend patterns

### 2. DRY Principle - Leverage Existing Solutions
**Decision:** Use ShadCN blocks, Supabase Auth, and established patterns
**Rationale:**
- Faster development
- Battle-tested solutions
- Less maintenance
- Focus on business logic, not infrastructure

### 3. Database-Level Security with RLS
**Decision:** Enforce authorization at database level via Supabase RLS
**Rationale:**
- Security even if client-side code bypassed
- Single source of truth
- No API layer needed for basic CRUD
- Automatic enforcement with Supabase client

### 4. Documentation as Code
**Decision:** All documentation in `/docs/`, version controlled, markdown
**Rationale:**
- Living documentation updated with code
- AI-friendly format
- Easy to search and maintain
- Progressive disclosure (README → detailed docs)

### 5. Blank Dashboard (MVP Approach)
**Decision:** Minimal dashboard with examples, not pre-filled with features
**Rationale:**
- Boilerplate should be flexible
- Business logic varies by use case
- Provide structure + examples, let users customize
- Avoid assumptions about user needs

### 6. TDD-Ready, Not TDD-Enforced
**Decision:** Set up testing infrastructure, write example tests, don't require 100% coverage
**Rationale:**
- Boilerplate should enable TDD, not mandate it
- Users decide their testing strategy
- Example tests show the way
- CI ensures tests run, but doesn't block on coverage

---

## Common Tasks

### Adding a New Feature
1. Create feature directory in `/src/features/[feature-name]/`
2. Add components, hooks, types within feature directory
3. Update navigation in sidebar if needed
4. Add route in `App.tsx`
5. Write tests in `/tests/[feature-name].spec.ts`
6. Update documentation in `/docs/`

### Adding a ShadCN Component
```bash
npx shadcn add [component-name]
```
Or use ShadCN MCP server for AI-assisted component management

### Adding a Database Table
1. Create migration: `npx supabase migration new [table-name]`
2. Write SQL in migration file
3. Add RLS policies
4. Apply migration: `npx supabase db push`
5. Regenerate types: `npx supabase gen types typescript --local > src/types/database.types.ts`
6. Document schema in `/docs/specs/database-schema.md`

### Adding a New Role/Permission
1. Insert into `roles` or `permissions` table via migration
2. Update RLS policies if needed
3. Update RBAC utilities in `/src/lib/rbac.ts`
4. Update documentation in `/docs/rbac.md`
5. Add to spec in `/docs/specs/rbac-spec.md`

### Running Tests
```bash
npm test              # Unit tests (Vitest)
npm run test:ui       # Vitest UI
npm run test:e2e      # E2E tests (Playwright)
npm run test:e2e:ui   # Playwright UI
```

### Deploying
- **Automatic:** Push to `main` → GitHub Actions → Vercel
- **Manual:** `vercel deploy` or via Vercel dashboard

---

## Important Files & Their Purpose

| File | Purpose |
|------|---------|
| `/docs/implementation-plan.md` | Complete implementation roadmap (10 phases) |
| `/docs/claude.md` | This file - AI assistant context |
| `/src/lib/supabase.ts` | Supabase client initialization |
| `/src/lib/rbac.ts` | Permission checking utilities |
| `/src/features/auth/context/auth-context.tsx` | Auth state management |
| `/src/types/database.types.ts` | Generated Supabase types (auto-updated) |
| `/.github/workflows/ci.yml` | CI pipeline (lint, test, typecheck) |
| `/docs/specs/database-schema.md` | Database schema documentation |
| `/docs/tasks/` | Task management (active, complete, template, draft) |

---

## Where to Find Things

### Authentication
- **Context:** `/src/features/auth/context/auth-context.tsx`
- **Components:** `/src/features/auth/components/`
- **Pages:** `/src/features/auth/pages/` (login, signup, reset)
- **Hooks:** `useAuth()`, `useUser()`, `useSession()`
- **Docs:** `/docs/auth.md`

### Authorization (RBAC)
- **Utilities:** `/src/lib/rbac.ts`
- **Functions:** `hasPermission()`, `hasRole()`, `canAccess()`
- **Database:** Tables: `roles`, `user_roles`, `permissions`, `role_permissions`
- **Docs:** `/docs/rbac.md`, `/docs/specs/rbac-spec.md`

### Database
- **Client:** `/src/lib/supabase.ts`
- **Types:** `/src/types/database.types.ts` (generated)
- **Migrations:** `/supabase/migrations/`
- **Docs:** `/docs/specs/database-schema.md`

### UI Components
- **ShadCN Components:** `/src/components/ui/`
- **Custom Components:** Within feature directories
- **Layout:** `/src/components/layout/` (Header, Sidebar, Footer)
- **Usage:** Import from `@/components/ui/[component]`

### Testing
- **Unit Tests:** Co-located with components (`.test.tsx`)
- **E2E Tests:** `/tests/`
- **Test Utils:** `/src/lib/test-utils.tsx`
- **Config:** `vitest.config.ts`, `playwright.config.ts`
- **Docs:** `/docs/testing.md`

### Documentation
- **Implementation Plan:** `/docs/implementation-plan.md`
- **Architecture:** `/docs/architecture.md`
- **Setup Guide:** `/docs/setup.md`
- **Specifications:** `/docs/specs/`
- **Task Management:** `/docs/tasks/`

---

## Environment Variables

Located in `.env.local` (not committed):

```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Optional: For local development
VITE_SUPABASE_LOCAL_URL=http://localhost:54321
```

Template in `.env.example` (committed)

---

## Development Workflow

1. **Start Supabase locally:** `npx supabase start`
2. **Start dev server:** `npm run dev`
3. **Run tests in watch mode:** `npm test`
4. **Make changes, tests pass**
5. **Commit:** Use conventional commits (feat:, fix:, docs:, refactor:, test:)
6. **Push:** CI runs automatically
7. **PR:** Review and merge
8. **Deploy:** Automatic to Vercel on merge to `main`

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

### Pitfall: Tests Failing After Supabase Change
**Solution:** Mock Supabase in tests, don't use real database

---

## AI Assistant Guidelines

### When Working on This Project

1. **Check `/docs/implementation-plan.md` first** for the overall plan
2. **Leverage ShadCN blocks** - don't rebuild what exists
3. **Use Supabase built-in features** - don't reinvent auth/RLS
4. **Follow feature-based organization** - keep related code together
5. **Update documentation as you code** - Living Documentation principle
6. **Write tests for new features** - TDD-ready approach
7. **Check existing patterns** - consistency matters
8. **Use TypeScript strictly** - no `any` types
9. **Update task status** - Move tasks from draft → active → complete
10. **Commit with conventional commits** - Clear commit messages

### When Adding Features

- Check if ShadCN has a block for it
- Check if Supabase provides it built-in
- Look for similar patterns in existing features
- Update documentation in `/docs/`
- Add tests

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

---

## Project Philosophy

### Boilerplate, Not Framework
This is a **starting point**, not a rigid framework. Customize freely!

### MVP Focus
**Build fast, iterate faster.** This template provides production-ready foundation, not every feature under the sun.

### DRY Everything
**Never reinvent the wheel.** If a battle-tested solution exists (ShadCN, Supabase, etc.), use it.

### TDD-Ready, Not TDD-Enforced
**Enable good practices, don't mandate them.** Testing infrastructure is ready, but users decide their testing strategy.

### Documentation as Code
**Documentation lives with code, updates with code.** No separate wiki or Notion docs - everything in `/docs/`.

### AI-Friendly
**Structured for AI assistant collaboration.** Clear patterns, good documentation, consistent conventions.

---

## Links & Resources

**Project Repository:** [GitHub URL - to be added]
**Deployment:** [Vercel URL - to be added]
**Supabase Project:** [Supabase Dashboard URL - to be added]

**Documentation:**
- ShadCN UI: https://ui.shadcn.com/
- Supabase Docs: https://supabase.com/docs
- Vite: https://vitejs.dev/
- Vitest: https://vitest.dev/
- Playwright: https://playwright.dev/

---

**Last Updated:** 2025-11-02
**Maintained By:** Tyler
**AI Context Version:** 1.0
