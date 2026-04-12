/**
 * SEOULINKHEALTH — Utility Functions
 */

/**
 * Generates a simple unique ID for submissions.
 * Replace with UUID library (e.g., `crypto.randomUUID()`) in production.
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

/**
 * Formats a date string to a readable format.
 */
export function formatDate(isoString: string): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  }).format(new Date(isoString))
}

/**
 * Validates that an email address has a basic valid format.
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

/**
 * Truncates a string to maxLength with an ellipsis.
 */
export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.slice(0, maxLength).trimEnd() + '…'
}

/**
 * Classnames utility — combines class strings, filtering falsy values.
 */
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}
