import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { SITE_CONFIG } from '@/config/site'

// ─── Pages ────────────────────────────────────────────────────────────────────
import HomePage    from '@/pages/Home'
import AboutPage   from '@/pages/About'
import NetworkPage from '@/pages/Network'
import ProcessPage from '@/pages/Process'
import RequestPage from '@/pages/Request'
import LoginPage   from '@/pages/Login'
import AdminPage   from '@/pages/Admin'
import NotFoundPage from '@/pages/NotFound'
import PrivacyPolicyPage from '@/pages/PrivacyPolicy'
import TermsOfServicePage from '@/pages/TermsOfService'
import FAQPage from '@/pages/FAQ'
import CompanyLoginPage from '@/pages/CompanyLogin'
import CompanyRegisterPage from '@/pages/CompanyRegister'
import CompanyDashboardPage from '@/pages/CompanyDashboard'
import CompanyQAPage from '@/pages/CompanyQA'

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
      </BrowserRouter>
    </>
  )
}

export default App
