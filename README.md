# BYO - Build Your Own SaaS Boilerplate

A modern, production-ready SaaS starter template built with Vite, React 18, TypeScript, Supabase, and ShadCN UI.

**Status:** ✅ MVP Complete - Ready for Deployment

---

## 🎯 What is BYO?

BYO (Build Your Own) is a **DRY-first boilerplate** for building SaaS applications fast. It provides a solid foundation with authentication, RBAC, testing, and CI/CD—so you can focus on your business logic, not infrastructure.

### ✨ Key Features

- ✅ **Modern Stack** - Vite + React 18 + TypeScript
- ✅ **Email/Password Auth** - Supabase Auth with password reset
- ✅ **4-Tier RBAC** - Admin, Moderator, User, Guest roles with database-level RLS
- ✅ **ShadCN UI** - Beautiful, accessible components with official blocks
- ✅ **Demo Mode** - Run without Supabase for testing/previews (auto-fallback)
- ✅ **TDD-Ready** - Vitest 4.0 + Playwright setup with example tests
- ✅ **CI/CD** - GitHub Actions + Vercel deployment
- ✅ **Documentation as Code** - Comprehensive docs in `/docs`
- ✅ **Error Boundaries** - Graceful error handling and loading states
- ✅ **Mobile-Responsive** - Collapsible sidebar, mobile-first design

---

## 🚀 Quick Start

### Option 1: Demo Mode (No Supabase Required)

Perfect for testing, previews, or exploring the boilerplate:

```bash
# Clone the repository
git clone [your-repo-url] byo
cd byo

# Install dependencies
npm install

# Use demo mode (no Supabase needed)
cp .env.demo .env.local

# Start development server
npm run dev
```

Visit `http://localhost:5173` and login with:
- **Email**: `demo@example.com`
- **Password**: (any password)

### Option 2: Full Setup (with Supabase)

For production development:

**Prerequisites:**
- Node.js 18+
- npm or yarn
- Supabase account (free tier works)

```bash
# Clone the repository
git clone [your-repo-url] byo
cd byo

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Supabase credentials

# Start development server
npm run dev
```

See **[DEPLOYMENT.md](DEPLOYMENT.md)** for complete Supabase setup instructions.

---

## 📚 Documentation

**New here? Start with these:**

- **[Implementation Plan](/docs/implementation-plan.md)** - Full 10-phase implementation roadmap
- **[Setup Guide](/docs/setup.md)** - Detailed development environment setup
- **[Architecture](/docs/architecture.md)** - System design and architectural decisions
- **[Vercel Deployment Guide](VERCEL.md)** - Fix deployment issues & enable demo mode
- **[Claude Context](/docs/claude.md)** - AI assistant guide for this project

**Dive deeper:**

- [Authentication Guide](/docs/auth.md) - How auth works with Supabase
- [RBAC System](/docs/rbac.md) - Role-based access control explained
- [Database Schema](/docs/specs/database-schema.md) - Complete database structure
- [Testing Strategy](/docs/testing.md) - Unit and E2E testing guide
- [Deployment](/docs/deployment.md) - Complete Vercel & Supabase deployment

---

## 🛠 Tech Stack

### Core
- **[Vite](https://vitejs.dev/)** - Lightning-fast build tool
- **[React 18](https://react.dev/)** - UI library
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety
- **[React Router](https://reactrouter.com/)** - Client-side routing

### Backend & Database
- **[Supabase](https://supabase.com/)** - PostgreSQL, Auth, Storage, Realtime
- **Row Level Security (RLS)** - Database-level authorization

### UI & Styling
- **[TailwindCSS](https://tailwindcss.com/)** - Utility-first CSS
- **[ShadCN UI](https://ui.shadcn.com/)** - Radix UI + Tailwind components
- **ShadCN Blocks** - Pre-built layouts (dashboard, sidebar, auth)

### Forms & Validation
- **[react-hook-form](https://react-hook-form.com/)** - Form state management
- **[Zod](https://zod.dev/)** - Schema validation

### Testing
- **[Vitest 4.0](https://vitest.dev/)** - Unit testing
- **[@testing-library/react](https://testing-library.com/react)** - Component testing
- **[Playwright](https://playwright.dev/)** - E2E testing

### Deployment & CI/CD
- **[Vercel](https://vercel.com/)** - Hosting
- **[GitHub Actions](https://github.com/features/actions)** - CI/CD pipelines

### Developer Experience
- **[Pino](https://getpino.io/)** - Fast JSON logger
- **[ESLint](https://eslint.org/)** - Linting
- **[Prettier](https://prettier.io/)** - Code formatting
- **ShadCN MCP Server** - AI-powered component management

---

## 📦 Project Structure

```
/src/                   # Source code
  /features/            # Feature-based organization
    /auth/              # Authentication
    /dashboard/         # Dashboard
    /account/           # Account management
    /settings/          # User settings
    /landing/           # Landing page
  /components/ui/       # ShadCN components
  /lib/                 # Shared utilities
  /hooks/               # Custom React hooks
  /types/               # TypeScript types

/docs/                  # Documentation (Documentation as Code)
  /specs/               # Technical specifications
  /tasks/               # Task management (active, complete, template, draft)
  implementation-plan.md
  claude.md
  architecture.md
  setup.md
  auth.md
  rbac.md
  deployment.md
  testing.md

/.github/workflows/     # CI/CD pipelines
/tests/                 # E2E tests
/public/                # Static assets
```

---

## 🧪 Running Tests

```bash
# Unit tests (Vitest)
npm test              # Run tests
npm run test:ui       # Open Vitest UI

# E2E tests (Playwright)
npm run test:e2e      # Run E2E tests
npm run test:e2e:ui   # Open Playwright UI
```

---

## 🚢 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import repository in Vercel
3. Add environment variables (Supabase URL and key)
4. Deploy!

**Automatic deployments:**
- Push to `main` → Production deployment
- Pull requests → Preview deployments

See [Deployment Guide](/docs/deployment.md) for details.

---

## 🏗 Development Workflow

1. Create feature branch from `main`
2. Move task from `/docs/tasks/draft/` to `/docs/tasks/active/`
3. Write tests first (TDD)
4. Implement feature using ShadCN blocks and Supabase
5. Update documentation as you code
6. Run tests locally
7. Commit with conventional commits (`feat:`, `fix:`, `docs:`)
8. Push and create PR → CI runs automatically
9. Review and merge → Deploys to Vercel
10. Move task to `/docs/tasks/complete/`

---

## 📋 Available Scripts

```bash
npm run dev           # Start development server
npm run build         # Build for production
npm run preview       # Preview production build
npm test              # Run unit tests
npm run test:e2e      # Run E2E tests
npm run lint          # Lint code
npm run typecheck     # Check TypeScript types
```

---

## 🎨 Key Principles

### DRY (Don't Repeat Yourself)
We **never reinvent the wheel**. This boilerplate leverages:
- ShadCN official blocks (dashboard, sidebar, auth UI)
- Supabase built-in features (auth, RLS, realtime)
- Established patterns (react-hook-form + Zod)

### TDD (Test-Driven Development)
Testing infrastructure is **ready to use**, not enforced. Example tests show the way.

### Documentation as Code
All documentation lives in `/docs`, version controlled, and updated with code changes.

### Feature-Based Organization
Code organized by **feature**, not file type. Better scalability and clear ownership.

---

## 🔐 Security

- **Row Level Security (RLS)** - Database-level authorization
- **JWT-based auth** - Secure token management
- **Environment variables** - Sensitive data never committed
- **TypeScript strict mode** - Catch errors at compile time
- **Input validation** - Zod schemas on all forms

---

## 🤝 Contributing

This is a boilerplate/starter template. Feel free to:
- Fork and customize for your needs
- Open issues for bugs or questions
- Submit PRs for improvements
- Share your projects built with BYO!

---

## 📄 License

[MIT License](LICENSE) - Use freely for personal or commercial projects

---

## 🙏 Acknowledgments

Built with amazing open-source tools:
- [ShadCN UI](https://ui.shadcn.com/) by [@shadcn](https://twitter.com/shadcn)
- [Supabase](https://supabase.com/)
- [Vite](https://vitejs.dev/)
- And many more!

---

## 📞 Support & Questions

- **Documentation:** See `/docs` directory
- **Issues:** [GitHub Issues](your-repo/issues)
- **Discussions:** [GitHub Discussions](your-repo/discussions)

---

## 🗺 Roadmap

**MVP Status: ✅ Complete!**

- [x] Project structure and documentation
- [x] Vite + React + TypeScript setup
- [x] TailwindCSS + ShadCN UI integration (10+ components)
- [x] Supabase database schema + RLS policies
- [x] Email/password authentication flow
- [x] RBAC system (4 roles, 10 permissions)
- [x] Core pages (landing, dashboard, account, settings)
- [x] Testing infrastructure (Vitest + Playwright)
- [x] CI/CD pipelines (GitHub Actions + Vercel)
- [x] Demo mode with auto-fallback
- [x] Demo login button
- [x] Mobile-responsive layout

**What's Implemented:**
- ✅ Email/password authentication
- ✅ Password reset (via Supabase)
- ✅ Profile editing (display name)
- ✅ Role-based UI sections
- ✅ Permission checking utilities
- ✅ Database-level RLS enforcement
- ✅ Session persistence
- ✅ Error boundaries
- ✅ Mock Supabase client for demo mode

**Next Phase: Missing Features**

These features are **not yet implemented** (placeholders only):

- [ ] **OAuth Providers** - Google, GitHub, etc. (claimed but not implemented)
- [ ] **Magic Links** - Passwordless login (claimed but not implemented)
- [ ] **Admin Dashboard** - User management UI (placeholder section exists)
- [ ] **Email Notifications** - Transactional emails (placeholder button exists)
- [ ] **Email Verification** - Account confirmation emails
- [ ] **Advanced RBAC** - UI for role/permission management
- [ ] **Payment Processing** - Stripe integration
- [ ] **Profile Pictures** - Avatar upload
- [ ] **Anonymous/Guest Auth** - Try before signup
- [ ] **Comprehensive Tests** - Full test coverage (only examples exist)

See [Implementation Plan](/docs/implementation-plan.md) for detailed roadmap.

---

**Built with ❤️ by Tyler**

**Status:** ✅ MVP Complete - Ready for Enhancement Phase
**Last Updated:** 2025-11-02

---

## Quick Links

- [📖 Full Documentation](/docs/)
- [🚀 Implementation Plan](/docs/implementation-plan.md)
- [🤖 AI Context](/docs/claude.md)
- [🏗 Architecture](/docs/architecture.md)
- [🧪 Testing Guide](/docs/testing.md)
- [🚢 Deployment Guide](/docs/deployment.md)
