/**
 * ADK Platform Frontend
 * Main application component with all providers
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

import { queryClient } from '@services/queryClient'
import { AuthProvider } from '@contexts/AuthContext'
import { TenantProvider } from '@contexts/TenantContext'
import { ThemeProvider } from '@contexts/ThemeContext'
import { RootLayout } from '@components/layout'

// Page imports
import { DashboardPage } from '@pages/dashboard'
import { WorkshopsPage, WorkshopDetailPage } from '@pages/workshops'
import { ExercisePage } from '@pages/exercises'
import { GuidePage, GuidesListPage } from '@pages/guides'
import { ExamplePage } from '@pages/examples'
import { AdminUsersPage, AdminTenantsPage } from '@pages/admin'
import { SettingsPage } from '@pages/profile'
import { SetupWizard } from '@pages/getting-started'
import {
  LoginPage,
  RegisterPage,
  ForgotPasswordPage,
  ResetPasswordPage,
  WelcomePage,
} from '@pages/auth'

// Placeholder pages - will be replaced with actual page components
function AgentsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
        Agents
      </h1>
      <p className="text-gray-600 dark:text-gray-300">
        Agent management coming soon...
      </p>
    </div>
  )
}

function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-300 dark:text-gray-600">404</h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mt-4">
          Page not found
        </p>
      </div>
    </div>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TenantProvider>
            <BrowserRouter>
              <Routes>
                {/* Public auth routes (no layout) */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/welcome" element={<WelcomePage />} />

                {/* Dashboard */}
                <Route
                  path="/"
                  element={
                    <RootLayout>
                      <DashboardPage />
                    </RootLayout>
                  }
                />

                {/* Workshops */}
                <Route
                  path="/workshops"
                  element={
                    <RootLayout>
                      <WorkshopsPage />
                    </RootLayout>
                  }
                />
                <Route
                  path="/workshops/:id"
                  element={
                    <RootLayout>
                      <WorkshopDetailPage />
                    </RootLayout>
                  }
                />

                {/* Exercises */}
                <Route
                  path="/exercises/:id"
                  element={
                    <RootLayout>
                      <ExercisePage />
                    </RootLayout>
                  }
                />

                {/* Guides */}
                <Route
                  path="/guides"
                  element={
                    <RootLayout>
                      <GuidesListPage />
                    </RootLayout>
                  }
                />
                <Route
                  path="/guides/:slug"
                  element={
                    <RootLayout>
                      <GuidePage />
                    </RootLayout>
                  }
                />

                {/* Getting Started / Setup Wizard */}
                <Route
                  path="/getting-started"
                  element={
                    <RootLayout>
                      <SetupWizard />
                    </RootLayout>
                  }
                />

                {/* Examples */}
                <Route
                  path="/examples/:id"
                  element={
                    <RootLayout>
                      <ExamplePage />
                    </RootLayout>
                  }
                />

                {/* Agents */}
                <Route
                  path="/agents"
                  element={
                    <RootLayout>
                      <AgentsPage />
                    </RootLayout>
                  }
                />

                {/* Visual Builder is accessed via external ADK CLI at http://localhost:8000/dev-ui */}

                {/* Profile Routes */}
                <Route
                  path="/profile/settings"
                  element={
                    <RootLayout>
                      <SettingsPage />
                    </RootLayout>
                  }
                />

                {/* Admin Routes */}
                <Route
                  path="/admin/users"
                  element={
                    <RootLayout>
                      <AdminUsersPage />
                    </RootLayout>
                  }
                />
                <Route
                  path="/admin/tenants"
                  element={
                    <RootLayout>
                      <AdminTenantsPage />
                    </RootLayout>
                  }
                />

                {/* Catch-all */}
                <Route
                  path="/404"
                  element={
                    <RootLayout>
                      <NotFoundPage />
                    </RootLayout>
                  }
                />
                <Route path="*" element={<Navigate to="/404" replace />} />
              </Routes>
            </BrowserRouter>
          </TenantProvider>
        </AuthProvider>
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

export default App
