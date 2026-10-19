import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { usePageTitle } from '@/hooks/usePageTitle'
import { useToast } from '@/store/toastStore'
import { api } from '@/utils/api'
import AuthBackground from '@/components/auth/AuthBackground'
import './Auth.css'

interface ResetForm {
  newPassword: string
  confirmPassword: string
}

/* ─── Page reached from the emailed reset link (/company/reset-password?token=…) ── */
export default function CompanyResetPasswordPage() {
  usePageTitle('Reset Password')
  const [params] = useSearchParams()
  const token = params.get('token') ?? ''
  const navigate = useNavigate()
  const toast = useToast()
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetForm>()

  const onSubmit = async (data: ResetForm) => {
    setLoading(true)
    try {
      await api.post('/company/auth/reset-password', { token, newPassword: data.newPassword })
      toast.success('Your password has been reset. Please sign in.')
      navigate('/company/login', { replace: true })
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to reset password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page auth-page--company">
      <AuthBackground />

      <div className="auth-shell">
        <div className="auth-brand">
          <Link to="/" aria-label="SEOULINKHEALTH Home">
            <img
              src="/seoulinkhealth-logo-transparent.png"
              alt="SEOULINKHEALTH — K-Health Business Platform"
              className="auth-brand-logo"
            />
          </Link>
        </div>

        <div className="auth-card">
          <div className="auth-card__header">
            <span className="auth-eyebrow">Client Portal</span>
            <h1 className="auth-card__title">Reset Password</h1>
            <p className="auth-card__desc">
              {token
                ? 'Choose a new password for your account.'
                : 'This reset link is invalid. Please request a new one from the login page.'}
            </p>
          </div>

          {token && (
            <form onSubmit={handleSubmit(onSubmit)} noValidate className="auth-form">
              <div className="auth-field">
                <label htmlFor="reset-new-password" className="auth-label">New Password</label>
                <input
                  {...register('newPassword', {
                    required: 'Password is required',
                    minLength: { value: 8, message: 'Minimum 8 characters' },
                  })}
                  id="reset-new-password"
                  type="password"
                  autoComplete="new-password"
                  className={`auth-input auth-input--plain${errors.newPassword ? ' has-error' : ''}`}
                  placeholder="Minimum 8 characters"
                />
                {errors.newPassword && <p className="auth-error" role="alert">{errors.newPassword.message}</p>}
              </div>

              <div className="auth-field">
                <label htmlFor="reset-confirm-password" className="auth-label">Confirm New Password</label>
                <input
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: (v) => v === watch('newPassword') || 'Passwords do not match',
                  })}
                  id="reset-confirm-password"
                  type="password"
                  autoComplete="new-password"
                  className={`auth-input auth-input--plain${errors.confirmPassword ? ' has-error' : ''}`}
                  placeholder="Re-enter password"
                />
                {errors.confirmPassword && <p className="auth-error" role="alert">{errors.confirmPassword.message}</p>}
              </div>

              <button type="submit" disabled={loading} className="auth-submit-btn">
                <span>{loading ? 'Saving...' : 'Set New Password'}</span>
                <span className="auth-submit-btn__arrow" aria-hidden="true">→</span>
              </button>
            </form>
          )}
        </div>

        <div className="auth-footer-links">
          <p className="auth-register-text">
            <Link to="/company/login">← Back to Company Login</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
