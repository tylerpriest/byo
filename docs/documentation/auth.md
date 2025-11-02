# Authentication Guide

Complete guide to the authentication system in BYO.

## Overview

BYO uses **Supabase Auth** for authentication, providing:

- Email/password authentication
- Magic link sign-in
- OAuth providers (Google, GitHub, etc.)
- JWT-based sessions
- Automatic token refresh

## Architecture

```
┌──────────────┐
│   Sign In    │
│   Sign Up    │
└──────┬───────┘
       │
       ↓
┌──────────────────┐
│  Supabase Auth   │
│  (Auth Server)   │
└──────┬───────────┘
       │
       ↓
┌──────────────────┐
│   JWT Token      │
│   (Session)      │
└──────┬───────────┘
       │
       ↓
┌──────────────────┐
│  AuthContext     │
│  (Global State)  │
└──────┬───────────┘
       │
       ↓
┌──────────────────┐
│   Components     │
│   (useAuth())    │
└──────────────────┘
```

## Implementation

### Auth Context

Located at `/src/features/auth/context/auth-context.tsx`

```tsx
export function AuthProvider({ children }) {
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
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ user, session, loading, ... }}>
      {children}
    </AuthContext.Provider>
  )
}
```

### Using Auth in Components

```tsx
import { useAuth } from '@/features/auth/context/auth-context'

function MyComponent() {
  const { user, signOut } = useAuth()

  if (!user) {
    return <div>Not authenticated</div>
  }

  return (
    <div>
      <p>Welcome, {user.email}</p>
      <button onClick={signOut}>Sign out</button>
    </div>
  )
}
```

## Sign Up Flow

### 1. User submits signup form

```tsx
const { signUp } = useAuth()

const handleSignup = async (data) => {
  const { error } = await signUp(
    data.email,
    data.password,
    data.displayName
  )

  if (error) {
    // Handle error
  } else {
    // Success - redirect to login
  }
}
```

### 2. Supabase creates user

- Creates entry in `auth.users`
- Sends confirmation email (if enabled)
- Returns user object

### 3. Database trigger creates profile

Our migration includes a trigger that automatically:

```sql
CREATE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Create profile
  INSERT INTO profiles (id, display_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'display_name');

  -- Assign default 'User' role
  INSERT INTO user_roles (user_id, role_id)
  VALUES (NEW.id, (SELECT id FROM roles WHERE name = 'User'));

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

This ensures every new user gets:
- A profile record
- The "User" role

## Sign In Flow

### 1. User submits login form

```tsx
const { signIn } = useAuth()

const handleLogin = async (data) => {
  const { error } = await signIn(data.email, data.password)

  if (error) {
    // Handle error
  } else {
    // Success - AuthContext updates automatically
    navigate('/dashboard')
  }
}
```

### 2. Supabase validates credentials

- Checks email/password
- Returns JWT token if valid
- Error if invalid

### 3. Session is established

- JWT stored in localStorage (or cookies in production)
- `onAuthStateChange` fires
- AuthContext updates `user` and `session`
- App re-renders with authenticated state

## Protected Routes

Use the `ProtectedRoute` component to guard authenticated routes:

```tsx
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <DashboardPage />
    </ProtectedRoute>
  }
/>
```

Implementation:

```tsx
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingSpinner />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
```

## Sign Out Flow

```tsx
const { signOut } = useAuth()

const handleSignOut = async () => {
  await signOut()
  // User is automatically redirected by auth state change
}
```

Supabase:
1. Clears session
2. Removes JWT token
3. Fires `onAuthStateChange` with null session
4. App redirects to login

## Session Management

### Automatic Refresh

Supabase automatically refreshes the JWT token before expiration.

Configure in `/src/lib/supabase.ts`:

```tsx
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})
```

### Session Persistence

Sessions are persisted in localStorage by default.

**Production consideration:** Use httpOnly cookies for better security:

```tsx
// In production
auth: {
  storage: customStorageAdapter, // Implement cookie storage
  autoRefreshToken: true,
}
```

## Email Confirmation

### Development (Local Supabase)

Email confirmation is **disabled** by default in `supabase/config.toml`:

```toml
[auth.email]
enable_confirmations = false
```

Emails are captured in Inbucket: `http://localhost:54324`

### Production

Enable email confirmations in Supabase Dashboard:

1. Go to Authentication → Settings
2. Enable "Email confirmations"
3. Configure email templates

Users must confirm email before sign-in.

## Magic Links

Enable passwordless sign-in:

```tsx
const { error } = await supabase.auth.signInWithOtp({
  email: 'user@example.com',
})
```

User receives email with magic link to sign in.

## OAuth Providers

### Setup

1. Enable provider in Supabase Dashboard (Authentication → Providers)
2. Configure OAuth app (Google, GitHub, etc.)
3. Add callback URL: `https://your-project.supabase.co/auth/v1/callback`

### Usage

```tsx
const { error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
})
```

### Handle Callback

Supabase automatically handles the OAuth callback and establishes the session.

## Password Reset

### Request Reset

```tsx
const { resetPassword } = useAuth()

const handleReset = async (email) => {
  const { error } = await resetPassword(email)

  if (!error) {
    toast.success('Check your email for reset link')
  }
}
```

### Update Password

Supabase sends email with link to reset page:

```tsx
const { error } = await supabase.auth.updateUser({
  password: newPassword,
})
```

## User Metadata

### On Signup

```tsx
const { error } = await signUp(email, password, {
  data: {
    display_name: 'John Doe',
    avatar_url: 'https://...',
  },
})
```

Access via `user.user_metadata`:

```tsx
const displayName = user?.user_metadata?.display_name
```

### Update Metadata

```tsx
const { error } = await supabase.auth.updateUser({
  data: {
    display_name: 'Jane Doe',
  },
})
```

## Security Considerations

### JWT Tokens

- Stored in localStorage (dev) or httpOnly cookies (prod)
- Auto-refresh before expiration
- Contains user claims (id, email, role, etc.)

### RLS Integration

JWT tokens are automatically passed to database queries.

Access user ID in RLS policies:

```sql
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);
```

`auth.uid()` extracts user ID from JWT.

### Rate Limiting

Supabase provides built-in rate limiting for auth endpoints.

### HTTPS Only

Always use HTTPS in production. Supabase enforces this.

## Hooks

### useAuth()

Get auth state and methods:

```tsx
const { user, session, loading, signIn, signUp, signOut } = useAuth()
```

### useUser()

Get just the user:

```tsx
const user = useUser()
```

### useSession()

Get just the session:

```tsx
const session = useSession()
```

## Testing Auth

### Mock Supabase in Tests

```tsx
vi.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
    },
  },
}))
```

### Test Protected Routes

```tsx
test('redirects to login if not authenticated', async () => {
  render(<ProtectedRoute><Dashboard /></ProtectedRoute>)

  // Should redirect to /login
  await waitFor(() => {
    expect(window.location.pathname).toBe('/login')
  })
})
```

## Troubleshooting

### "Invalid login credentials"

- Check email/password are correct
- Verify user exists in auth.users
- Check if email confirmation is required

### Session not persisting

- Check localStorage for auth token
- Verify `persistSession: true` in client config
- Check browser doesn't block localStorage

### "User already registered"

- User with email already exists
- Use password reset to recover account

### Infinite loading state

- Check Supabase URL and key are correct
- Verify network requests in DevTools
- Check for JavaScript errors

---

**Related Docs:**
- [RBAC Guide](./rbac.md) - Adding roles and permissions
- [Setup Guide](./setup.md) - Environment configuration
- [Architecture](./architecture.md) - System design
