# Testing Guide

Comprehensive guide to testing in BYO.

## Testing Stack

- **Vitest 4.0** - Unit and integration tests
- **Testing Library** - Component testing
- **Playwright** - E2E testing

## Philosophy

BYO follows **pragmatic TDD**:

- Test infrastructure is ready, not enforced
- Write tests for critical paths
- Example tests show the way
- Balance coverage with velocity

## Unit Testing (Vitest)

### Setup

Tests are configured in `vitest.config.ts`:

```ts
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/lib/test-utils.tsx',
  },
})
```

### Running Tests

```bash
# Run all tests
npm test

# Run in watch mode
npm test -- --watch

# Run with UI
npm run test:ui

# Run specific test
npm test -- button.test.tsx

# Coverage
npm test -- --coverage
```

### Writing Unit Tests

#### Testing Utilities

```tsx
// src/lib/__tests__/rbac.test.ts
import { describe, it, expect, vi } from 'vitest'
import { hasRole } from '../rbac'

describe('hasRole', () => {
  it('returns true if user has the role', async () => {
    const result = await hasRole('user-123', 'Admin')
    expect(result).toBe(true)
  })
})
```

#### Testing Hooks

```tsx
import { renderHook } from '@testing-library/react'
import { useRoles } from '../use-rbac'

describe('useRoles', () => {
  it('returns user roles', async () => {
    const { result } = renderHook(() => useRoles())

    await waitFor(() => {
      expect(result.current.roles).toContain('User')
    })
  })
})
```

### Testing Components

#### Basic Component Test

```tsx
import { render, screen } from '@/lib/test-utils'
import { Button } from '@/components/ui/button'

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('can be disabled', () => {
    render(<Button disabled>Disabled</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })
})
```

#### Testing User Interactions

```tsx
import { render, screen, fireEvent } from '@/lib/test-utils'

describe('LoginForm', () => {
  it('submits form with email and password', async () => {
    const onSubmit = vi.fn()
    render(<LoginForm onSubmit={onSubmit} />)

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' },
    })

    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: 'password123' },
    })

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })
    })
  })
})
```

### Mocking

#### Mock Supabase

```tsx
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({
        data: mockData,
        error: null,
      }),
    })),
  },
}))
```

#### Mock Auth Context

```tsx
vi.mock('@/features/auth/context/auth-context', () => ({
  useAuth: () => ({
    user: { id: '123', email: 'test@example.com' },
    session: null,
    loading: false,
    signOut: vi.fn(),
  }),
}))
```

#### Mock RBAC Hooks

```tsx
vi.mock('@/hooks/use-rbac', () => ({
  useRoles: () => ({
    roles: ['Admin'],
    loading: false,
  }),
  useHasPermission: () => ({
    hasPermission: true,
    loading: false,
  }),
}))
```

### Test Utilities

Custom render with providers:

```tsx
// src/lib/test-utils.tsx
function AllTheProviders({ children }) {
  return (
    <BrowserRouter>
      <AuthProvider>{children}</AuthProvider>
    </BrowserRouter>
  )
}

const customRender = (ui, options) =>
  render(ui, { wrapper: AllTheProviders, ...options })

export { customRender as render }
```

## E2E Testing (Playwright)

### Setup

Tests are in the `/tests` directory.

Configure in `playwright.config.ts`:

```ts
export default defineConfig({
  testDir: './tests',
  use: {
    baseURL: 'http://localhost:5173',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
  },
})
```

### Running E2E Tests

```bash
# Install browsers (first time)
npx playwright install

# Run tests
npm run test:e2e

# Run with UI
npm run test:e2e:ui

# Run specific browser
npm run test:e2e -- --project=chromium

# Debug mode
npm run test:e2e -- --debug
```

### Writing E2E Tests

#### Basic Page Test

```ts
import { test, expect } from '@playwright/test'

test('landing page displays correctly', async ({ page }) => {
  await page.goto('/')

  await expect(
    page.getByRole('heading', { name: /Build Your Own SaaS/i })
  ).toBeVisible()
})
```

#### Testing Navigation

```ts
test('navigates to signup page', async ({ page }) => {
  await page.goto('/')

  await page.getByRole('link', { name: /Get started/i }).first().click()

  await expect(
    page.getByRole('heading', { name: /Create an account/i })
  ).toBeVisible()

  expect(page.url()).toContain('/signup')
})
```

#### Testing Forms

```ts
test('submits login form', async ({ page }) => {
  await page.goto('/login')

  await page.getByLabel(/Email/i).fill('test@example.com')
  await page.getByLabel(/Password/i).fill('password123')

  await page.getByRole('button', { name: /Sign in/i }).click()

  // Wait for navigation or success message
  await expect(page).toHaveURL('/dashboard')
})
```

#### Testing Authentication Flow

```ts
test.describe('Auth Flow', () => {
  test('complete signup and login flow', async ({ page }) => {
    // 1. Signup
    await page.goto('/signup')
    await page.getByLabel(/Display Name/i).fill('Test User')
    await page.getByLabel(/Email/i).fill('test@example.com')
    await page.getByLabel('Password', { exact: true }).fill('password123')
    await page.getByLabel(/Confirm Password/i).fill('password123')
    await page.getByRole('button', { name: /Create account/i }).click()

    // 2. Should redirect to login
    await expect(page).toHaveURL('/login')

    // 3. Login
    await page.getByLabel(/Email/i).fill('test@example.com')
    await page.getByLabel(/Password/i).fill('password123')
    await page.getByRole('button', { name: /Sign in/i }).click()

    // 4. Should be on dashboard
    await expect(page).toHaveURL('/dashboard')
    await expect(page.getByText(/Welcome/i)).toBeVisible()
  })
})
```

#### Using Fixtures

```ts
// Create reusable authenticated state
test.use({
  storageState: 'playwright/.auth/user.json',
})

test.beforeEach(async ({ page }) => {
  // Already authenticated
  await page.goto('/dashboard')
})
```

### Page Object Model

For complex flows, use Page Objects:

```ts
// tests/pages/login-page.ts
export class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/login')
  }

  async login(email: string, password: string) {
    await this.page.getByLabel(/Email/i).fill(email)
    await this.page.getByLabel(/Password/i).fill(password)
    await this.page.getByRole('button', { name: /Sign in/i }).click()
  }
}

// Use in tests
const loginPage = new LoginPage(page)
await loginPage.goto()
await loginPage.login('test@example.com', 'password123')
```

## Testing Strategy

### What to Test

#### High Priority
✅ **Authentication flows**
- Signup, login, logout
- Password reset
- Protected routes

✅ **Critical user paths**
- Dashboard access
- Profile updates
- Settings changes

✅ **RBAC**
- Role-based UI rendering
- Permission checks
- RLS policies

✅ **Forms**
- Validation
- Submission
- Error handling

#### Medium Priority
⚠️ **Component behavior**
- Button states
- Card rendering
- Navigation

⚠️ **Utility functions**
- RBAC helpers
- Form validators
- Data formatters

#### Low Priority (optional)
🔹 **UI components**
- Styling
- Layout
- Animations

### Test Coverage Goals

- **Critical paths:** 80%+
- **Utilities:** 70%+
- **Components:** 50%+
- **Overall:** 60%+

**Remember:** Coverage is a metric, not a goal. Focus on meaningful tests.

## Testing Patterns

### AAA Pattern

```ts
test('user can update profile', async () => {
  // Arrange
  const user = createMockUser()
  render(<ProfilePage user={user} />)

  // Act
  fireEvent.change(screen.getByLabelText(/Name/i), {
    target: { value: 'New Name' },
  })
  fireEvent.click(screen.getByRole('button', { name: /Save/i }))

  // Assert
  await waitFor(() => {
    expect(screen.getByText(/Profile updated/i)).toBeInTheDocument()
  })
})
```

### Test User Feedback

```ts
test('shows error message on failed login', async ({ page }) => {
  await page.goto('/login')

  await page.getByLabel(/Email/i).fill('wrong@example.com')
  await page.getByLabel(/Password/i).fill('wrongpassword')
  await page.getByRole('button', { name: /Sign in/i }).click()

  await expect(page.getByText(/Invalid login credentials/i)).toBeVisible()
})
```

### Test Loading States

```ts
test('shows loading spinner while fetching data', async () => {
  render(<Dashboard />)

  expect(screen.getByRole('status')).toBeInTheDocument()

  await waitFor(() => {
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })
})
```

## CI Integration

Tests run automatically on every PR via GitHub Actions:

```yaml
# .github/workflows/ci.yml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm test

  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Install dependencies
        run: npm ci
      - name: Install Playwright
        run: npx playwright install --with-deps
      - name: Run E2E tests
        run: npm run test:e2e
```

## Debugging Tests

### Vitest UI

```bash
npm run test:ui
```

Opens interactive UI for debugging tests.

### Playwright UI

```bash
npm run test:e2e:ui
```

Step through tests visually.

### Debug Mode

```bash
npm run test:e2e -- --debug
```

Opens browser with debugger.

### Console Logs

```ts
test('debugging example', () => {
  console.log('Current state:', state)
  screen.debug() // Prints DOM
})
```

## Best Practices

### 1. Test Behavior, Not Implementation

❌ **Don't:**
```ts
expect(component.state.isOpen).toBe(true)
```

✅ **Do:**
```ts
expect(screen.getByRole('dialog')).toBeVisible()
```

### 2. Use Accessible Queries

Priority order:
1. `getByRole` (best)
2. `getByLabelText`
3. `getByPlaceholderText`
4. `getByText`
5. `getByTestId` (last resort)

### 3. Avoid Implementation Details

❌ **Don't:**
```ts
expect(wrapper.find('.button').hasClass('active')).toBe(true)
```

✅ **Do:**
```ts
expect(screen.getByRole('button')).toHaveAttribute('aria-pressed', 'true')
```

### 4. Test User Workflows

Test complete flows, not isolated units:

```ts
test('user can create and edit content', async ({ page }) => {
  await loginAsUser(page)
  await createContent(page, 'My Content')
  await editContent(page, 'Updated Content')
  await expect(page.getByText('Updated Content')).toBeVisible()
})
```

### 5. Clean Up After Tests

```ts
afterEach(() => {
  vi.clearAllMocks()
  cleanup()
})
```

## Common Issues

### Tests timeout

- Increase timeout: `test('...', { timeout: 10000 })`
- Use `waitFor` for async operations
- Check for network requests

### Flaky tests

- Avoid `wait(1000)`, use `waitFor`
- Use data-testid for dynamic content
- Mock time-dependent logic

### Can't find element

- Use `screen.debug()`
- Check if element is in document
- Verify query is correct

---

**Related Docs:**
- [Architecture](./architecture.md)
- [Setup Guide](./setup.md)
