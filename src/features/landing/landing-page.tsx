import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/features/auth/context/auth-context'
import { WhatsNewBanner } from '@/components/whats-new-banner'

export default function LandingPage() {
  const { user } = useAuth()

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold">BYO</h1>
          </div>
          <nav className="flex items-center space-x-4">
            {user ? (
              <Button asChild>
                <Link to="/dashboard">Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link to="/login">Sign in</Link>
                </Button>
                <Button asChild>
                  <Link to="/signup">Get started</Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* What's New Banner */}
      <WhatsNewBanner />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-4xl font-bold tracking-tight sm:text-6xl">
          Build Your Own SaaS
        </h2>
        <p className="mt-6 text-lg leading-8 text-muted-foreground">
          A modern, production-ready SaaS starter template built with Vite, React 19,
          TypeScript, Supabase, and ShadCN UI.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          {user ? (
            <Button size="lg" asChild>
              <Link to="/dashboard">Go to Dashboard</Link>
            </Button>
          ) : (
            <>
              <Button size="lg" asChild>
                <Link to="/signup">Get started</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/login">Sign in</Link>
              </Button>
            </>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <h3 className="text-center text-3xl font-bold">Key Features</h3>
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Modern Stack</CardTitle>
              <CardDescription>
                Built with Vite, React 19, and TypeScript for optimal performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Lightning-fast development with hot module replacement and modern tooling.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Full Authentication</CardTitle>
              <CardDescription>
                Supabase Auth with email, magic links, and OAuth support
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Secure authentication out of the box with multiple sign-in options.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4-Tier RBAC</CardTitle>
              <CardDescription>
                Role-based access control with Admin, Moderator, User, and Guest roles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Flexible permission system enforced at the database level with RLS.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Beautiful UI</CardTitle>
              <CardDescription>
                ShadCN UI components with official blocks and themes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Pre-built, accessible components that you can customize to your needs.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>TDD Ready</CardTitle>
              <CardDescription>
                Vitest 4.0 and Playwright testing setup with examples
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Write unit and E2E tests with confidence using modern testing tools.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>CI/CD Pipeline</CardTitle>
              <CardDescription>
                GitHub Actions with automated testing and Vercel deployment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Automated workflows for continuous integration and deployment.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t bg-muted/40 py-20">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold">Ready to get started?</h3>
          <p className="mt-4 text-lg text-muted-foreground">
            Create your account and start building today.
          </p>
          <div className="mt-8">
            {user ? (
              <Button size="lg" asChild>
                <Link to="/dashboard">Go to Dashboard</Link>
              </Button>
            ) : (
              <Button size="lg" asChild>
                <Link to="/signup">Get started for free</Link>
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Built with BYO - Build Your Own SaaS Boilerplate</p>
        </div>
      </footer>
    </div>
  )
}
