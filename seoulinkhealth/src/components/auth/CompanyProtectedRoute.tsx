import { Navigate, useLocation } from 'react-router-dom'
import { useCompanyAuthStore } from '@/store/companyAuthStore'

interface CompanyProtectedRouteProps {
  children: React.ReactNode
}

/**
 * Wraps any route that requires company authentication.
 * Redirects unauthenticated visitors to /company/login with a `from` state
 * so they can be redirected back after a successful login.
 */
export default function CompanyProtectedRoute({ children }: CompanyProtectedRouteProps) {
  const isAuthenticated = useCompanyAuthStore((s) => s.isAuthenticated)
  const location = useLocation()

  if (!isAuthenticated()) {
    return <Navigate to="/company/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}
