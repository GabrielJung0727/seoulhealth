import { lazy, Suspense, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { SITE_CONFIG } from '@/config/site'

// ─── Pages ────────────────────────────────────────────────────────────────────
// Home ships in the main bundle; every other route loads on demand
import HomePage    from '@/pages/Home'
const AboutPage   = lazy(() => import('@/pages/About'))
const NetworkPage = lazy(() => import('@/pages/Network'))
const ProcessPage = lazy(() => import('@/pages/Process'))
const RequestPage = lazy(() => import('@/pages/Request'))
const LoginPage   = lazy(() => import('@/pages/Login'))
const AdminPage   = lazy(() => import('@/pages/Admin'))
const NotFoundPage = lazy(() => import('@/pages/NotFound'))
const PrivacyPolicyPage = lazy(() => import('@/pages/PrivacyPolicy'))
const TermsOfServicePage = lazy(() => import('@/pages/TermsOfService'))
const FAQPage = lazy(() => import('@/pages/FAQ'))
const CompanyLoginPage = lazy(() => import('@/pages/CompanyLogin'))
const CompanyRegisterPage = lazy(() => import('@/pages/CompanyRegister'))
const CompanyResetPasswordPage = lazy(() => import('@/pages/CompanyResetPassword'))
const CompanyDashboardPage = lazy(() => import('@/pages/CompanyDashboard'))
const CompanyQAPage = lazy(() => import('@/pages/CompanyQA'))

// ─── Layout ───────────────────────────────────────────────────────────────────
import Layout from '@/components/layout/Layout'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import CompanyProtectedRoute from '@/components/auth/CompanyProtectedRoute'

// ─── Global UI ────────────────────────────────────────────────────────────────
import ToastContainer from '@/components/ui/Toast'
import SplashScreen from '@/components/ui/SplashScreen'

function App() {
  const [showSplash, setShowSplash] = useState(
    !sessionStorage.getItem('sih_splash_shown')
  )

  return (
    <>
      {/* Global toast notifications */}
      <ToastContainer />

      {/* Splash screen — only on first visit */}
      <AnimatePresence>
        {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
      </AnimatePresence>

      <BrowserRouter>
        <Suspense fallback={null}>
        <Routes>
          {/* ── Public pages — shared Layout (Header + Footer) ── */}
          <Route element={<Layout />}>
            <Route path="/"        element={<HomePage />} />
            <Route path="/about"   element={<AboutPage />} />
            <Route path="/network" element={<NetworkPage />} />
            <Route path="/process" element={<ProcessPage />} />
            <Route path="/request" element={<RequestPage />} />
            <Route path="/privacy" element={<PrivacyPolicyPage />} />
            <Route path="/terms"   element={<TermsOfServicePage />} />
            <Route path="/faq"     element={<FAQPage />} />

            {/* LOGIN nav item is toggled by config, but the /login route is
                always registered so ProtectedRoute can redirect here */}
            {SITE_CONFIG.loginEnabled && (
              <Route path="/login" element={<LoginPage />} />
            )}
          </Route>

          {/* /login is always reachable even when nav item is hidden */}
          {!SITE_CONFIG.loginEnabled && (
            <Route path="/login" element={<LoginPage />} />
          )}

          {/* ── Company pages — separate layout (no public nav) ── */}
          <Route path="/company/login"    element={<CompanyLoginPage />} />
          <Route path="/company/register" element={<CompanyRegisterPage />} />
          <Route path="/company/reset-password" element={<CompanyResetPasswordPage />} />
          <Route
            path="/company/dashboard"
            element={
              <CompanyProtectedRoute>
                <CompanyDashboardPage />
              </CompanyProtectedRoute>
            }
          />
          <Route
            path="/company/qa"
            element={
              <CompanyProtectedRoute>
                <CompanyQAPage />
              </CompanyProtectedRoute>
            }
          />

          {/* ── Admin — protected, separate layout (no public nav) ── */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute>
                <AdminPage />
              </ProtectedRoute>
            }
          />

          {/* ── 404 ── */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        </Suspense>
      </BrowserRouter>
    </>
  )
}

export default App
