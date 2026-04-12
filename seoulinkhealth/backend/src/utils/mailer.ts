import nodemailer from 'nodemailer'

/* ─── Transport ──────────────────────────────────────────────────────────── */
function createTransport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST!,
    port: Number(process.env.SMTP_PORT ?? 465),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER!,
      pass: process.env.SMTP_PASS!,
    },
  })
}

const COMPANY_EMAIL = process.env.COMPANY_EMAIL!
const DIRECTOR_NAME = process.env.DIRECTOR_NAME ?? 'Byung-Joo Kim'

/* ─── Shared HTML wrapper ────────────────────────────────────────────────── */
function htmlWrapper(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${title}</title>
<style>
  body { font-family: 'Segoe UI', Arial, sans-serif; background:#f4f4f4; margin:0; padding:0; }
  .container { max-width:620px; margin:32px auto; background:#fff; border-radius:8px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,.08); }
  .header { background:#0D1B2A; color:#fff; padding:28px 32px; }
  .header h1 { margin:0 0 4px; font-size:18px; letter-spacing:0.04em; }
  .header p { margin:0; color:#B8965A; font-size:12px; letter-spacing:0.1em; text-transform:uppercase; }
  .body { padding:28px 32px; color:#374151; font-size:14px; line-height:1.7; }
  .field { margin-bottom:16px; }
  .field label { display:block; font-size:11px; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; color:#6B7280; margin-bottom:3px; }
  .field p { margin:0; color:#111827; font-size:14px; background:#F9FAFB; border:1px solid #E5E7EB; border-radius:6px; padding:8px 12px; white-space:pre-wrap; }
  .divider { border:none; border-top:1px solid #E5E7EB; margin:20px 0; }
  .section-title { font-size:12px; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; color:#1A3A5C; margin:20px 0 12px; }
  .badge { display:inline-block; background:#0D1B2A; color:#B8965A; font-size:11px; font-weight:700; letter-spacing:0.08em; padding:4px 10px; border-radius:20px; }
  .footer { background:#F9FAFB; padding:16px 32px; font-size:12px; color:#9CA3AF; text-align:center; border-top:1px solid #E5E7EB; }
</style>
</head>
<body>
<div class="container">
  <div class="header">
    <p>SEOULINKHEALTH</p>
    <h1>${title}</h1>
  </div>
  <div class="body">${body}</div>
  <div class="footer">SEOULINKHEALTH · K-HEALTH BUSINESS PLATFORM · www.seoulinkhealth.com</div>
</div>
</body>
</html>`
}

/* ─── Application notification ───────────────────────────────────────────── */
export interface ApplicationData {
  fullName: string
  email: string
  dialCode: string
  telephone: string
  professionalExperiences: string
  education: string
  specialty: string
  countryOfOrigin: string
}

export async function sendApplicationNotification(data: ApplicationData): Promise<void> {
  const transport = createTransport()

  const body = `
    <p>A new Expert Network application has been submitted.</p>
    <hr class="divider" />

    <p class="section-title">Contact Information</p>
    <div class="field"><label>Full Name</label><p>${esc(data.fullName)}</p></div>
    <div class="field"><label>Email</label><p>${esc(data.email)}</p></div>
    <div class="field"><label>Telephone</label><p>${esc(data.dialCode)} ${esc(data.telephone)}</p></div>
    <div class="field"><label>Country of Origin</label><p>${esc(data.countryOfOrigin)}</p></div>

    <p class="section-title">Professional Profile</p>
    <div class="field"><label>Specialty</label><p>${esc(data.specialty)}</p></div>
    <div class="field"><label>Professional Experiences</label><p>${esc(data.professionalExperiences)}</p></div>
    <div class="field"><label>Education</label><p>${esc(data.education)}</p></div>

    <hr class="divider" />
    <p>Please log in to the admin dashboard to review this application and update its status.</p>
  `

  await transport.sendMail({
    from: `"SEOULINKHEALTH System" <${COMPANY_EMAIL}>`,
    to: COMPANY_EMAIL,
    subject: `[New Application] Expert Network — ${data.fullName}`,
    html: htmlWrapper('New Expert Network Application', body),
  })
}

/* ─── Inquiry notification ───────────────────────────────────────────────── */
export interface InquiryData {
  fullName: string
  email: string
  dialCode: string
  telephone: string
  currentEmployment: string
  professionalExperiences: string
  inquirySubject: string
  inquiryDescription: string
  additionalComments?: string
}

export async function sendInquiryNotification(data: InquiryData): Promise<void> {
  const transport = createTransport()

  const body = `
    <p>A new inquiry has been submitted via the SEOULINKHEALTH website.</p>
    <hr class="divider" />

    <p class="section-title">Contact Information</p>
    <div class="field"><label>Full Name</label><p>${esc(data.fullName)}</p></div>
    <div class="field"><label>Email</label><p>${esc(data.email)}</p></div>
    <div class="field"><label>Telephone</label><p>${esc(data.dialCode)} ${esc(data.telephone)}</p></div>
    <div class="field"><label>Current Employment</label><p>${esc(data.currentEmployment)}</p></div>
    <div class="field"><label>Professional Experiences</label><p>${esc(data.professionalExperiences)}</p></div>

    <p class="section-title">Inquiry Detail</p>
    <div class="field"><label>Subject</label><p>${esc(data.inquirySubject)}</p></div>
    <div class="field"><label>Description</label><p>${esc(data.inquiryDescription)}</p></div>
    ${data.additionalComments ? `<div class="field"><label>Additional Comments</label><p>${esc(data.additionalComments)}</p></div>` : ''}

    <hr class="divider" />
    <p>Please log in to the admin dashboard to review this inquiry. Response is expected within two business days.</p>
  `

  await transport.sendMail({
    from: `"SEOULINKHEALTH System" <${COMPANY_EMAIL}>`,
    to: COMPANY_EMAIL,
    replyTo: data.email,
    subject: `[New Inquiry] ${data.inquirySubject} — ${data.fullName}`,
    html: htmlWrapper('New Advisory Inquiry', body),
  })
}

/* ─── Helpers ────────────────────────────────────────────────────────────── */
function esc(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/\n/g, '<br/>')
}
