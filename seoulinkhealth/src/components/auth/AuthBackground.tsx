/**
 * Shared decorative background for the company auth pages
 * (Company Login, Company Registration, Reset Password).
 * Place inside a `.auth-page` container; styles live in pages/Auth.css.
 */
export default function AuthBackground() {
  return (
    <>
      {/* ── Background: Seoul skyline, gradient overlay, architectural grid ── */}
      <img
        className="auth-bg-image"
        src="/images/seoulinkhealth-hero.png"
        alt=""
        aria-hidden="true"
      />
      <div className="auth-bg-overlay" aria-hidden="true" />
      <div className="auth-bg-grid" aria-hidden="true" />

      {/* Decorative orbital arcs & botanical corner */}
      <svg
        className="auth-bg-arcs"
        viewBox="0 0 1440 900"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <circle cx="180" cy="450" r="380" fill="none" stroke="#C99A3D" strokeWidth="0.8" strokeDasharray="3 9" />
        <circle cx="1260" cy="450" r="460" fill="none" stroke="#C99A3D" strokeWidth="0.8" />
        <path d="M0 640Q440 380 920 620T1440 460" fill="none" stroke="#af853d" strokeWidth="1.2" />
      </svg>
      <svg className="auth-bg-leaf" viewBox="0 0 170 260" aria-hidden="true">
        <path d="M160 260Q96 170 112 18M126 214Q44 220 16 168Q84 158 126 214ZM110 170Q150 140 160 92Q110 104 110 170ZM108 126Q52 122 34 70Q92 80 108 126ZM110 84Q140 44 124 6Q94 40 110 84Z" />
        <path d="M16 168L126 214M34 70L108 126M160 92L110 170M124 6L110 84M40 172L104 204M58 84L100 118" />
      </svg>
    </>
  )
}
