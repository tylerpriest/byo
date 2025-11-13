# Ready-to-Run V3 Implementation Plan: Modern SaaS Boilerplate

**Project Type:** Web App Boilerplate with SaaS capabilities (Production-Ready MVP)
**Tech Stack:** Vite, React 18, TypeScript, Vitest 4.0, Playwright + Agents + MCP, Vercel, Supabase, TailwindCSS v4, ShadCN UI + MCP
**Principles:** DRY, TDD-Ready, Documentation as Code, Progressive Disclosure, Graceful Degradation, Zero-Config, Fail-Safe, AI-Native Workflow
**Estimated Time:** 3-4 hours (MVP with demo mode + full MCP setup)
**Version:** 3.0

---

## What's New in V3

### ✨ Major Enhancements

**1. Full MCP Ecosystem (5 MCPs)**
- ✅ **GitHub MCP** - PR management, issues, code review
- ✅ **Vercel MCP** - Deployment automation
- ✅ **Supabase MCP** - Database operations
- ✅ **ShadCN MCP** - Component discovery and installation (NOW MANDATORY)
- ✅ **Playwright MCP** - AI-assisted E2E testing with self-healing tests

**2. Playwright Agents Integration**
- AI-powered test generation
- Self-healing selectors
- Automatic test maintenance
- Visual regression testing with AI

**3. Vitest 4.0 Full Feature Set**
- **Browser Mode** - Real browser testing (not jsdom)
- **Workspace Mode** - Monorepo support
- **In-Source Testing** - Tests alongside code
- **Benchmark Mode** - Performance testing
- **Type Testing** - TypeScript type checking
- **Improved Coverage** - v8 coverage with better accuracy
- **Sharding** - Parallel test execution across machines

**4. Modern Tooling Updates**
- ESLint v9 flat config (modern, faster)
- TailwindCSS v4 (oxide engine, faster builds)
- Husky pre-commit hooks (quality gates)
- Automated MCP authentication setup

**5. Enhanced Testing Strategy**
- 30% coverage target (up from 5%)
- Critical path testing enforced
- Playwright agents for E2E
- Vitest browser mode for components

**6. AI-Native Workflow**
- Structured task management
- Spec-driven development
- Human review checkpoints
- Automated quality gates

**7. Production Features**
- Onboarding system (Phase 12)
- Integrated optimistic UI
- End-of-build audit
- Docker compose option

---

## V3 vs V2 Comparison

| Feature | V2 | V3 |
|---------|----|----|
| **MCPs** | 0 configured | 5 fully integrated |
| **ShadCN MCP** | Optional | **Mandatory** in Phase 2 |
| **Playwright** | Basic setup | + Agents + MCP |
| **Vitest** | Basic config | All V4 features |
| **ESLint** | v8 (.eslintrc.cjs) | **v9 flat config** |
| **TailwindCSS** | v3 | **v4 oxide** |
| **Test Coverage** | 5% (examples) | **30% (critical)** |
| **Pre-commit** | None | **Husky hooks** |
| **Onboarding** | None | **Full system** |
| **Optimistic UI** | File only | **Integrated** |
| **MCP Auth** | Manual | **Scripted** |
| **Docker** | None | **Option included** |
| **Task Templates** | None | **ChemJungle import** |

---

## Core Principles

### DRY (Don't Repeat Yourself)
- **Leverage existing solutions:** ShadCN blocks, Supabase Auth, battle-tested libraries
- **Use official patterns:** react-hook-form + Zod, TanStack Table, Supabase RLS
- **Mock for testing:** Compatible mock clients for zero-config experience
- **Component reuse:** ShadCN MCP enables AI-powered component discovery

### TDD-Ready with 30% Coverage Target
- **Vitest 4.0** with browser mode, workspace mode, type testing
- **Playwright** with agents and MCP for AI-assisted E2E
- **Critical path coverage:** Auth, RBAC, payments, public APIs (30%)
- **Example tests** for optional features (remaining 70%)
- **Enable TDD, don't mandate it** - but encourage it

### AI-Native Workflow
- **Spec-driven development:** Human writes spec, AI implements
- **Task lifecycle:** Draft → Active → Complete
- **MCP ecosystem:** 5 MCPs for seamless AI integration
- **Human review gates:** Auth, payments, business logic
- **Automated quality:** Pre-commit hooks, CI/CD

### Graceful Degradation & Fail-Safe
- **Never crash on missing config** - Auto-fallback to demo mode
- **Mock ALL external dependencies** - Supabase, Stripe, SendGrid, etc.
- **Zero-config quick start** - Works immediately after clone
- **Clear communication** - Banners/warnings when in fallback mode

### Documentation as Code
- **Single Source of Truth (SSOT)** - Update existing, never duplicate
- **Progressive disclosure** - Simple → Detailed
- **No root clutter** - Only README, LICENSE, DEPLOYMENT, CLAUDE, CONTRIBUTING in root
- **Living documentation** - Updates with code changes
- **AI-accessible** - CLAUDE.md in root for easy AI access

---

## Implementation Phases

### Phase 0: MCP & Tool Setup (NEW - 20 min)

**Purpose:** Configure all 5 MCPs and development tools before starting implementation.

**Prerequisites:**
- Node.js 18+ installed
- npm or pnpm installed
- Git configured

**Tasks:**

**1. Install Required CLIs**
```bash
# GitHub CLI
brew install gh  # macOS
# or: https://cli.github.com/

# Vercel CLI
npm install -g vercel

# Supabase CLI
npm install -g supabase

# Playwright (will be installed per-project)
# ShadCN (npx based, no global install)
```

**2. Authenticate CLIs**
```bash
# GitHub
gh auth login
# Choose: GitHub.com → HTTPS → Authenticate via web

# Vercel
vercel login
# Opens browser for authentication

# Supabase
npx supabase login
# Opens browser for authentication

# Verify
gh auth status
vercel whoami
npx supabase projects list
```

**3. Configure Claude Desktop MCPs**

Create or update `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS):

```json
{
  "mcpServers": {
    "github": {
      "command": "gh",
      "args": ["mcp"]
    },
    "vercel": {
      "command": "vercel",
      "args": ["mcp"]
    },
    "supabase": {
      "command": "npx",
      "args": ["-y", "supabase", "mcp"]
    },
    "shadcn": {
      "command": "npx",
      "args": ["-y", "@shadcn/mcp"]
    },
    "playwright": {
      "command": "npx",
      "args": ["-y", "@playwright/mcp"]
    }
  }
}
```

**Linux:** `~/.config/Claude/claude_desktop_config.json`
**Windows:** `%APPDATA%\Claude\claude_desktop_config.json`

**4. Restart Claude Desktop**
```bash
# macOS
killall "Claude Desktop" && open -a "Claude Desktop"

# Verify MCPs loaded
# In Claude, type: /mcp list
```

**5. Create MCP Authentication Verification Script**

File: `/scripts/verify-mcp-auth.sh`

```bash
#!/bin/bash
set -e

echo "🔍 Verifying MCP Authentication Status..."
echo ""

# GitHub
echo "📦 GitHub CLI:"
if gh auth status &>/dev/null; then
  echo "  ✅ Authenticated as $(gh api user --jq .login)"
else
  echo "  ❌ Not authenticated. Run: gh auth login"
fi

# Vercel
echo ""
echo "🚀 Vercel CLI:"
if vercel whoami &>/dev/null; then
  echo "  ✅ Authenticated as $(vercel whoami)"
else
  echo "  ❌ Not authenticated. Run: vercel login"
fi

# Supabase
echo ""
echo "🗄️  Supabase CLI:"
if npx supabase projects list &>/dev/null; then
  echo "  ✅ Authenticated"
else
  echo "  ❌ Not authenticated. Run: npx supabase login"
fi

# Playwright
echo ""
echo "🎭 Playwright:"
if command -v playwright &>/dev/null || [ -f "./node_modules/.bin/playwright" ]; then
  echo "  ✅ Installed"
else
  echo "  ⚠️  Will be installed in Phase 7"
fi

# ShadCN
echo ""
echo "🎨 ShadCN:"
if npx shadcn@latest --version &>/dev/null; then
  echo "  ✅ Available ($(npx shadcn@latest --version))"
else
  echo "  ❌ Not available. Check npm connectivity"
fi

echo ""
echo "✨ Verification complete!"
```

```bash
chmod +x scripts/verify-mcp-auth.sh
./scripts/verify-mcp-auth.sh
```

**6. Optional: Automated Setup Script**

File: `/scripts/setup-mcps.sh`

```bash
#!/bin/bash
set -e

echo "🚀 Setting up MCP ecosystem for BYO..."

# Check prerequisites
command -v node >/dev/null 2>&1 || { echo "❌ Node.js required"; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "❌ npm required"; exit 1; }

# Install CLIs
echo "📦 Installing CLIs..."
npm install -g vercel supabase

# Install GitHub CLI (platform-specific)
if [[ "$OSTYPE" == "darwin"* ]]; then
  if ! command -v gh &>/dev/null; then
    echo "📦 Installing GitHub CLI via Homebrew..."
    brew install gh
  fi
else
  echo "⚠️  Please install GitHub CLI manually: https://cli.github.com/"
fi

# Authenticate
echo ""
echo "🔐 Starting authentication..."
echo "You'll be prompted to authenticate each service..."

gh auth login
vercel login
npx supabase login

# Verify
echo ""
./scripts/verify-mcp-auth.sh

echo ""
echo "✅ MCP setup complete!"
echo "⚠️  Remember to restart Claude Desktop to load MCPs"
```

**Verification Checklist:**
- [ ] GitHub CLI authenticated
- [ ] Vercel CLI authenticated
- [ ] Supabase CLI authenticated
- [ ] Claude Desktop MCP config created
- [ ] Claude Desktop restarted
- [ ] All 5 MCPs visible in Claude (type `/mcp list`)

**Common Issues:**

**Issue:** MCP not showing in Claude Desktop
- **Fix:** Restart Claude Desktop completely
- **Fix:** Check JSON syntax in config file
- **Fix:** Verify CLIs are in PATH

**Issue:** Permission denied on scripts
- **Fix:** `chmod +x scripts/*.sh`

**Issue:** npx commands hanging
- **Fix:** Clear npm cache: `npm cache clean --force`

---

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
  /features/          # Feature-based organization (scales better)
    /auth/            # Authentication (login, signup, context)
      /components/    # Auth-specific components
      /context/       # Auth context provider
      /hooks/         # Auth hooks
    /dashboard/       # Dashboard page and components
    /account/         # Account management
    /settings/        # User settings
    /landing/         # Landing page
    /onboarding/      # NEW: User onboarding system
  /components/
    /ui/              # ShadCN components
  /lib/               # Utilities
    supabase.ts       # Supabase client with auto-fallback
    supabase-mock.ts  # Mock Supabase client for demo mode
    rbac.ts           # Permission utilities
    logger.ts         # Pino logger
    optimistic-ui.ts  # NEW: Integrated optimistic UI helpers
    utils.ts          # General utilities (cn, etc.)
  /hooks/             # Custom React hooks
  /types/             # TypeScript types
    database.types.ts # Generated Supabase types
  /test/              # NEW: Test utilities and fixtures
    /fixtures/        # Test data
    /helpers/         # Test helpers
    setup.ts          # Global test setup
/docs/
  /documentation/     # All documentation files
    architecture.md
    setup.md
    auth.md
    rbac.md
    deployment.md
    testing.md
    demo-mode.md
    mcp-setup.md      # NEW: MCP configuration guide
  /specs/             # Technical specifications
    database-schema.md
    api-spec.md
    rbac-spec.md
    onboarding-spec.md  # NEW
  /tasks/             # Task management
    /active/          # Current tasks
    /complete/        # Completed tasks
    /template/        # Task templates (import from ChemJungle)
    /draft/           # Future/planned tasks
  /prompts/           # AI prompts and session summaries
    ready-to-run-v3.md  # This document
/.github/
  /workflows/         # CI/CD workflows
    ci.yml            # Lint, typecheck, test
    deploy.yml        # Vercel deployment
    types.yml         # Supabase type generation
    audit.yml         # NEW: End-of-build audit
/tests/               # E2E tests (Playwright)
  /e2e/               # End-to-end test specs
  /fixtures/          # Test fixtures
  playwright.config.ts
/scripts/             # NEW: Build and setup scripts
  verify-mcp-auth.sh
  setup-mcps.sh
  audit.sh            # NEW: End-of-build audit
/public/              # Static assets
/docker/              # NEW: Docker compose option
  docker-compose.yml
  supabase/
CLAUDE.md             # AI context (MUST be in root for easy access)
```

**New in V3:**
- `/src/test/` - Centralized test utilities
- `/src/features/onboarding/` - Onboarding system
- `/docs/documentation/mcp-setup.md` - MCP configuration
- `/scripts/` - Automation scripts
- `/docker/` - Docker compose option
- `CLAUDE.md` in root (not /docs/)

---

### Phase 2: TailwindCSS v4 + ShadCN UI + MCP (15 min)

**Tasks:**

**6. Install TailwindCSS v4 (Oxide Engine)**
```bash
npm install -D tailwindcss@next @tailwindcss/postcss@next autoprefixer
npx tailwindcss init -p
```

**tailwind.config.js (V4 syntax):**
```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

**7. Initialize ShadCN UI**
```bash
npx shadcn@latest init
# Choose: Default style, Zinc color, CSS variables: Yes
```

**8. Install ShadCN blocks via CLI:**
```bash
npx shadcn add dashboard-01    # Complete dashboard layout
npx shadcn add sidebar-07      # Collapsible sidebar
npx shadcn add login-03        # Auth UI
```

**9. Install core components:**
```bash
npx shadcn add form dialog toast breadcrumb button card input \
  dropdown-menu avatar badge separator sheet alert \
  checkbox select label textarea skeleton switch
```

**10. 🔴 MANDATORY: Configure ShadCN MCP Server**
```bash
npx shadcn@latest mcp
```

This was optional in V2, now **mandatory** for AI-native workflow.

**Benefits:**
- AI can discover available components
- Automated component installation
- Pattern matching for similar components
- Better AI code generation

**Verify MCP:**
```bash
# In Claude Desktop, verify:
# Type: "What ShadCN components are available?"
# Claude should list components from your components.json
```

**11. Install additional UI dependencies:**
```bash
npm install lucide-react class-variance-authority clsx tailwind-merge
npm install @radix-ui/react-icons  # Optional, for additional icons
```

**Why These Blocks:**
- `dashboard-01`: Full dashboard with sidebar, charts, data table
- `sidebar-07`: Mobile-friendly collapsible sidebar
- `login-03`: Clean login page with muted background

**TailwindCSS v4 Benefits:**
- 5x faster builds (Rust-based oxide engine)
- Better autocomplete
- Smaller CSS output
- Native cascade layers

---

### Phase 3: Supabase Integration + Mock Client + MCP (25 min)

**Tasks:**

**12. Install Supabase packages**
```bash
npm install @supabase/supabase-js @supabase/ssr
```

**13. Configure Supabase MCP** (already done in Phase 0, verify here)

Verify in Claude Desktop:
```
"What Supabase projects do I have?"
```

**14. Initialize Supabase CLI**

**Option A: npx (Recommended for getting started)**
```bash
npx supabase init
npx supabase start  # Starts local Supabase with Docker
```

**Option B: Docker Compose (For teams)**

File: `/docker/docker-compose.yml`
```yaml
version: '3.8'
services:
  postgres:
    image: supabase/postgres:15.1.0.147
    healthcheck:
      test: pg_isready -U postgres -h localhost
      interval: 5s
      timeout: 5s
      retries: 10
    command:
      - postgres
      - -c
      - config_file=/etc/postgresql/postgresql.conf
      - -c
      - log_min_messages=fatal
    restart: unless-stopped
    ports:
      - 5432:5432
    environment:
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: postgres
    volumes:
      - ./supabase/data:/var/lib/postgresql/data

  studio:
    image: supabase/studio:20231123-64a766a
    restart: unless-stopped
    ports:
      - 54323:3000
    environment:
      SUPABASE_URL: http://kong:8000
      STUDIO_PG_META_URL: http://meta:8080
      SUPABASE_ANON_KEY: your-anon-key
      SUPABASE_SERVICE_KEY: your-service-key

  # Add other Supabase services as needed
  # (auth, realtime, storage, etc.)
```

```bash
# Start with Docker
docker-compose -f docker/docker-compose.yml up -d

# Or use npx (simpler)
npx supabase start
```

**15. Create database schema with migrations**

File: `/supabase/migrations/20250101000000_initial_schema.sql`

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Roles table
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL CHECK (name IN ('Admin', 'Moderator', 'User', 'Guest')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User roles (many-to-many)
CREATE TABLE user_roles (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  assigned_by UUID REFERENCES auth.users(id),
  PRIMARY KEY (user_id, role_id)
);

-- Permissions table
CREATE TABLE permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  resource TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('read', 'write', 'delete', 'admin')),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Role permissions (many-to-many)
CREATE TABLE role_permissions (
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

-- Onboarding tracking (NEW in V3)
CREATE TABLE user_onboarding (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_completed BOOLEAN DEFAULT FALSE,
  first_action_completed BOOLEAN DEFAULT FALSE,
  tutorial_viewed BOOLEAN DEFAULT FALSE,
  tour_step INTEGER DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default roles
INSERT INTO roles (name, description) VALUES
  ('Admin', 'Full system access'),
  ('Moderator', 'Content moderation and management'),
  ('User', 'Standard user access'),
  ('Guest', 'Limited read-only access');

-- Insert default permissions (10 permissions across 3 resources)
INSERT INTO permissions (name, resource, action, description) VALUES
  ('users.read', 'users', 'read', 'View user profiles'),
  ('users.write', 'users', 'write', 'Edit user profiles'),
  ('users.delete', 'users', 'delete', 'Delete users'),
  ('users.admin', 'users', 'admin', 'Manage user roles'),
  ('content.read', 'content', 'read', 'View content'),
  ('content.write', 'content', 'write', 'Create/edit content'),
  ('content.delete', 'content', 'delete', 'Delete content'),
  ('settings.read', 'settings', 'read', 'View settings'),
  ('settings.write', 'settings', 'write', 'Modify settings'),
  ('reports.read', 'reports', 'read', 'View reports');

-- Assign permissions to roles
-- Admin: All permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'Admin';

-- Moderator: Content + reports
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'Moderator'
  AND p.name IN ('content.read', 'content.write', 'content.delete', 'reports.read');

-- User: Basic read + own content
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'User'
  AND p.name IN ('users.read', 'content.read', 'content.write');

-- Guest: Read only
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'Guest'
  AND p.name IN ('content.read');

-- RLS Policies

-- Profiles: Users read own, admins read all
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Admins can read all profiles"
ON profiles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid() AND r.name = 'Admin'
  )
);

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = id);

-- User roles: Admins manage, users view own
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own roles"
ON user_roles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON user_roles FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid() AND r.name = 'Admin'
  )
);

CREATE POLICY "Admins can assign roles"
ON user_roles FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid() AND r.name = 'Admin'
  )
);

-- Roles: Everyone can read
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read roles"
ON roles FOR SELECT
TO authenticated
USING (true);

-- Permissions: Everyone can read
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read permissions"
ON permissions FOR SELECT
TO authenticated
USING (true);

-- Role permissions: Everyone can read
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read role permissions"
ON role_permissions FOR SELECT
TO authenticated
USING (true);

-- Onboarding: Users manage own, admins see all (NEW)
ALTER TABLE user_onboarding ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own onboarding"
ON user_onboarding FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all onboarding"
ON user_onboarding FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_roles ur
    JOIN roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid() AND r.name = 'Admin'
  )
);

-- Functions

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );

  -- Assign default 'User' role
  INSERT INTO public.user_roles (user_id, role_id, assigned_by)
  SELECT NEW.id, r.id, NEW.id
  FROM roles r
  WHERE r.name = 'User';

  -- Initialize onboarding (NEW)
  INSERT INTO public.user_onboarding (user_id)
  VALUES (NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_profiles_updated
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER on_onboarding_updated
  BEFORE UPDATE ON user_onboarding
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
```

**16. Create Mock Supabase Client** (same as V2, 280 lines)

File: `/src/lib/supabase-mock.ts`

```typescript
// Mock Supabase client for demo mode
// Implements compatible API with real Supabase client
// Zero network calls, instant responses

interface MockUser {
  id: string
  email: string
  user_metadata: { display_name: string }
  created_at: string
}

interface MockSession {
  user: MockUser
  access_token: string
}

const DEMO_USER: MockUser = {
  id: 'demo-user-123',
  email: 'demo@example.com',
  user_metadata: { display_name: 'Demo User' },
  created_at: new Date().toISOString(),
}

const DEMO_SESSION: MockSession = {
  user: DEMO_USER,
  access_token: 'demo-token-123',
}

// Demo data
const DEMO_ROLES = [
  { id: 'role-1', name: 'Admin', description: 'Full access' },
  { id: 'role-2', name: 'User', description: 'Standard access' },
]

const DEMO_PERMISSIONS = [
  { id: 'perm-1', name: 'users.read', resource: 'users', action: 'read' },
  { id: 'perm-2', name: 'users.write', resource: 'users', action: 'write' },
  { id: 'perm-3', name: 'content.read', resource: 'content', action: 'read' },
]

// Mock implementation (simplified - see v2 for full 280 lines)
export const mockSupabase = {
  auth: {
    signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
      console.log('🎭 Mock: signInWithPassword', email)
      if (email === 'demo@example.com') {
        return { data: { user: DEMO_USER, session: DEMO_SESSION }, error: null }
      }
      return { data: { user: null, session: null }, error: { message: 'Invalid credentials' } }
    },
    signUp: async ({ email, password }: { email: string; password: string }) => {
      console.log('🎭 Mock: signUp', email)
      return { data: { user: DEMO_USER, session: DEMO_SESSION }, error: null }
    },
    signOut: async () => {
      console.log('🎭 Mock: signOut')
      return { error: null }
    },
    getSession: async () => {
      console.log('🎭 Mock: getSession')
      return { data: { session: DEMO_SESSION }, error: null }
    },
    getUser: async () => {
      console.log('🎭 Mock: getUser')
      return { data: { user: DEMO_USER }, error: null }
    },
    onAuthStateChange: (callback: (event: string, session: MockSession | null) => void) => {
      console.log('🎭 Mock: onAuthStateChange')
      setTimeout(() => callback('SIGNED_IN', DEMO_SESSION), 0)
      return { data: { subscription: { unsubscribe: () => {} } } }
    },
  },
  from: (table: string) => ({
    select: (columns = '*') => ({
      eq: (column: string, value: any) => ({
        single: async () => {
          console.log(`🎭 Mock: ${table}.select(${columns}).eq(${column}, ${value}).single()`)
          // Return mock data based on table
          if (table === 'profiles') return { data: { id: DEMO_USER.id, display_name: 'Demo User' }, error: null }
          if (table === 'roles') return { data: DEMO_ROLES[0], error: null }
          return { data: null, error: null }
        },
      }),
    }),
    insert: (data: any) => ({
      select: () => ({
        single: async () => {
          console.log(`🎭 Mock: ${table}.insert()`, data)
          return { data, error: null }
        },
      }),
    }),
    update: (data: any) => ({
      eq: (column: string, value: any) => ({
        select: () => ({
          single: async () => {
            console.log(`🎭 Mock: ${table}.update().eq(${column}, ${value})`, data)
            return { data, error: null }
          },
        }),
      }),
    }),
  }),
}
```

**17. Generate TypeScript types**
```bash
npx supabase gen types typescript --local > src/types/database.types.ts
```

**18. Create Supabase client with graceful degradation**

File: `/src/lib/supabase.ts`

```typescript
import { createClient } from '@supabase/supabase-js'
import { mockSupabase } from './supabase-mock'
import type { Database } from '@/types/database.types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const explicitDemoMode = import.meta.env.VITE_DEMO_MODE === 'true'

// Auto-detect missing credentials
const isDemoMode = explicitDemoMode || !supabaseUrl || !supabaseAnonKey
export const isAutoFallbackMode = !explicitDemoMode && (!supabaseUrl || !supabaseAnonKey)

// Graceful degradation: fallback to mock instead of crashing
if (isDemoMode) {
  if (isAutoFallbackMode) {
    console.warn('⚠️  Auto-fallback to Demo Mode: Supabase credentials not configured')
    console.warn('   Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to use real database')
  } else {
    console.info('🎭 Demo Mode: Using mock Supabase client (explicit)')
  }
}

export const supabase = isDemoMode
  ? mockSupabase
  : createClient<Database>(supabaseUrl, supabaseAnonKey)
```

**19. Create environment files**

`.env.example`:
```bash
# Supabase (Optional - will use demo mode if missing)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Demo Mode (Optional - auto-detected if Supabase vars missing)
VITE_DEMO_MODE=true  # Explicit demo mode (no auto-fallback banner)

# Local Development (Optional)
VITE_SUPABASE_LOCAL_URL=http://localhost:54321
```

`.env.demo`:
```bash
# Quick demo setup - uses mock Supabase client
VITE_DEMO_MODE=true
```

**20. Update `vite-env.d.ts`**
```typescript
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_DEMO_MODE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

---

### Phase 4: Authentication + Demo Login (20 min)

**Tasks:**

**21. Install form dependencies**
```bash
npm install react-hook-form @hookform/resolvers zod
npm install react-router-dom  # For routing
```

**22. Create auth context** (`/src/features/auth/context/auth-context.tsx`)

```typescript
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import type { User, Session } from '@supabase/supabase-js'
import { logger } from '@/lib/logger'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signUp: (email: string, password: string, metadata?: any) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
      logger.info('Auth state changed', { event: _event, userId: session?.user?.id })
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) logger.error('Sign in error', error)
    return { error }
  }

  const signUp = async (email: string, password: string, metadata?: any) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: metadata },
    })
    if (error) logger.error('Sign up error', error)
    return { error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    logger.info('User signed out')
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) throw new Error('useAuth must be used within AuthProvider')
  return context
}

export const useUser = () => useAuth().user
export const useSession = () => useAuth().session
```

**23. Create login page with demo button** (`/src/features/auth/components/login-page.tsx`)

```typescript
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useAuth } from '../context/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useToast } from '@/components/ui/use-toast'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    setIsLoading(true)
    const { error } = await signIn(values.email, values.password)
    setIsLoading(false)

    if (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    } else {
      navigate('/dashboard')
    }
  }

  // NEW: Demo login handler
  const handleDemoLogin = () => {
    form.setValue('email', 'demo@example.com')
    form.setValue('password', 'demo123')
    form.handleSubmit(onSubmit)()
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40">
      <div className="w-full max-w-md space-y-8 px-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Welcome back</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in to your account to continue
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="you@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
        </Form>

        {/* NEW: Demo login divider and button */}
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

        <p className="text-center text-sm text-muted-foreground">
          Don't have an account?{' '}
          <a href="/signup" className="font-medium text-primary hover:underline">
            Sign up
          </a>
        </p>
      </div>
    </div>
  )
}
```

**24. Create signup page** (similar to login, omitted for brevity)

**25. Create protected route component**

```typescript
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/context/auth-context'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
```

---

### Phase 5: RBAC with Integrated Hooks (15 min)

**Tasks:**

**26. Create RBAC utilities** (`/src/lib/rbac.ts` - ~160 lines, same as V2)

**27. Create RBAC hooks** (`/src/hooks/use-rbac.ts` - 6 hooks, same as V2)

**28. Route guards** (authentication-based, same as V2)

---

### Phase 6: Pages with Optimistic UI Integration (20 min)

**NEW in V3:** Optimistic UI is now **integrated**, not just placeholder file

**Tasks:**

**29. Landing page** (same as V2)

**30. Dashboard** (same as V2)

**31. Account page with optimistic UI**

File: `/src/features/account/account-page.tsx`

```typescript
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useAuth } from '@/features/auth/context/auth-context'
import { supabase } from '@/lib/supabase'
import { useOptimisticUpdate } from '@/lib/optimistic-ui'  // NEW: Integrated
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useToast } from '@/components/ui/use-toast'

const profileSchema = z.object({
  display_name: z.string().min(2, 'Name must be at least 2 characters'),
})

export function AccountPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [profile, setProfile] = useState({ display_name: '' })

  // NEW: Optimistic update hook
  const { mutate, isLoading } = useOptimisticUpdate({
    mutationFn: async (data: { display_name: string }) => {
      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', user?.id)
      if (error) throw error
      return data
    },
    onMutate: (data) => {
      // Optimistically update UI before API call
      const previous = profile
      setProfile(data)
      return { previous }
    },
    onError: (_err, _vars, context) => {
      // Rollback on error
      if (context?.previous) {
        setProfile(context.previous)
      }
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive',
      })
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      })
    },
  })

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: profile,
  })

  const onSubmit = (data: z.infer<typeof profileSchema>) => {
    mutate(data)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Account Settings</h1>
        <p className="text-muted-foreground">Manage your account information</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="display_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Display Name</FormLabel>
                <FormControl>
                  <Input placeholder="Your name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
        </form>
      </Form>
    </div>
  )
}
```

**32. Optimistic UI utilities** (NEW: Integrated)

File: `/src/lib/optimistic-ui.ts`

```typescript
import { useState, useCallback } from 'react'

interface UseOptimisticUpdateOptions<TData, TVariables> {
  mutationFn: (variables: TVariables) => Promise<TData>
  onMutate?: (variables: TVariables) => any
  onError?: (error: Error, variables: TVariables, context: any) => void
  onSuccess?: (data: TData, variables: TVariables, context: any) => void
  onSettled?: (data: TData | undefined, error: Error | null, variables: TVariables, context: any) => void
}

export function useOptimisticUpdate<TData, TVariables>({
  mutationFn,
  onMutate,
  onError,
  onSuccess,
  onSettled,
}: UseOptimisticUpdateOptions<TData, TVariables>) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const mutate = useCallback(
    async (variables: TVariables) => {
      setIsLoading(true)
      setError(null)

      // Call onMutate for optimistic update
      let context: any
      if (onMutate) {
        context = onMutate(variables)
      }

      try {
        const data = await mutationFn(variables)

        if (onSuccess) {
          onSuccess(data, variables, context)
        }

        if (onSettled) {
          onSettled(data, null, variables, context)
        }

        return data
      } catch (err) {
        const error = err as Error
        setError(error)

        if (onError) {
          onError(error, variables, context)
        }

        if (onSettled) {
          onSettled(undefined, error, variables, context)
        }

        throw error
      } finally {
        setIsLoading(false)
      }
    },
    [mutationFn, onMutate, onError, onSuccess, onSettled]
  )

  return { mutate, isLoading, error }
}
```

**33. Dashboard layout** (same as V2)

---

### Phase 7: Testing - Vitest 4.0 + Playwright + Agents + MCPs (30 min)

**NEW in V3:** Full Vitest 4.0 features + Playwright agents + both MCPs

**Tasks:**

**34. Install Vitest 4.0 with all features**

```bash
npm install -D vitest@latest @vitest/ui @vitest/coverage-v8 \
  @testing-library/react @testing-library/jest-dom \
  @testing-library/user-event jsdom happy-dom
```

**35. Configure Vitest with V4 features**

File: `vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    // Environment
    environment: 'jsdom', // or 'happy-dom' for faster tests

    // Browser mode (NEW in V4) - Real browser testing
    // browser: {
    //   enabled: true,
    //   name: 'chromium',
    //   provider: 'playwright',
    // },

    // Globals
    globals: true,

    // Setup files
    setupFiles: ['./src/test/setup.ts'],

    // Coverage (v8 engine)
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData/',
        'dist/',
      ],
      // 30% coverage target
      thresholds: {
        lines: 30,
        functions: 30,
        branches: 30,
        statements: 30,
      },
    },

    // In-source testing (NEW in V4)
    includeSource: ['src/**/*.{js,ts,jsx,tsx}'],

    // Workspace mode for monorepos (NEW in V4)
    // workspace: './vitest.workspace.ts',

    // Benchmark mode (NEW in V4)
    benchmark: {
      include: ['**/*.bench.{js,ts,jsx,tsx}'],
    },

    // Type testing (NEW in V4)
    typecheck: {
      enabled: true,
      include: ['**/*.test-d.ts'],
    },

    // Sharding for CI (NEW in V4)
    // shard: {
    //   index: 1,
    //   count: 4,
    // },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

**36. Create test setup**

File: `/src/test/setup.ts`

```typescript
import { expect, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'
import matchers from '@testing-library/jest-dom/matchers'

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers)

// Cleanup after each test
afterEach(() => {
  cleanup()
})

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))
```

**37. Create test utilities**

File: `/src/test/helpers/render.tsx`

```typescript
import { render as rtlRender, RenderOptions } from '@testing-library/react'
import { ReactElement } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '@/features/auth/context/auth-context'

function AllProviders({ children }: { children: React.ReactNode }) {
  return (
    <BrowserRouter>
      <AuthProvider>{children}</AuthProvider>
    </BrowserRouter>
  )
}

export function render(ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  return rtlRender(ui, { wrapper: AllProviders, ...options })
}

export * from '@testing-library/react'
export { render as default }
```

**38. Install Playwright with agents**

```bash
npm init playwright@latest
npm install -D @playwright/test @playwright/experimental-ct-react
```

**39. Configure Playwright with AI agents**

File: `playwright.config.ts`

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',

  // Run tests in files in parallel
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 2 : 0,

  // Opt out of parallel tests on CI
  workers: process.env.CI ? 1 : undefined,

  // Reporter to use
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['list'],
  ],

  use: {
    // Base URL
    baseURL: 'http://localhost:5173',

    // Collect trace when retrying the failed test
    trace: 'on-first-retry',

    // Screenshot on failure
    screenshot: 'only-on-failure',

    // Video on failure
    video: 'retain-on-failure',

    // NEW: AI-powered features
    // Use codegen for test generation
    // Use inspector for debugging
  },

  // Configure projects for major browsers
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  // Run your local dev server before starting the tests
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
})
```

**40. Configure Playwright MCP** (verify from Phase 0)

Test in Claude Desktop:
```
"Generate a Playwright test for the login page"
```

Playwright MCP should help with:
- AI-powered test generation
- Self-healing selectors (auto-update when DOM changes)
- Visual regression testing
- Test maintenance

**41. Create example tests with 30% coverage target**

**Unit Test (Vitest):**

File: `/src/lib/__tests__/rbac.test.ts`

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { hasPermission, hasRole } from '../rbac'
import { supabase } from '../supabase'

vi.mock('../supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(),
  },
}))

describe('RBAC Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('hasPermission', () => {
    it('should return true when user has permission', async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: [{ permissions: { name: 'users.read' } }],
            error: null,
          }),
        }),
      } as any)

      const result = await hasPermission('users.read')
      expect(result).toBe(true)
    })

    it('should return false when user does not have permission', async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      })

      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            data: [],
            error: null,
          }),
        }),
      } as any)

      const result = await hasPermission('users.write')
      expect(result).toBe(false)
    })
  })
})
```

**Component Test (Vitest with Testing Library):**

File: `/src/features/auth/components/__tests__/login-page.test.tsx`

```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@/test/helpers/render'
import userEvent from '@testing-library/user-event'
import { LoginPage } from '../login-page'
import * as authContext from '../../context/auth-context'

vi.mock('react-router-dom', () => ({
  ...vi.importActual('react-router-dom'),
  useNavigate: () => vi.fn(),
}))

describe('LoginPage', () => {
  it('should render login form', () => {
    vi.spyOn(authContext, 'useAuth').mockReturnValue({
      user: null,
      session: null,
      loading: false,
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    })

    render(<LoginPage />)

    expect(screen.getByText('Welcome back')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /demo login/i })).toBeInTheDocument()
  })

  it('should call signIn when form is submitted', async () => {
    const mockSignIn = vi.fn().mockResolvedValue({ error: null })
    vi.spyOn(authContext, 'useAuth').mockReturnValue({
      user: null,
      session: null,
      loading: false,
      signIn: mockSignIn,
      signUp: vi.fn(),
      signOut: vi.fn(),
    })

    render(<LoginPage />)
    const user = userEvent.setup()

    await user.type(screen.getByLabelText('Email'), 'test@example.com')
    await user.type(screen.getByLabelText('Password'), 'password123')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123')
    })
  })

  it('should auto-fill and submit when demo login is clicked', async () => {
    const mockSignIn = vi.fn().mockResolvedValue({ error: null })
    vi.spyOn(authContext, 'useAuth').mockReturnValue({
      user: null,
      session: null,
      loading: false,
      signIn: mockSignIn,
      signUp: vi.fn(),
      signOut: vi.fn(),
    })

    render(<LoginPage />)
    const user = userEvent.setup()

    await user.click(screen.getByRole('button', { name: /demo login/i }))

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith('demo@example.com', 'demo123')
    })
  })
})
```

**E2E Test (Playwright with AI agents):**

File: `/tests/e2e/auth.spec.ts`

```typescript
import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test('should allow demo login', async ({ page }) => {
    await page.goto('/')

    // Click demo login button
    await page.getByRole('button', { name: /demo login/i }).click()

    // Should redirect to dashboard
    await expect(page).toHaveURL(/.*dashboard/)

    // Should show user info
    await expect(page.getByText('Demo User')).toBeVisible()
  })

  test('should allow manual login', async ({ page }) => {
    await page.goto('/login')

    // Fill in credentials
    await page.getByLabel('Email').fill('demo@example.com')
    await page.getByLabel('Password').fill('demo123')

    // Submit
    await page.getByRole('button', { name: /sign in/i }).click()

    // Should redirect to dashboard
    await expect(page).toHaveURL(/.*dashboard/)
  })

  test('should handle invalid credentials', async ({ page }) => {
    await page.goto('/login')

    await page.getByLabel('Email').fill('invalid@example.com')
    await page.getByLabel('Password').fill('wrong')
    await page.getByRole('button', { name: /sign in/i }).click()

    // Should show error
    await expect(page.getByText(/invalid credentials/i)).toBeVisible()
  })

  test('should allow sign out', async ({ page }) => {
    // Login first
    await page.goto('/login')
    await page.getByRole('button', { name: /demo login/i }).click()
    await expect(page).toHaveURL(/.*dashboard/)

    // Sign out
    await page.getByRole('button', { name: /user menu/i }).click()
    await page.getByRole('menuitem', { name: /sign out/i }).click()

    // Should redirect to landing
    await expect(page).toHaveURL(/.*\/$/)
  })
})

// NEW: Use Playwright codegen for AI-assisted test creation
// Run: npx playwright codegen http://localhost:5173
```

**Benchmark Test (NEW in Vitest 4):**

File: `/src/lib/__tests__/rbac.bench.ts`

```typescript
import { bench, describe } from 'vitest'
import { hasPermission } from '../rbac'

describe('RBAC Performance', () => {
  bench('hasPermission with cache hit', async () => {
    await hasPermission('users.read')
  })

  bench('hasPermission with cache miss', async () => {
    await hasPermission(`users.read.${Math.random()}`)
  })
})

// Run: npm run test:bench
```

**Type Test (NEW in Vitest 4):**

File: `/src/types/__tests__/database.test-d.ts`

```typescript
import { assertType, expectTypeOf } from 'vitest'
import type { Database } from '../database.types'

type Profile = Database['public']['Tables']['profiles']['Row']

expectTypeOf<Profile>().toHaveProperty('id')
expectTypeOf<Profile>().toHaveProperty('display_name')
expectTypeOf<Profile['id']>().toBeString()
expectTypeOf<Profile['display_name']>().toEqualTypeOf<string | null>()

// Run: npm run typecheck
```

**42. Update package.json scripts**

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "typecheck": "tsc --noEmit",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",

    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:browser": "vitest --browser.enabled=true",
    "test:bench": "vitest bench",

    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:debug": "playwright test --debug",
    "test:e2e:codegen": "playwright codegen http://localhost:5173",
    "test:e2e:report": "playwright show-report",

    "prepare": "husky install"
  }
}
```

**43. Install Playwright browsers**

```bash
npx playwright install
npx playwright install-deps
```

**Coverage Target: 30%**
- ✅ Auth flows (login, signup, signout, password reset)
- ✅ RBAC (hasPermission, hasRole, hooks)
- ✅ Demo mode fallback
- ✅ Critical user paths (signup → onboarding → dashboard)
- ✅ Optimistic UI (rollback on error)
- ⏭️ Other components (optional, examples provided)

---

### Phase 8: CI/CD with GitHub Actions + End-of-Build Audit (15 min)

**NEW in V3:** End-of-build audit workflow

**Tasks:**

**44. Create CI workflow** (`.github/workflows/ci.yml`)

```yaml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint

  typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm run typecheck

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm run test:coverage
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info

  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

**45. Create deploy workflow** (`.github/workflows/deploy.yml`)

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

**46. Create Supabase types workflow** (`.github/workflows/types.yml`)

```yaml
name: Update Supabase Types

on:
  schedule:
    - cron: '0 0 * * 0' # Weekly on Sunday
  workflow_dispatch: # Manual trigger

jobs:
  update-types:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: npm install -g supabase
      - name: Generate types
        env:
          SUPABASE_ACCESS_TOKEN: ${{ secrets.SUPABASE_ACCESS_TOKEN }}
          SUPABASE_PROJECT_ID: ${{ secrets.SUPABASE_PROJECT_ID }}
        run: |
          npx supabase gen types typescript --project-id $SUPABASE_PROJECT_ID > src/types/database.types.ts
      - name: Create PR
        uses: peter-evans/create-pull-request@v5
        with:
          commit-message: 'chore: update Supabase types'
          title: 'chore: update Supabase types'
          body: 'Auto-generated PR to update Supabase database types'
          branch: 'update-supabase-types'
```

**47. NEW: Create audit workflow** (`.github/workflows/audit.yml`)

```yaml
name: End-of-Build Audit

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  schedule:
    - cron: '0 0 * * 1' # Weekly on Monday

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Security audit
        run: npm audit --audit-level=moderate

      - name: Check for outdated dependencies
        run: npm outdated || true

      - name: Run custom audit script
        run: ./scripts/audit.sh

      - name: Upload audit results
        uses: actions/upload-artifact@v3
        with:
          name: audit-results
          path: audit-results/
```

**48. Create audit script** (`/scripts/audit.sh`)

```bash
#!/bin/bash
set -e

echo "🔍 Running End-of-Build Audit..."
echo ""

mkdir -p audit-results

# 1. Security vulnerabilities
echo "1️⃣ Security Audit:"
npm audit --json > audit-results/security.json || true
VULNERABILITIES=$(cat audit-results/security.json | jq '.metadata.vulnerabilities.total')
echo "  Found $VULNERABILITIES vulnerabilities"

# 2. Outdated dependencies
echo ""
echo "2️⃣ Outdated Dependencies:"
npm outdated --json > audit-results/outdated.json || true
OUTDATED=$(cat audit-results/outdated.json | jq 'length')
echo "  Found $OUTDATED outdated packages"

# 3. Build size
echo ""
echo "3️⃣ Build Size:"
npm run build
du -sh dist > audit-results/build-size.txt
BUILD_SIZE=$(cat audit-results/build-size.txt | awk '{print $1}')
echo "  Bundle size: $BUILD_SIZE"

# 4. TypeScript errors
echo ""
echo "4️⃣ TypeScript Check:"
npm run typecheck 2>&1 | tee audit-results/typecheck.txt
echo "  ✅ TypeScript OK"

# 5. ESLint warnings
echo ""
echo "5️⃣ ESLint Check:"
npm run lint 2>&1 | tee audit-results/eslint.txt
WARNINGS=$(grep -c "warning" audit-results/eslint.txt || true)
echo "  Found $WARNINGS warnings"

# 6. Test coverage
echo ""
echo "6️⃣ Test Coverage:"
npm run test:coverage -- --reporter=json > audit-results/coverage.json || true
COVERAGE=$(cat audit-results/coverage.json | jq '.total.lines.pct')
echo "  Coverage: $COVERAGE%"

# 7. Bundle analysis
echo ""
echo "7️⃣ Bundle Analysis:"
npx vite-bundle-visualizer --json > audit-results/bundle.json
echo "  ✅ Bundle analyzed"

# 8. Lighthouse (requires running server)
# Uncomment if needed
# echo ""
# echo "8️⃣ Lighthouse Audit:"
# npm run dev &
# SERVER_PID=$!
# sleep 5
# npx lighthouse http://localhost:5173 --output=json --output-path=audit-results/lighthouse.json
# kill $SERVER_PID

echo ""
echo "✨ Audit Complete! Results saved to audit-results/"

# Summary
echo ""
echo "📊 Summary:"
echo "  Security Issues: $VULNERABILITIES"
echo "  Outdated Packages: $OUTDATED"
echo "  Build Size: $BUILD_SIZE"
echo "  ESLint Warnings: $WARNINGS"
echo "  Test Coverage: $COVERAGE%"

# Fail if critical issues found
if [ "$VULNERABILITIES" -gt 0 ]; then
  echo ""
  echo "❌ Critical security vulnerabilities found!"
  exit 1
fi

if (( $(echo "$COVERAGE < 30" | bc -l) )); then
  echo ""
  echo "⚠️  Warning: Test coverage below 30%"
fi

echo ""
echo "✅ Audit passed!"
```

```bash
chmod +x scripts/audit.sh
```

**49. Configure Vercel** (same as V2, but now via Vercel MCP)

Use Vercel MCP in Claude Desktop:
```
"Deploy this project to Vercel"
"Set environment variables for Vercel project"
"Show deployment logs"
```

---

### Phase 9: Modern Tooling - ESLint v9 + Husky + Prettier (20 min)

**NEW in V3:** ESLint v9 flat config + Husky pre-commit hooks

**Tasks:**

**50. Install ESLint v9 with flat config**

```bash
npm install -D eslint@latest @eslint/js typescript-eslint \
  eslint-plugin-react eslint-plugin-react-hooks \
  eslint-plugin-react-refresh eslint-config-prettier
```

**51. Create ESLint flat config**

File: `eslint.config.js` (NEW: flat config, not .eslintrc.cjs)

```javascript
import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import prettier from 'eslint-config-prettier'

export default tseslint.config(
  {
    ignores: ['dist/**', 'node_modules/**', 'coverage/**', 'playwright-report/**'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.json', './tsconfig.node.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
      'react/react-in-jsx-scope': 'off', // Not needed with React 18
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  prettier // Disable conflicting rules
)
```

**52. Install Prettier**

```bash
npm install -D prettier
```

File: `.prettierrc`

```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "useTabs": false,
  "printWidth": 100,
  "trailingComma": "es5"
}
```

File: `.prettierignore`

```
node_modules
dist
coverage
playwright-report
.next
.vercel
```

**53. Install Husky for pre-commit hooks**

```bash
npm install -D husky lint-staged
npx husky install
```

**54. Configure Husky hooks**

```bash
npx husky add .husky/pre-commit "npx lint-staged"
```

File: `.lintstagedrc.json`

```json
{
  "*.{ts,tsx}": [
    "eslint --fix",
    "prettier --write"
  ],
  "*.{json,md}": [
    "prettier --write"
  ]
}
```

**55. Add prepare script to package.json**

```json
{
  "scripts": {
    "prepare": "husky install"
  }
}
```

**Benefits:**
- ✅ **ESLint v9**: Faster, better performance
- ✅ **Flat config**: Simpler configuration
- ✅ **Husky**: Automatic quality gates on commit
- ✅ **lint-staged**: Only lint changed files (faster)
- ✅ **Prettier**: Consistent code formatting
- ⚠️ **Optional disable**: `HUSKY=0 git commit` to skip hooks if needed

---

### Phase 10: Documentation as Code + SSOT Enforcement (15 min)

**NEW in V3:** CLAUDE.md in root + SSOT enforcement process

**Tasks:**

**56. Create documentation structure** (same as V2)

**57. Create CLAUDE.md in root** (NEW: Root location)

File: `/CLAUDE.md`

```markdown
# AI Assistant Context - BYO SaaS Boilerplate

**Last Updated:** 2025-01-07
**Project:** Modern SaaS Boilerplate
**Tech Stack:** Vite + React 18 + TypeScript + Vitest 4 + Playwright + Supabase + ShadCN

---

## Quick Context

This is a **production-ready SaaS boilerplate** with:
- ✅ Zero-config demo mode (works immediately)
- ✅ Full MCP ecosystem (5 MCPs: GitHub, Vercel, Supabase, ShadCN, Playwright)
- ✅ AI-native workflow (spec → implement → test)
- ✅ 30% test coverage target (critical paths)
- ✅ Modern tooling (ESLint v9, Vitest 4, Playwright agents)
- ✅ Graceful degradation (never crashes)

---

## Key Decisions

### Architecture
- **Feature-based organization** (`/src/features/`) not file-type
- **Database-level security** (RLS) not API middleware
- **Graceful degradation** - auto-fallback to demo mode when services missing
- **Mock all externals** - Supabase, Stripe, etc. for zero-config testing

### Development
- **TDD-ready** not TDD-enforced (30% coverage target)
- **Spec-driven** - Human writes spec, AI implements
- **Human review gates** - Auth, payments, business logic
- **Pre-commit hooks** - Quality gates via Husky

### Testing
- **30% coverage target** - Critical paths only
- **Vitest 4** - Browser mode, benchmarks, type testing
- **Playwright + Agents** - AI-assisted E2E with self-healing selectors
- **Test critical only** - Auth, RBAC, payments, public APIs

---

## Where to Find Things

### Code
- **Features:** `/src/features/[name]/` - Self-contained feature modules
- **Components:** `/src/components/ui/` - ShadCN components
- **Utils:** `/src/lib/` - Utilities (supabase, rbac, logger, etc.)
- **Types:** `/src/types/` - TypeScript types
- **Tests:** `/src/**/__tests__/` (unit) + `/tests/e2e/` (E2E)

### Documentation
- **Implementation Plan:** `/docs/implementation-plan_v3-ready-to-run/ready-to-run-v3.md`
- **Architecture:** `/docs/documentation/architecture.md`
- **Setup:** `/docs/documentation/setup.md`
- **MCPs:** `/docs/documentation/mcp-setup.md`
- **Specs:** `/docs/specs/*.md`
- **Tasks:** `/docs/tasks/[active|complete|draft|template]/`

### Root Files (ONLY These)
- `CLAUDE.md` - This file (AI context)
- `README.md` - User-facing quick start
- `LICENSE` - License
- `DEPLOYMENT.md` - Deployment guide
- `CONTRIBUTING.md` - Contribution guidelines (future)

**Everything else:** `/docs/documentation/`

---

## Common Tasks

### Add New Feature
1. Write spec: `/docs/specs/[feature].md`
2. Create task: `/docs/tasks/draft/[feature].md`
3. Move to active: `/docs/tasks/active/[feature].md`
4. Implement in `/src/features/[feature]/`
5. Write tests (30% coverage for critical)
6. Update docs (SSOT - check existing first!)
7. Commit with conventional commit
8. Move to complete: `/docs/tasks/complete/[feature].md`

### Add Component
Use ShadCN MCP:
```
"What ShadCN components are available?"
"Install the [component] component"
```

### Add Test
- **Unit:** `/src/[path]/__tests__/[file].test.ts`
- **E2E:** `/tests/e2e/[feature].spec.ts`
- Use Playwright MCP: "Generate test for [feature]"

### Update Database
1. Create migration: `/supabase/migrations/[timestamp]_[name].sql`
2. Run migration: `npx supabase db push`
3. Regenerate types: `npx supabase gen types typescript --local > src/types/database.types.ts`
4. Update mock: `/src/lib/supabase-mock.ts`

### Deploy
Use Vercel MCP:
```
"Deploy to Vercel"
"Check deployment status"
"View deployment logs"
```

---

## Never Do This

❌ **Don't** create new doc if updating existing would work (SSOT!)
❌ **Don't** put docs in root (only 5 allowed files)
❌ **Don't** skip human review for auth/payments/security
❌ **Don't** let AI make architectural decisions alone
❌ **Don't** commit without running tests
❌ **Don't** use `any` type in TypeScript
❌ **Don't** crash on missing config (graceful degradation!)
❌ **Don't** skip pre-commit hooks (unless HUSKY=0)

---

## Always Do This

✅ **Do** check if ShadCN has the component before building custom
✅ **Do** check if Supabase provides the feature built-in
✅ **Do** update SSOT documentation, never duplicate
✅ **Do** write tests for critical paths (auth, RBAC, payments)
✅ **Do** use conventional commits (feat:, fix:, docs:, refactor:, test:)
✅ **Do** follow DRY principle (leverage existing solutions)
✅ **Do** apply graceful degradation for external dependencies
✅ **Do** verify MCPs are working before starting

---

## MCPs Available

1. **GitHub MCP** - PRs, issues, code review
2. **Vercel MCP** - Deployment, logs, env vars
3. **Supabase MCP** - Database operations, migrations
4. **ShadCN MCP** - Component discovery and installation
5. **Playwright MCP** - Test generation, self-healing selectors

**Verify:** Type `/mcp list` in Claude Desktop

---

## Tech Stack Details

### Core
- **Vite** - Build tool (fast, modern)
- **React 18** - UI framework
- **TypeScript** - Type safety (strict mode)
- **TailwindCSS v4** - Styling (oxide engine, 5x faster)
- **ShadCN UI** - Component library

### Backend
- **Supabase** - Database, auth, realtime
- **PostgreSQL** - Database (via Supabase)
- **RLS** - Row Level Security (database-level)

### Testing
- **Vitest 4** - Unit tests (browser mode, benchmarks, type testing)
- **Playwright** - E2E tests (with AI agents)
- **Testing Library** - React component testing

### Tooling
- **ESLint v9** - Linting (flat config)
- **Prettier** - Formatting
- **Husky** - Pre-commit hooks
- **pnpm** - Package manager (fast, efficient)

### CI/CD
- **GitHub Actions** - CI/CD workflows
- **Vercel** - Deployment platform
- **Codecov** - Coverage reporting

---

## Patterns to Follow

### Graceful Degradation
```typescript
// For any external dependency:
const isAvailable = checkCredentials()
if (!isAvailable) {
  console.warn('⚠️  Falling back to mock')
  return mockImplementation
}
return realImplementation
```

### Permission Checking
```tsx
// In components
{hasPermission('users.write') && <EditButton />}
{hasRole('Admin') && <AdminSection />}
```

### Optimistic UI
```typescript
const { mutate } = useOptimisticUpdate({
  mutationFn: async (data) => { /* ... */ },
  onMutate: (data) => {
    // Update UI immediately
    const previous = state
    setState(data)
    return { previous }
  },
  onError: (_err, _vars, context) => {
    // Rollback on error
    setState(context.previous)
  },
})
```

### Test Structure
```typescript
describe('Feature', () => {
  it('should handle success case', () => { /* ... */ })
  it('should handle error case', () => { /* ... */ })
  it('should handle edge case', () => { /* ... */ })
})
```

---

## Questions? Check These First

- **How do I...?** → `/docs/documentation/`
- **What's the architecture?** → `/docs/documentation/architecture.md`
- **How to set up?** → `/docs/documentation/setup.md`
- **What MCPs?** → `/docs/documentation/mcp-setup.md`
- **Test strategy?** → `/docs/documentation/testing.md`
- **Deploy where?** → `/DEPLOYMENT.md`

---

**Remember:** This file is SSOT for AI context. Update it when major decisions change.
```

**58. Create SSOT enforcement checklist**

File: `/docs/documentation/ssot-checklist.md`

```markdown
# Single Source of Truth (SSOT) Enforcement Checklist

Before creating ANY new documentation:

## 1. Does This Already Exist?
- [ ] Search `/docs/documentation/` for related content
- [ ] Check if this updates an existing file
- [ ] Look for similar information in other docs

## 2. Is This the Right Place?
- [ ] Root folder? (ONLY README, LICENSE, DEPLOYMENT, CLAUDE, CONTRIBUTING)
- [ ] Architecture? → `/docs/documentation/architecture.md`
- [ ] Setup? → `/docs/documentation/setup.md`
- [ ] Feature spec? → `/docs/specs/[feature].md`
- [ ] Task? → `/docs/tasks/[status]/[name].md`
- [ ] Session notes? → `/docs/implementation-plan_v[x]-and-updates-notes/`

## 3. Will This Create Duplication?
- [ ] Is this information already elsewhere?
- [ ] Can I link to existing doc instead?
- [ ] Will updating existing doc be clearer?

## 4. Update vs Create
- [ ] **UPDATE** existing if information overlaps >50%
- [ ] **CREATE** new only if wholly different topic
- [ ] **LINK** to existing SSOT, don't copy

## 5. Cross-References
- [ ] Link to related docs
- [ ] Update related docs to link back
- [ ] Maintain bidirectional references

## 6. Maintenance Plan
- [ ] Who updates this? (AI? Human? Both?)
- [ ] When does it need updating? (On code change? Weekly?)
- [ ] Is this likely to become stale?

## Decision Tree

```
Need to document something?
├─ Does it exist?
│  ├─ Yes → UPDATE existing (don't create new)
│  └─ No → Continue
├─ Where does it belong?
│  ├─ Root → ONLY 5 allowed files
│  ├─ /docs/documentation/ → Most docs
│  ├─ /docs/specs/ → Feature specifications
│  └─ /docs/tasks/ → Task management
├─ Will it duplicate?
│  ├─ Yes → LINK to SSOT instead
│  └─ No → CREATE new file
└─ Create + cross-reference
```

## Examples

### ❌ Bad: Duplication
```
/docs/auth.md (explains auth flow)
/docs/setup.md (also explains auth flow)
/README.md (also explains auth flow)
```

### ✅ Good: SSOT
```
/docs/documentation/auth.md (SSOT for auth flow)
/docs/documentation/setup.md (links to auth.md)
/README.md (links to auth.md for details)
```

### ❌ Bad: Root Clutter
```
/AUTH.md
/RBAC.md
/TESTING.md
/DATABASE.md
```

### ✅ Good: Organized
```
/CLAUDE.md (AI context)
/README.md (User quick start)
/DEPLOYMENT.md (Deployment)
/docs/documentation/auth.md
/docs/documentation/rbac.md
/docs/documentation/testing.md
```
```

**59. Create task templates**

Import from ChemJungle project (action item)

File: `/docs/tasks/template/feature-template.md`

```markdown
# [Feature Name]

**Status:** Draft
**Priority:** [High/Medium/Low]
**Estimated Time:** [X hours]
**Assigned To:** [Human/AI/Both]

---

## Spec Reference
Link to `/docs/specs/[feature].md`

---

## What
[1-2 sentence description of what this feature does]

---

## Why
**User Need:** [What problem does this solve?]
**Business Value:** [Why is this important?]

---

## How

### Technical Approach
- [ ] Step 1
- [ ] Step 2
- [ ] Step 3

### Files to Create/Modify
- [ ] `/src/features/[name]/` - New feature module
- [ ] `/src/components/ui/` - Components
- [ ] `/docs/documentation/` - Documentation

### Dependencies
- [ ] Dependency 1 (must exist first)
- [ ] Dependency 2

---

## Success Criteria
- [ ] Feature works as specified
- [ ] Tests pass (30% coverage for critical)
- [ ] Documentation updated
- [ ] Code reviewed (if security-critical)
- [ ] Deployed to staging

---

## Testing Plan
- [ ] Unit tests: [describe]
- [ ] E2E tests: [describe]
- [ ] Manual testing: [describe]

---

## Rollback Plan
If deployment fails:
1. [Step 1]
2. [Step 2]

---

## Notes
[Any additional context, links, discussions]
```

---

### Phase 11: Demo Mode + Graceful Degradation (Same as V2, 15 min)

Same as V2 Phase 11 - DemoModeBanner, graceful degradation, deployment docs.

---

### Phase 12: Onboarding System (NEW - 25 min)

**Purpose:** Guide new users through first-time experience based on role.

**Tasks:**

**60. Create onboarding database schema** (already in Phase 3 migration)

**61. Create onboarding utilities**

File: `/src/features/onboarding/lib/onboarding.ts`

```typescript
import { supabase } from '@/lib/supabase'

export async function isFirstLogin(userId: string): Promise<boolean> {
  const { data } = await supabase
    .from('profiles')
    .select('created_at, last_login_at')
    .eq('id', userId)
    .single()

  return !data?.last_login_at
}

export async function getOnboardingStatus(userId: string) {
  const { data } = await supabase
    .from('user_onboarding')
    .select('*')
    .eq('user_id', userId)
    .single()

  return data
}

export async function updateOnboardingStep(userId: string, step: string, completed: boolean) {
  const { error } = await supabase
    .from('user_onboarding')
    .update({ [step]: completed, updated_at: new Date().toISOString() })
    .eq('user_id', userId)

  if (error) throw error
}

export async function completeOnboarding(userId: string) {
  const { error } = await supabase
    .from('user_onboarding')
    .update({
      profile_completed: true,
      first_action_completed: true,
      tutorial_viewed: true,
      completed_at: new Date().toISOString(),
    })
    .eq('user_id', userId)

  if (error) throw error
}
```

**62. Create onboarding checklist component**

File: `/src/features/onboarding/components/onboarding-checklist.tsx`

```typescript
import { useState, useEffect } from 'react'
import { useAuth } from '@/features/auth/context/auth-context'
import { getOnboardingStatus, updateOnboardingStep } from '../lib/onboarding'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'

interface ChecklistItem {
  id: string
  title: string
  description: string
  action?: () => void
}

interface OnboardingChecklistProps {
  items: ChecklistItem[]
  onComplete?: () => void
}

export function OnboardingChecklist({ items, onComplete }: OnboardingChecklistProps) {
  const { user } = useAuth()
  const [completed, setCompleted] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return

    getOnboardingStatus(user.id).then((status) => {
      const completedItems = new Set<string>()
      if (status?.profile_completed) completedItems.add('profile')
      if (status?.first_action_completed) completedItems.add('action')
      if (status?.tutorial_viewed) completedItems.add('tutorial')
      setCompleted(completedItems)
      setLoading(false)
    })
  }, [user])

  const handleToggle = async (itemId: string) => {
    if (!user) return

    const newCompleted = new Set(completed)
    if (newCompleted.has(itemId)) {
      newCompleted.delete(itemId)
    } else {
      newCompleted.add(itemId)
    }
    setCompleted(newCompleted)

    // Update backend
    await updateOnboardingStep(user.id, `${itemId}_completed`, newCompleted.has(itemId))

    // Check if all completed
    if (newCompleted.size === items.length && onComplete) {
      onComplete()
    }
  }

  const progress = (completed.size / items.length) * 100

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Getting Started</CardTitle>
        <CardDescription>
          Complete these steps to get the most out of your account
        </CardDescription>
        <Progress value={progress} className="mt-2" />
        <p className="text-sm text-muted-foreground mt-2">
          {completed.size} of {items.length} completed
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="flex items-start space-x-3">
            <Checkbox
              id={item.id}
              checked={completed.has(item.id)}
              onCheckedChange={() => handleToggle(item.id)}
            />
            <div className="flex-1">
              <label
                htmlFor={item.id}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {item.title}
              </label>
              <p className="text-sm text-muted-foreground">{item.description}</p>
              {item.action && !completed.has(item.id) && (
                <Button variant="link" size="sm" className="h-auto p-0 mt-1" onClick={item.action}>
                  Do this now →
                </Button>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
```

**63. Add onboarding to dashboard**

File: `/src/features/dashboard/dashboard-page.tsx` (add to existing)

```typescript
import { OnboardingChecklist } from '@/features/onboarding/components/onboarding-checklist'
import { useAuth } from '@/features/auth/context/auth-context'
import { isFirstLogin } from '@/features/onboarding/lib/onboarding'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

export function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [showOnboarding, setShowOnboarding] = useState(false)

  useEffect(() => {
    if (!user) return
    isFirstLogin(user.id).then(setShowOnboarding)
  }, [user])

  const onboardingItems = [
    {
      id: 'profile',
      title: 'Complete your profile',
      description: 'Add your name and avatar',
      action: () => navigate('/account'),
    },
    {
      id: 'tutorial',
      title: 'Take the tour',
      description: 'Learn about key features (5 min)',
      action: () => {
        /* Start tour */
      },
    },
    {
      id: 'action',
      title: 'Create your first item',
      description: 'Get started with the platform',
      action: () => {
        /* Navigate to create */
      },
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1>Dashboard</h1>

        {showOnboarding && (
          <OnboardingChecklist
            items={onboardingItems}
            onComplete={() => setShowOnboarding(false)}
          />
        )}

        {/* Rest of dashboard */}
      </div>
    </DashboardLayout>
  )
}
```

**64. Optional: Add interactive tour**

```bash
npm install react-joyride
```

File: `/src/features/onboarding/components/product-tour.tsx`

```typescript
import Joyride, { Step } from 'react-joyride'

const steps: Step[] = [
  {
    target: '[data-tour="dashboard"]',
    content: 'This is your dashboard where you can see an overview of everything',
  },
  {
    target: '[data-tour="sidebar"]',
    content: 'Use the sidebar to navigate between different sections',
  },
  {
    target: '[data-tour="user-menu"]',
    content: 'Access your account settings and sign out from here',
  },
]

export function ProductTour({ run, onFinish }: { run: boolean; onFinish: () => void }) {
  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showSkipButton
      callback={(data) => {
        if (data.status === 'finished' || data.status === 'skipped') {
          onFinish()
        }
      }}
      styles={{
        options: {
          primaryColor: 'hsl(var(--primary))',
        },
      }}
    />
  )
}
```

---

### Phase 13: Admin Dashboard (NEW - 30 min)

**Purpose:** System administration interface for platform admins to manage users, monitor activity, and control system settings.

**Prerequisites:**
- Phase 5 (RBAC) completed
- Platform admin role configured

**Tasks:**

**65. Create admin dashboard route**

File: `/src/features/admin/pages/admin-dashboard.tsx`

```typescript
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/context/auth-context'
import { useEffect, useState } from 'react'
import { isPlatformAdmin } from '@/lib/platform-roles'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DemoModeToggle } from '../components/demo-mode-toggle'
import { UserManagementTable } from '../components/user-management-table'
import { ActivityLog } from '../components/activity-log'
import { PlatformStats } from '../components/platform-stats'

export function AdminDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }

    isPlatformAdmin(user.id).then((admin) => {
      setIsAdmin(admin)
      setLoading(false)
      if (!admin) {
        navigate('/dashboard')
      }
    })
  }, [user, navigate])

  if (loading) return <div>Loading...</div>
  if (!isAdmin) return null

  return (
    <div className="container py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Platform Administration</h1>
        <DemoModeToggle />
      </div>

      <PlatformStats />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
          </CardHeader>
          <CardContent>
            <UserManagementTable />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ActivityLog />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
```

**66. Create demo mode toggle component**

File: `/src/features/admin/components/demo-mode-toggle.tsx`

```typescript
import { useState, useEffect } from 'react'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/features/auth/context/auth-context'

export function DemoModeToggle() {
  const { user } = useAuth()
  const [demoMode, setDemoMode] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get current demo mode status from system settings
    supabase
      .from('system_settings')
      .select('value')
      .eq('key', 'demo_mode')
      .single()
      .then(({ data }) => {
        setDemoMode(data?.value === 'true')
        setLoading(false)
      })
  }, [])

  const toggleDemoMode = async (enabled: boolean) => {
    setDemoMode(enabled)

    // Update system setting
    await supabase
      .from('system_settings')
      .upsert({
        key: 'demo_mode',
        value: String(enabled),
        updated_by: user?.id,
        updated_at: new Date().toISOString()
      })
  }

  if (loading) return null

  return (
    <div className="flex items-center space-x-2">
      <Switch
        id="demo-mode"
        checked={demoMode}
        onCheckedChange={toggleDemoMode}
      />
      <Label htmlFor="demo-mode">
        Demo Mode {demoMode ? '(Active)' : '(Inactive)'}
      </Label>
    </div>
  )
}
```

**67. Create user management table**

File: `/src/features/admin/components/user-management-table.tsx`

```typescript
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface User {
  id: string
  email: string
  display_name: string
  roles: string[]
  created_at: string
}

export function UserManagementTable() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    const { data } = await supabase
      .from('profiles')
      .select(`
        id,
        display_name,
        auth_users:id (email, created_at),
        user_roles (
          roles (name)
        )
      `)
      .limit(50)

    const formatted = data?.map((u: any) => ({
      id: u.id,
      email: u.auth_users?.email || '',
      display_name: u.display_name || 'Unknown',
      roles: u.user_roles?.map((ur: any) => ur.roles.name) || [],
      created_at: u.auth_users?.created_at || '',
    })) || []

    setUsers(formatted)
    setLoading(false)
  }

  if (loading) return <div>Loading users...</div>

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Roles</TableHead>
          <TableHead>Joined</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell className="font-medium">{user.display_name}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>
              <div className="flex gap-1">
                {user.roles.map((role) => (
                  <Badge key={role} variant="secondary">
                    {role}
                  </Badge>
                ))}
              </div>
            </TableCell>
            <TableCell>
              {new Date(user.created_at).toLocaleDateString()}
            </TableCell>
            <TableCell>
              <Button variant="ghost" size="sm">
                View
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
```

**68. Create platform stats component**

File: `/src/features/admin/components/platform-stats.tsx`

```typescript
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function PlatformStats() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalOrganizations: 0,
    totalRevenue: 0,
  })

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    // Get total users
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })

    // Get active users (logged in last 7 days)
    const { count: activeUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gte('last_login_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

    setStats({
      totalUsers: totalUsers || 0,
      activeUsers: activeUsers || 0,
      totalOrganizations: 0, // Will be populated in Phase 14
      totalRevenue: 0, // Future: integrate with billing
    })
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalUsers}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Active Users (7d)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.activeUsers}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Organizations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalOrganizations}</div>
          <p className="text-xs text-muted-foreground">Phase 14</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            MRR
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${stats.totalRevenue}</div>
          <p className="text-xs text-muted-foreground">Future</p>
        </CardContent>
      </Card>
    </div>
  )
}
```

**69. Add admin route protection**

File: `/src/features/admin/lib/admin-guard.tsx`

```typescript
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/context/auth-context'
import { useState, useEffect } from 'react'
import { isPlatformAdmin } from '@/lib/platform-roles'

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)

  useEffect(() => {
    if (!user) {
      setIsAdmin(false)
      return
    }

    isPlatformAdmin(user.id).then(setIsAdmin)
  }, [user])

  if (isAdmin === null) return <div>Loading...</div>
  if (!isAdmin) return <Navigate to="/dashboard" replace />

  return <>{children}</>
}
```

**70. Add admin routes to router**

File: `/src/App.tsx` (update routes)

```typescript
import { AdminGuard } from '@/features/admin/lib/admin-guard'
import { AdminDashboard } from '@/features/admin/pages/admin-dashboard'

// Add to routes:
<Route
  path="/admin"
  element={
    <AdminGuard>
      <AdminDashboard />
    </AdminGuard>
  }
/>
```

---

### Phase 14: Multi-Tenant Organizations (NEW - 45 min)

**Purpose:** Enable B2B2C model where tutors create workspaces and invite students.

**Use Case:** Tutoring platform - tutors sign up, create workspaces, invite students

**Architecture:** Row-Level Multi-Tenancy (Type 1) + Single-Instance Deployment

**Prerequisites:**
- Phase 3 (Database) completed
- Phase 5 (RBAC) completed

**Tasks:**

**71. Create organizations migration**

File: `/supabase/migrations/20250108000000_organizations.sql`

```sql
-- Organizations (Tutor Workspaces)
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  avatar_url TEXT,
  tutor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'premium')),
  max_students INTEGER DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Organization Members (Students + Assistants)
CREATE TABLE IF NOT EXISTS organization_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('tutor', 'assistant', 'student')),
  invited_by UUID REFERENCES auth.users(id),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB,
  UNIQUE(organization_id, user_id)
);

-- Invitations
CREATE TABLE IF NOT EXISTS invitations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('assistant', 'student')),
  token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  invited_by UUID REFERENCES auth.users(id),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW() + INTERVAL '7 days',
  accepted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB
);

-- Organization Settings
CREATE TABLE IF NOT EXISTS organization_settings (
  organization_id UUID PRIMARY KEY REFERENCES organizations(id) ON DELETE CASCADE,
  allow_student_invites BOOLEAN DEFAULT false,
  require_approval BOOLEAN DEFAULT false,
  timezone TEXT DEFAULT 'UTC',
  locale TEXT DEFAULT 'en',
  branding JSONB,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- System Roles (Platform Admin/Dev/Support)
CREATE TABLE IF NOT EXISTS system_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('platform_admin', 'platform_dev', 'platform_support')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Enable RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_roles ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Organizations
CREATE POLICY "Platform admins see all organizations"
ON organizations FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM system_roles
    WHERE user_id = auth.uid()
    AND role = 'platform_admin'
  )
  OR tutor_id = auth.uid()
);

CREATE POLICY "Members can view their organizations"
ON organizations FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM organization_members
    WHERE organization_id = organizations.id
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Tutors can manage their organizations"
ON organizations FOR ALL
USING (tutor_id = auth.uid());

-- RLS Policies: Organization Members
CREATE POLICY "Platform admins see all members"
ON organization_members FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM system_roles
    WHERE user_id = auth.uid()
    AND role IN ('platform_admin', 'platform_support')
  )
);

CREATE POLICY "Tutors can manage members in their org"
ON organization_members FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM organizations
    WHERE id = organization_members.organization_id
    AND tutor_id = auth.uid()
  )
);

CREATE POLICY "Members can view other members in same org"
ON organization_members FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM organization_members om
    WHERE om.organization_id = organization_members.organization_id
    AND om.user_id = auth.uid()
  )
);

-- RLS Policies: Invitations
CREATE POLICY "Tutors can manage invitations for their org"
ON invitations FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM organizations
    WHERE id = invitations.organization_id
    AND tutor_id = auth.uid()
  )
);

CREATE POLICY "Anyone can view invitation by token"
ON invitations FOR SELECT
USING (token IS NOT NULL);

-- RLS Policies: System Roles
CREATE POLICY "Users can view their own system roles"
ON system_roles FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Platform admins can manage system roles"
ON system_roles FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM system_roles
    WHERE user_id = auth.uid()
    AND role = 'platform_admin'
  )
);

-- Auto-create organization on tutor signup
CREATE OR REPLACE FUNCTION public.handle_tutor_signup()
RETURNS TRIGGER AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Get user's role from metadata
  user_role := NEW.raw_user_meta_data->>'role';

  -- If tutor, create organization
  IF user_role = 'tutor' THEN
    INSERT INTO public.organizations (name, slug, tutor_id)
    VALUES (
      COALESCE(NEW.raw_user_meta_data->>'organization_name', split_part(NEW.email, '@', 1) || '''s Workspace'),
      NEW.id::text,
      NEW.id
    );

    -- Add tutor as organization member
    INSERT INTO public.organization_members (organization_id, user_id, role, invited_by)
    SELECT id, NEW.id, 'tutor', NEW.id
    FROM public.organizations
    WHERE tutor_id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for auto-creating organization
DROP TRIGGER IF EXISTS on_tutor_signup ON auth.users;
CREATE TRIGGER on_tutor_signup
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_tutor_signup();

-- Update updated_at trigger for organizations
DROP TRIGGER IF EXISTS on_organization_updated ON organizations;
CREATE TRIGGER on_organization_updated
  BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
```

**72. Create invitation utilities**

File: `/src/features/organizations/lib/invitations.ts`

```typescript
import { supabase } from '@/lib/supabase'

export async function createInvitation(
  organizationId: string,
  email: string,
  role: 'student' | 'assistant',
  metadata?: Record<string, any>
) {
  const { data: user } = await supabase.auth.getUser()

  const { data, error } = await supabase
    .from('invitations')
    .insert({
      organization_id: organizationId,
      email,
      role,
      invited_by: user?.user?.id,
      metadata,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getInvitation(token: string) {
  const { data, error } = await supabase
    .from('invitations')
    .select('*, organizations(*)')
    .eq('token', token)
    .is('accepted_at', null)
    .gte('expires_at', new Date().toISOString())
    .single()

  if (error) throw error
  return data
}

export async function acceptInvitation(token: string, userId: string) {
  // Get invitation
  const invitation = await getInvitation(token)

  // Add user to organization
  const { error: memberError } = await supabase
    .from('organization_members')
    .insert({
      organization_id: invitation.organization_id,
      user_id: userId,
      role: invitation.role,
      invited_by: invitation.invited_by,
    })

  if (memberError) throw memberError

  // Mark invitation accepted
  const { error: inviteError } = await supabase
    .from('invitations')
    .update({ accepted_at: new Date().toISOString() })
    .eq('token', token)

  if (inviteError) throw inviteError

  return invitation
}
```

**73. Create invite student modal**

File: `/src/features/organizations/components/invite-student-modal.tsx`

```typescript
import { useState } from 'react'
import { createInvitation } from '../lib/invitations'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'

export function InviteStudentModal({ organizationId }: { organizationId: string }) {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleInvite = async () => {
    setLoading(true)
    try {
      const invitation = await createInvitation(organizationId, email, 'student')

      // In production, send email here
      const inviteUrl = `${window.location.origin}/accept-invite?token=${invitation.token}`

      toast({
        title: 'Invitation sent!',
        description: `Invitation link: ${inviteUrl}`,
      })

      setEmail('')
      setOpen(false)
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Invite Student</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite Student</DialogTitle>
          <DialogDescription>
            Send an invitation to a student to join your workspace
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="student@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <Button onClick={handleInvite} disabled={loading || !email}>
            {loading ? 'Sending...' : 'Send Invitation'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
```

**74. Create accept invitation page**

File: `/src/features/organizations/pages/accept-invite.tsx`

```typescript
import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getInvitation, acceptInvitation } from '../lib/invitations'
import { useAuth } from '@/features/auth/context/auth-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export function AcceptInvitePage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const { user } = useAuth()
  const navigate = useNavigate()
  const [invitation, setInvitation] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!token) {
      setError('Invalid invitation link')
      setLoading(false)
      return
    }

    getInvitation(token)
      .then(setInvitation)
      .catch(() => setError('Invitation not found or expired'))
      .finally(() => setLoading(false))
  }, [token])

  const handleAccept = async () => {
    if (!user || !token) return

    try {
      await acceptInvitation(token, user.id)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    }
  }

  if (loading) return <div>Loading invitation...</div>
  if (error) return <div className="text-red-500">{error}</div>
  if (!invitation) return <div>Invitation not found</div>

  return (
    <div className="container max-w-md py-12">
      <Card>
        <CardHeader>
          <CardTitle>You've been invited!</CardTitle>
          <CardDescription>
            {invitation.organizations.name} has invited you to join as a{' '}
            {invitation.role}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!user ? (
            <div>
              <p className="mb-4">Please sign up or log in to accept this invitation</p>
              <div className="space-y-2">
                <Button onClick={() => navigate('/signup')} className="w-full">
                  Sign Up
                </Button>
                <Button
                  onClick={() => navigate('/login')}
                  variant="outline"
                  className="w-full"
                >
                  Log In
                </Button>
              </div>
            </div>
          ) : (
            <Button onClick={handleAccept} className="w-full">
              Accept Invitation
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
```

**75. Create organization context provider**

File: `/src/features/organizations/context/organization-context.tsx`

```typescript
import { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from '@/features/auth/context/auth-context'
import { supabase } from '@/lib/supabase'

interface Organization {
  id: string
  name: string
  slug: string
  role: string
}

interface OrganizationContextType {
  currentOrganization: Organization | null
  organizations: Organization[]
  switchOrganization: (orgId: string) => void
  loading: boolean
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined)

export function OrganizationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null)
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setOrganizations([])
      setCurrentOrganization(null)
      setLoading(false)
      return
    }

    loadOrganizations()
  }, [user])

  const loadOrganizations = async () => {
    const { data } = await supabase
      .from('organization_members')
      .select('organization_id, role, organizations(id, name, slug)')
      .eq('user_id', user!.id)

    const orgs = data?.map((om: any) => ({
      id: om.organizations.id,
      name: om.organizations.name,
      slug: om.organizations.slug,
      role: om.role,
    })) || []

    setOrganizations(orgs)

    // Set current to first org
    if (orgs.length > 0) {
      setCurrentOrganization(orgs[0])
    }

    setLoading(false)
  }

  const switchOrganization = (orgId: string) => {
    const org = organizations.find(o => o.id === orgId)
    if (org) {
      setCurrentOrganization(org)
    }
  }

  return (
    <OrganizationContext.Provider
      value={{ currentOrganization, organizations, switchOrganization, loading }}
    >
      {children}
    </OrganizationContext.Provider>
  )
}

export function useOrganization() {
  const context = useContext(OrganizationContext)
  if (!context) {
    throw new Error('useOrganization must be used within OrganizationProvider')
  }
  return context
}
```

**76. Add organization routes**

File: `/src/App.tsx` (update)

```typescript
import { AcceptInvitePage } from '@/features/organizations/pages/accept-invite'

// Add route:
<Route path="/accept-invite" element={<AcceptInvitePage />} />
```

---

## Summary of V3 Changes

### Phase 0 (NEW)
- 5 MCP setup (GitHub, Vercel, Supabase, ShadCN, Playwright)
- Automated authentication script
- Verification checklist

### Phase 2
- TailwindCSS v4 (oxide engine)
- ShadCN MCP now **mandatory**

### Phase 3
- Docker compose option
- Onboarding table in schema

### Phase 6
- Optimistic UI **integrated** (not just file)

### Phase 7
- Vitest 4.0 **full features** (browser mode, benchmarks, type testing, sharding)
- Playwright **agents** + MCP
- 30% coverage target (up from 5%)

### Phase 8
- End-of-build **audit workflow**
- Audit script

### Phase 9 (NEW)
- ESLint v9 **flat config**
- **Husky** pre-commit hooks
- **lint-staged** for fast checks

### Phase 10
- CLAUDE.md in **root** (not /docs/)
- **SSOT enforcement** checklist

### Phase 12 (NEW)
- **Onboarding system**
- Role-based flows
- Interactive tour

### Phase 13 (NEW)
- **Admin Dashboard**
- Platform admin interface
- User management table
- Demo mode toggle
- Platform stats
- Admin route protection

### Phase 14 (NEW)
- **Multi-Tenant Organizations**
- Row-level tenancy (Type 1)
- Organizations table
- Invitation system
- Organization members
- Platform vs organization roles separation
- Complete RLS policies
- Auto-create workspace on tutor signup

---

## Quick Start

### Option 1: Full MCP Setup (Recommended)
```bash
# 1. Clone
git clone <repo-url>
cd byo

# 2. Setup MCPs
./scripts/setup-mcps.sh
# Restart Claude Desktop

# 3. Verify
./scripts/verify-mcp-auth.sh

# 4. Install & Dev
npm install
cp .env.demo .env.local
npm run dev

# Visit http://localhost:5173
# Click "Demo Login"
```

### Option 2: Quick Demo (No MCP)
```bash
git clone <repo-url>
cd byo
npm install
cp .env.demo .env.local
npm run dev
```

---

## Resources

**Official Docs:**
- Vite: https://vitejs.dev/
- Vitest: https://vitest.dev/
- Playwright: https://playwright.dev/
- Supabase: https://supabase.com/docs
- ShadCN: https://ui.shadcn.com/
- TailwindCSS v4: https://tailwindcss.com/

**AI Integration:**
- Claude Desktop: https://claude.ai/download
- MCP Docs: https://modelcontextprotocol.io/

---

## Notes

- **Production-ready MVP** - Not a prototype
- **AI-native** - Designed for AI collaboration
- **Zero-config** - Works immediately
- **30% coverage** - Critical paths tested
- **Graceful degradation** - Never crashes
- **Modern tooling** - ESLint v9, Vitest 4, Tailwind v4

---

**Last Updated:** 2025-01-07
**Version:** 3.0
**Status:** Ready to Run
