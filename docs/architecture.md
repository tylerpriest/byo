# Architecture

This document describes the architectural decisions and design patterns used in the BYO SaaS boilerplate.

## Overview

BYO follows a **feature-based architecture** with clear separation of concerns and modern React patterns.

```
┌─────────────────────────────────────────┐
│           User Interface                │
│        (React 19 + ShadCN UI)           │
└─────────────────────────────────────────┘
                  │
┌─────────────────────────────────────────┐
│        Application Layer                │
│   (Auth Context, RBAC, Routing)         │
└─────────────────────────────────────────┘
                  │
┌─────────────────────────────────────────┐
│          Supabase Client                │
│  (Auth, Database, RLS, Realtime)        │
└─────────────────────────────────────────┘
                  │
┌─────────────────────────────────────────┐
│      Supabase Backend (PostgreSQL)      │
│     (Database, Auth, Storage, Edge)     │
└─────────────────────────────────────────┘
```

## Core Principles

### 1. Feature-Based Organization

Code is organized by feature, not by file type:

```
/src/features/
  /auth/
    /components/    # Auth-specific components
    /context/       # Auth context and providers
    /utils/         # Auth utilities
  /dashboard/
    /components/    # Dashboard components
    dashboard-page.tsx
  /account/
    account-page.tsx
```

**Benefits:**
- Clear boundaries between features
- Easy to find related code
- Scalable as the app grows
- Clear ownership of features

### 2. Database-First Security

All authorization is enforced at the **database level** using Supabase Row Level Security (RLS).

**Why?**
- No client-side security bypass
- Consistent security across all access points
- Single source of truth
- Automatic enforcement

### 3. Progressive Enhancement

Start simple, add complexity only when needed:

1. **Core MVP** → Authentication + Basic UI
2. **Add RBAC** → When you need permissions
3. **Add Features** → When you need them
4. **Optimize** → When performance matters

## Key Architectural Decisions

### Authentication Flow

```
User Action → Supabase Auth → JWT Token → Session
                                    │
                                    ↓
                            RLS Policies Apply
                                    │
                                    ↓
                            Database Access
```

**Implementation:**
- `AuthContext` manages global auth state
- `useAuth()` hook for component access
- Protected routes via `ProtectedRoute` component
- Automatic session refresh

### RBAC System

```
User → User Roles → Roles → Role Permissions → Permissions
```

**Four-Tier System:**
1. **Admin** - Full system access
2. **Moderator** - Content management
3. **User** - Standard access
4. **Guest** - Read-only

**Permission Format:** `resource.action`
- Example: `users.read`, `content.write`

**Caching Strategy:**
- In-memory cache for permissions
- Cache cleared on role changes
- Per-user cache isolation

### State Management

**Local State:**
- React `useState` for component state
- React `useReducer` for complex state

**Global State:**
- React Context for auth state
- No Redux/MobX needed for MVP

**Server State:**
- Supabase real-time subscriptions
- Optimistic UI updates

### Error Handling

**Three Levels:**
1. **Component Level** - Try/catch in handlers
2. **Context Level** - Error boundaries
3. **Global Level** - Logger (Pino)

**User Feedback:**
- Toast notifications for actions
- Error messages inline in forms
- Loading states for async operations

## Data Flow

### Read Flow

```
Component → Supabase Query → RLS Check → Data → Component Update
```

### Write Flow

```
User Action → Optimistic Update → Supabase Mutation
                    │                       │
                    ↓                       ↓
            UI Updates               RLS Check
                                            │
                                            ↓
                                    Success/Error
                                            │
                                            ↓
                                    Confirm/Revert UI
```

## Component Patterns

### Page Components

Located in `/src/features/{feature}/`

```tsx
export default function DashboardPage() {
  const { user } = useAuth()
  const { roles } = useRoles()

  return (
    <DashboardLayout>
      {/* Page content */}
    </DashboardLayout>
  )
}
```

### Layout Components

Wrap pages with common UI (sidebar, header, etc.)

```tsx
export default function DashboardLayout({ children }) {
  return (
    <div className="flex">
      <Sidebar />
      <main>{children}</main>
    </div>
  )
}
```

### UI Components

Reusable ShadCN components in `/src/components/ui/`

## Performance Considerations

### Code Splitting

- Route-based splitting (automatic with Vite)
- Dynamic imports for heavy components
- Lazy loading for modal content

### Caching

- RBAC permissions cached in memory
- Supabase client caches sessions
- Browser caching for static assets

### Optimization

- React 19 automatic optimizations
- Vite build optimizations
- Image optimization (future)
- Bundle analysis (future)

## Security Architecture

### Authentication

- JWT tokens (HttpOnly cookies in production)
- Automatic token refresh
- Secure session storage

### Authorization

- RLS policies at database level
- Permission checks in UI
- Route guards for protected pages

### Data Protection

- Environment variables for secrets
- HTTPS only in production
- CORS configuration
- Input validation with Zod

## Testing Strategy

### Unit Tests (Vitest)

- Test utilities and hooks
- Test isolated components
- Mock Supabase client

### Integration Tests

- Test auth flow
- Test RBAC logic
- Test data mutations

### E2E Tests (Playwright)

- Test critical user flows
- Test across browsers
- Test responsive design

## Deployment Architecture

```
GitHub → GitHub Actions → Vercel → Production
   │                          │
   └─ CI Tests                └─ Environment Variables
   └─ Type Check              └─ Edge Functions
   └─ Build
```

**Environments:**
- **Preview** - Every PR
- **Production** - Main branch

## Future Enhancements

### Potential Additions

1. **Multi-tenancy** - Org/workspace support
2. **Real-time features** - Websockets via Supabase
3. **Payment integration** - Stripe/Paddle
4. **Email system** - Transactional emails
5. **Analytics** - Usage tracking
6. **Admin panel** - User management UI

### Scaling Considerations

- Database read replicas
- CDN for static assets
- Edge caching
- Background jobs (Supabase Edge Functions)

## Technology Decisions

### Why Vite?

- Fastest dev server
- Modern ESM-based
- Best-in-class DX
- Optimized builds

### Why Supabase?

- PostgreSQL (proven, reliable)
- Built-in auth
- Real-time capabilities
- Generous free tier
- No vendor lock-in (open source)

### Why ShadCN UI?

- Copy-paste components (you own the code)
- Built on Radix UI (accessible)
- Tailwind-based (customizable)
- Official blocks (pre-built layouts)

### Why React 19?

- Latest features
- Improved performance
- Better TypeScript support
- Modern patterns

## Conventions

### File Naming

- Components: `PascalCase.tsx`
- Utilities: `kebab-case.ts`
- Pages: `{feature}-page.tsx`
- Tests: `{name}.test.ts(x)`

### Code Style

- Use TypeScript strict mode
- Functional components only
- Hooks for state and effects
- Props destructuring
- Early returns

### Git Workflow

- Feature branches
- Conventional commits
- PR reviews
- CI checks before merge

---

**Last Updated:** 2025-11-02
