import { Link } from 'react-router-dom'
import { usePageTitle } from '@/hooks/usePageTitle'

/**
 * 404 Not Found Page
 */
export default function NotFoundPage() {
  usePageTitle('Page Not Found')

  return (
    <div className="min-h-screen flex items-center justify-center container-site py-24 text-center">
      <div>
        <p className="section-label mb-4">404</p>
        <h1 className="text-5xl font-bold text-brand-navy mb-4">Page Not Found</h1>
        <div className="section-divider" />
        <p className="text-brand-muted max-w-md mx-auto mt-6 mb-8">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          to="/"
          className="inline-block px-8 py-3 bg-brand-navy text-white text-xs font-semibold tracking-widest uppercase rounded hover:bg-brand-teal transition-colors duration-300"
        >
          Return to Home
        </Link>
      </div>
    </div>
  )
}
