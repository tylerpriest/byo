# BYO (Build Your Own) - SaaS Boilerplate Template v4

**Version:** 4.01
**Date:** 2025-11-13
**Purpose:** Production-ready multi-tenant SaaS starter template

---

## 1. Tech Stack

### Core Framework & Build
- **Vite 7.x** - Build tool and dev server
- **React 19** - UI library with latest features
- **TypeScript** - Strict type safety
- **npm** - Package management

### Styling & UI
- **TailwindCSS v4** - Utility-first CSS (Oxide engine, 10x faster)
- **ShadCN UI** - Component library (Radix UI + Tailwind)
- **ShadCN Blocks** - Pre-built component compositions (dashboard, sidebar, auth)

### Backend & Database
- **Supabase** - Backend as a Service (PostgreSQL, Auth, Storage, Realtime)
- **Supabase CLI** - Local development and migrations
- **Row Level Security (RLS)** - Database-level authorization

### Authentication & Authorization
- **Supabase Auth** - Email/password, magic links, OAuth
- **Custom RBAC** - Role-Based Access Control
  - **Platform Roles:** Admin, Developer, Support (system-wide)
  - **Organization Roles:** Owner, Admin, Member, Viewer (per-workspace)
  - Database-level enforcement via RLS
  - Permission-based UI rendering

### Multi-Tenancy Architecture
- **Pattern:** Row-level multi-tenancy + single-instance deployment
- **Database Schema:** Organizations, members, invitations
- **Isolation:** RLS policies enforce data separation
- **Scalability:** Single codebase, shared database, horizontal scaling

### Form Management & Validation
- **react-hook-form** - Form state management
- **Zod 4.x** - Schema validation and type inference

### Testing
- **Vitest 4.0** - Unit testing (browser mode, benchmarks, type testing)
- **@testing-library/react** - Component testing
- **Playwright** - E2E testing with AI agents
- **Coverage Targets:**
  - Critical paths (auth, RBAC, payments): >80%
  - Overall project: 30%

### Logging & Error Handling
- **Pino** - Fast JSON logger (browser-compatible)
- **React Error Boundaries** - Graceful error handling
- **ShadCN Toast** - User notifications
- **Optimistic UI** - Immediate feedback with graceful rollback

### Code Quality
- **ESLint v9** - Linting (flat config format)
- **Prettier** - Code formatting
- **Husky** - Pre-commit hooks (test enforcement, linting)
- **TypeScript strict mode** - Maximum type safety

### Deployment & CI/CD
- **Vercel** - Hosting and deployment
- **GitHub Actions** - CI/CD pipelines (lint, typecheck, test, deploy)
- **Supabase Project** - Production database

### MCP Ecosystem (Model Context Protocol)
**5 Mandatory MCPs for AI-assisted development:**
1. **GitHub MCP** - PR/issue management, automation
2. **Vercel MCP** - Deployment automation, preview URLs
3. **Supabase MCP** - Database operations, migrations
4. **ShadCN MCP** - Component generation and management
5. **Playwright MCP** - E2E testing automation

### Version Notes
- **All versions listed are latest stable releases** as of template creation date
- If a version seems unreleased, it's likely already available (trust the prompt)
- Verify `package.json` after initialization to confirm versions
- Technologies are chosen for production readiness, not bleeding edge

---

## 2. Architecture & Development Principles

### Code Organization
- **Feature-based structure** in `/src/features/`
- Organize by feature, not by file type
- Keep related code together (components, hooks, types, tests)
- Co-locate tests with source code

### DRY Principles (Don't Repeat Yourself)
- **Never reinvent the wheel**
- Use Supabase built-in Auth (don't build custom)
- Use ShadCN blocks and templates (dashboard, auth, landing)
- Share components across features
- Leverage existing battle-tested solutions

### TDD Strategy (Test-Driven Development)
- **TDD-enforced for critical paths:**
  - Authentication: >80% coverage
  - Authorization (RBAC): >80% coverage
  - Payment processing: >80% coverage
  - Admin functions: >80% coverage
- **TDD-ready for everything else:**
  - Business logic: 30% coverage target
  - UI components: Test key interactions
  - Utilities: Test edge cases
- **Pre-commit hooks:** Block commits below coverage thresholds

### Graceful Degradation Pattern
**Philosophy:** Fail-safe, not fail-hard
- System continues with reduced functionality when services unavailable
- Clear communication to users (banners, toasts)
- Never crash on missing config or service failures
- **Examples:**
  - Missing Supabase credentials → Auto demo mode
  - Payment service down → Cache + retry queue
  - Email service down → Log + manual review

### Demo Mode System (3-Tier Hierarchy)
1. **Admin Dashboard Toggle** (highest priority)
   - Runtime control via `system_settings` table
   - Override environment variables
   - Instant enable/disable across entire platform
2. **Environment Variable** (`VITE_DEMO_MODE=true`)
   - Development/staging environments
   - Preview deployments
   - Local testing
3. **Auto-Fallback** (lowest priority)
   - Missing `VITE_SUPABASE_URL` or `VITE_SUPABASE_ANON_KEY`
   - Automatic mock client activation
   - Zero-config quick start for demos

**Demo Mode Features:**
- Mock Supabase client with realistic data
- Demo login button (one-click access)
- DemoModeBanner component (dismissible warning)
- Console warnings (not errors)
- Fully functional app with simulated backend

**Platform Admin Demo Mode:**
- **Platform admins MUST be able to login during demo mode**
- Mock data includes platform admin role for demo user
- Prevents admin lock-out scenario (can't disable demo mode if locked out)
- **Quick demo login buttons on ALL login pages:**
  - `/login` - Regular user demo login
  - `/admin/login` - Platform admin demo login
- Mock `system_roles` table includes: `demo-user-123` → `platform_admin`
- Ensures admins can test platform features in demo mode

### Project Creation
- **Build from scratch** - Don't use existing boilerplates from GitHub
- Understand every piece of the architecture
- Full control and customization
- Learn by building, not by copying

---

## 3. Features & Pages

### Public Pages
- **Landing Page** - Marketing homepage with call-to-action
- **Auth Pages** - Login, signup, password reset, email verification

### Authenticated Pages
- **Dashboard** - Main workspace (blank canvas approach, add your business logic)
- **Account Page** - User profile, settings, security
- **Settings Page** - User preferences, notifications, integrations

### Admin Features (Platform-Wide)
- **Admin Dashboard** - System overview, analytics
- **User Management** - View, edit, assign platform roles
- **Demo Mode Toggle** - System-wide control
- **Activity Monitoring** - Audit logs, user actions
- **System Settings** - Feature flags, maintenance mode, announcements

### Multi-Tenant Features (Organization-Level)
- **Organization Management** - Create, configure, delete workspaces
- **Member Management** - Invite, assign roles, remove members
- **Invitation System** - Email invites with magic links, expiration
- **Organization Settings** - Name, billing, preferences per workspace
- **Organization Dashboard** - Workspace-specific analytics and content

### Layout Components
- **Collapsible Sidebar** - Feature navigation
- **Header** - Top bar with user menu, notifications, search
- **Footer** - Links, legal, copyright

---

## 4. UI/UX Principles

### User Experience
- **Optimistic UI** - Update UI immediately, sync in background
  - Show success state instantly
  - Rollback gracefully on error
  - Display subtle syncing indicator
- **Fail Gracefully** - Never crash, always provide feedback
  - Meaningful error messages
  - Actionable recovery steps
  - Fallback content when data unavailable
- **Loading States** - Skeleton screens, spinners, progress bars
- **Responsive Design** - Mobile-first, tablet, desktop breakpoints

### Component Strategy
- **Use ShadCN components as much as possible**
- Start with ShadCN blocks (pre-built compositions)
- Customize when necessary (theming, variants)
- Maintain consistent design language
- Accessibility built-in (ARIA, keyboard nav)

---

## 5. Documentation Strategy

### Documentation Philosophy
- **Documentation as Code** - Version controlled, lives with codebase
- **Progressive Disclosure** - README → CLAUDE.md → detailed docs
- **Living Documentation** - Update docs with code changes
- **Single Source of Truth (SSOT)** - One canonical location per topic

### Documentation Structure
```
/docs/
  /documentation/       # Core technical docs
    architecture.md
    auth.md
    rbac.md
    multi-tenancy.md
    testing.md
    deployment.md
    setup.md
  /specs/              # Technical specifications
    database-schema.md
    rbac-spec.md
    api-spec.md
  /tasks/              # Task management
    /active/           # In progress
    /complete/         # Finished
    /template/         # Templates
    /draft/            # Planned
```

### Documentation Rules
- **CLAUDE.md in root** - AI assistant context (ONLY doc in root)
- **Never docs in root** unless absolutely required (99% no)
- **Before creating ANY document:**
  1. Can I update an existing doc? → Update, don't create
  2. Is this SSOT? → Make it canonical
  3. Belongs in root? → 99% no, goes in `/docs/`
  4. What's the lifecycle? → Place in appropriate subdirectory
- **Keep docs clean and organized** - Easy navigation, searchable

### Session Notes
- **Document build conversations in `/docs/notes.md`**
- Record any additions or changes beyond the original prompt
- Track user requests and decisions made during implementation
- Note deviations from the plan with rationale
- Include timestamps and context for future reference
- Use as a living log of the project's evolution

---

## 6. Testing & CI/CD

### Testing Strategy

**Coverage Requirements:**
- **Critical Paths (>80% coverage, enforced):**
  - Authentication flows
  - Authorization (RBAC, RLS policies)
  - Payment processing
  - Admin functions (user management, role assignment)
- **Standard Features (30% coverage, target):**
  - Business logic
  - Form validation
  - Utility functions
- **Optional (test when valuable):**
  - Simple UI components
  - Configuration files
  - Prototypes and spikes

**Test Types:**
- **Unit Tests** - Vitest, co-located with source
- **Integration Tests** - Multi-component interactions
- **E2E Tests** - Playwright, user workflows
- **Smoke Tests** - White screen detection, critical paths
- **Type Tests** - TypeScript compilation, Vitest type testing

**Pre-Commit Hooks (Husky):**
- Run tests, block if coverage drops below thresholds
- Lint and format code
- Type checking
- Commit message validation (conventional commits)

### CI/CD Pipeline (GitHub Actions)

**On Pull Request:**
- Lint (ESLint)
- Type check (TypeScript)
- Unit tests (Vitest)
- E2E tests (Playwright)
- Coverage report (comment on PR)
- Build verification

**On Merge to Main:**
- All PR checks
- Deploy to Vercel (production)
- Supabase migrations (if any)
- Type generation (`database.types.ts`)
- Smoke tests on production

**Deployment Verification:**
- White screen detection
- Critical user flows working
- Console error monitoring
- Performance metrics baseline

### Playwright Configuration
- **List mode** and **headless mode** for CI
- **Head mode** for local debugging
- Visual automation without full screen takeover
- MCP integration for AI-assisted test generation

### End-of-Build Validation
Before considering the build complete, run through this checklist:

**Required Checks:**
- ✅ **Full test suite passes** - `npm test` (all unit + integration tests)
- ✅ **White screen detection** - Smoke tests verify key pages render
- ✅ **TypeScript compilation** - `npm run type-check` or `tsc --noEmit` (zero errors)
- ✅ **ESLint validation** - `npm run lint` (zero errors, warnings acceptable)
- ✅ **Production build succeeds** - `npm run build` (no build errors)
- ✅ **No console errors** - Check key pages (landing, login, dashboard, admin) for console errors
- ✅ **Demo mode works** - Test auto-fallback, demo login buttons, admin demo access
- ✅ **Real mode works** - Test with actual Supabase credentials

**Optional but Recommended:**
- Preview deployment works (Vercel preview URL)
- E2E tests pass (`npm run test:e2e`)
- Database migrations apply cleanly
- All environment variables documented

**If anything fails:**
- Document the issue in `/docs/notes.md`
- Include error messages and context
- Note if it's blocking or can be fixed later

---

## 7. Philosophy & Constraints

### Never Reinvent the Wheel
- **If Supabase offers it, use it:**
  - Authentication → Supabase Auth
  - Database → PostgreSQL with RLS
  - Storage → Supabase Storage
  - Realtime → Supabase Realtime subscriptions
- **If ShadCN has it, use it:**
  - Dashboard → `dashboard` block
  - Sidebar → `sidebar` block
  - Auth → `login` block
  - Forms → Pre-built form components
- **If it's battle-tested, leverage it:**
  - Logging → Pino
  - Validation → Zod
  - Forms → react-hook-form
  - Testing → Vitest + Playwright

**Reference Official Guides:**
- **Supabase Multi-Tenancy:** https://supabase.com/docs/guides/database/postgres/row-level-security#multi-tenancy
- Follow official patterns and best practices when available
- Use documented approaches over custom solutions
- Check official docs before implementing complex features

### Build Fresh (Don't Use Boilerplates)
- **Create this project from scratch**
- No GitHub boilerplates (e.g., vite-react-ts-shadcn-ui)
- Understand every line of code
- Full control over architecture
- Learn patterns, don't copy-paste

### MCP-First Development
- **Install 5 mandatory MCPs early** (Phase 0 or Phase 1)
- Authenticate with services (GitHub, Vercel, Supabase)
- Use MCPs for repetitive tasks:
  - ShadCN MCP for component generation
  - GitHub MCP for PR creation
  - Vercel MCP for deployment
  - Supabase MCP for migrations
  - Playwright MCP for test generation
- **Human input required:** MCP authentication, OAuth approvals

### Graceful Degradation Everywhere
- **Apply the demo mode pattern to all external services:**
  - Supabase → Mock client (implemented)
  - Stripe → Mock payment processor (future)
  - SendGrid → Mock email service (future)
  - S3/Storage → Mock file storage (future)
  - Analytics → Mock tracking (future)
- **Benefits:**
  - Zero-config quick start
  - Demo environments without real services
  - Development without production credentials
  - Testing without external dependencies

### AI-Native Workflow
**Development Flow:**
```
Human: Write spec → Create draft task
  ↓
AI: Read spec + plan + code → Implement + Test + Document
  ↓
Human: Review code + security + business logic
  ↓
Human: Merge → AI archives task
```

**Human focuses on:**
- Requirements and specifications
- Business logic validation
- Security review
- Strategic decisions
- User experience

**AI focuses on:**
- Implementation
- Test writing
- Documentation updates
- Repetitive tasks
- Pattern application

---

## 8. Summary

### Execution Instructions

**For Claude Code:**
1. **Follow this entire prompt and build until you have a useable app**
   - This is not just a planning document
   - Implement all features described
   - Create a functional, deployable application
2. **If blocked on something:**
   - Document the blocker in `/docs/notes.md`
   - Include what was attempted and why it failed
   - Move on to other tasks, don't get stuck
3. **Document this build session:**
   - Record conversation highlights in `/docs/notes.md`
   - Note any user requests or modifications to the prompt
   - Track decisions made during implementation
4. **Complete the validation checklist:**
   - Run all checks in "End-of-Build Validation" section
   - Fix critical issues before marking complete
   - Document any non-critical issues for later

**Build Goal:** A working SaaS application that can be deployed and used immediately.

---

This is a **production-ready, multi-tenant SaaS boilerplate** designed for speed and quality:

### What You Get
- **Modern Tech Stack** - React 19, Vite 7, TypeScript, TailwindCSS v4, Vitest 4.0
- **Complete Auth System** - Supabase Auth with demo mode fallback
- **Multi-Tenancy** - Row-level isolation, organization workspaces
- **Dual RBAC** - Platform roles + organization roles
- **Admin Dashboard** - User management, system controls
- **Testing Infrastructure** - TDD-ready, 30% coverage target, pre-commit hooks
- **MCP Ecosystem** - AI-assisted development with 5 integrated tools
- **Demo Mode** - 3-tier system for zero-config demos
- **CI/CD Pipeline** - Automated testing, deployment, verification
- **Documentation** - Living docs, AI-friendly format

### Philosophy
- **DRY:** Never reinvent what exists (Supabase, ShadCN, battle-tested libraries)
- **TDD:** Enforce testing where it matters (auth, RBAC, payments)
- **Graceful Degradation:** Fail-safe, not fail-hard
- **AI-Native:** MCP-first, spec-driven, human review
- **Production-Ready:** Not a toy project, ready for real users

### Use Case
Perfect for building:
- B2B SaaS platforms
- Multi-tenant applications
- Workspace collaboration tools
- Project management systems
- CRM/ERP systems
- Any app with organizations + members

### Getting Started
Give this prompt to Claude Code in plan mode. Claude will:
1. Set up MCP ecosystem
2. Initialize project with latest versions
3. Implement features based on this spec
4. Create tests and documentation
5. Configure CI/CD
6. Deploy to Vercel

Let Claude Code decide the implementation phases and order based on dependencies and best practices.

**This is a template.** Customize the business logic in the dashboard and build your unique SaaS product on this solid foundation.
