import { Link } from 'react-router-dom'

/**
 * Shown on a form's success screen: tells the submitter how to follow up on
 * their submission in the client portal.
 *
 * - logged in        → link straight to the dashboard
 * - account created  → a temporary password was emailed; link to Company Login
 * - otherwise        → an account already exists for this email; link to Company Login
 */
export default function PortalNote({
  accountCreated,
  loggedIn,
  onNavigate,
}: {
  accountCreated: boolean
  loggedIn: boolean
  onNavigate: () => void
}) {
  const message = loggedIn
    ? 'You can track the status of this submission in your company dashboard.'
    : accountCreated
      ? 'A client portal account has been created for you, and a temporary password has been sent to your email. Sign in to track the status of your submission.'
      : 'You can track the status of your submission by signing in to the client portal with your email address.'

  return (
    <div className="max-w-sm mx-auto mb-8 rounded-lg border border-brand-gold/40 bg-brand-cream px-4 py-3 text-left">
      <p className="text-xs text-brand-navy leading-relaxed">{message}</p>
      <Link
        to={loggedIn ? '/company/dashboard' : '/company/login'}
        onClick={onNavigate}
        className="mt-2 inline-block text-xs font-bold tracking-[0.12em] uppercase text-brand-gold hover:text-brand-navy transition-colors duration-200"
      >
        {loggedIn ? 'Go to Dashboard' : 'Company Login'} <span aria-hidden="true">→</span>
      </Link>
    </div>
  )
}
