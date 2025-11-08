import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/features/auth/context/auth-context'
import { OrganizationProvider } from '@/features/organizations'
import { Toaster } from '@/components/ui/toaster'
import { DemoModeBanner } from '@/components/demo-mode-banner'
import LandingPage from '@/features/landing/landing-page'
import LoginPage from '@/features/auth/components/login-page'
import SignupPage from '@/features/auth/components/signup-page'
import DashboardPage from '@/features/dashboard/dashboard-page'
import AccountPage from '@/features/account/account-page'
import SettingsPage from '@/features/settings/settings-page'
import ProtectedRoute from '@/features/auth/components/protected-route'

function App() {
  return (
    <AuthProvider>
      <OrganizationProvider>
        <DemoModeBanner />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/account"
            element={
              <ProtectedRoute>
                <AccountPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <Toaster />
      </OrganizationProvider>
    </AuthProvider>
  )
}

export default App
