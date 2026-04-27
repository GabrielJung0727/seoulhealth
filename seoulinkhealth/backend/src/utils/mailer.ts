import nodemailer from 'nodemailer'
import prisma from '../lib/prisma'

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

/* ─── Shared HTML wrapper (SAS-style premium design) ─────────────────────── */
function htmlWrapper(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f0ede8;font-family:'Segoe UI',Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f0ede8;padding:32px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:0;overflow:hidden;">

  <!-- Top Navy Banner with Logo -->
  <tr><td style="background:#0D1B2A;padding:24px 40px;">
    <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td style="color:#ffffff;font-size:12px;font-weight:700;letter-spacing:3px;text-transform:uppercase;">
        SEOU<span style="color:#D4C4A8;">L</span><span style="color:#B8965A;">INK</span>HEALTH
      </td>
      <td align="right" style="color:#B8965A;font-size:11px;font-weight:600;letter-spacing:1px;">
        K-HEALTH BUSINESS PLATFORM
      </td>
    </tr>
    </table>
  </td></tr>

  <!-- Gold Accent Line -->
  <tr><td style="background:#B8965A;height:3px;font-size:0;line-height:0;">&nbsp;</td></tr>

  <!-- Title Section -->
  <tr><td style="padding:32px 40px 0;">
    <h1 style="margin:0;font-size:22px;font-weight:700;color:#0D1B2A;letter-spacing:-0.02em;">${title}</h1>
  </td></tr>

  <!-- Body Content -->
  <tr><td style="padding:16px 40px 32px;">
    <div style="color:#4B5563;font-size:14px;line-height:1.8;">${body}</div>
  </td></tr>

  <!-- Footer Divider -->
  <tr><td style="padding:0 40px;">
    <hr style="border:none;border-top:1px solid #E5E7EB;margin:0;" />
  </td></tr>

  <!-- Footer -->
  <tr><td style="padding:20px 40px 24px;">
    <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td style="font-size:11px;color:#9CA3AF;line-height:1.5;">
        SEOULINKHEALTH · K-HEALTH BUSINESS PLATFORM<br/>
        <a href="https://www.seoulinkhealth.com" style="color:#B8965A;text-decoration:none;">www.seoulinkhealth.com</a>
      </td>
    </tr>
    </table>
  </td></tr>

  <!-- Confidentiality Notice -->
  <tr><td style="background:#F9FAFB;padding:16px 40px;">
    <p style="margin:0;font-size:10px;color:#B0B0B0;line-height:1.5;font-family:'Courier New',monospace;">
      This e-mail (including any attached documents) is proprietary and confidential and may contain legally privileged information. It is intended for the named recipient(s) only. If you are not the intended recipient, you may not review, retain, copy or distribute this message.
    </p>
  </td></tr>

</table>
</td></tr>
</table>
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
  const subject = `[New Application] Expert Network — ${data.fullName}`

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

  try {
    await transport.sendMail({
      from: `"SEOULINKHEALTH System" <${COMPANY_EMAIL}>`,
      to: COMPANY_EMAIL,
      subject,
      html: htmlWrapper('New Expert Network Application', body),
    })
    await logEmail(COMPANY_EMAIL, subject, 'admin_notification', 'sent')
  } catch (err) {
    await logEmail(COMPANY_EMAIL, subject, 'admin_notification', 'failed', err instanceof Error ? err.message : String(err))
    throw err
  }
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
  const subject = `[New Inquiry] ${data.inquirySubject} — ${data.fullName}`

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

  try {
    await transport.sendMail({
      from: `"SEOULINKHEALTH System" <${COMPANY_EMAIL}>`,
      to: COMPANY_EMAIL,
      replyTo: data.email,
      subject,
      html: htmlWrapper('New Advisory Inquiry', body),
    })
    await logEmail(COMPANY_EMAIL, subject, 'admin_notification', 'sent')
  } catch (err) {
    await logEmail(COMPANY_EMAIL, subject, 'admin_notification', 'failed', err instanceof Error ? err.message : String(err))
    throw err
  }
}

/* ─── Email Logging ─────────────────────────────────────────────────────── */
async function logEmail(
  to: string,
  subject: string,
  type: string,
  status: 'sent' | 'failed',
  error?: string
): Promise<void> {
  try {
    await prisma.emailLog.create({
      data: { to, subject, type, status, error: error ?? null },
    })
  } catch (logErr) {
    console.error('[EmailLog] Failed to write log:', logErr)
  }
}

/** Public helper so other modules (e.g. OTP, password-reset) can log too */
export { logEmail }

/* ─── OTP Email ──────────────────────────────────────────────────────────── */
export async function sendOTPEmail(to: string, otpCode: string): Promise<void> {
  const subject = 'SEOULINKHEALTH — Your Verification Code'
  const html = htmlWrapper(subject, `
    <div style="padding:32px 28px;">
      <h2 style="color:#0D1B2A;margin:0 0 16px;">Verification Code</h2>
      <p style="color:#555;line-height:1.6;">Use the following code to complete your login:</p>
      <div style="text-align:center;margin:24px 0;">
        <span style="display:inline-block;font-size:36px;font-weight:bold;letter-spacing:8px;color:#0D1B2A;background:#f0f0f0;padding:16px 32px;border-radius:8px;">${otpCode}</span>
      </div>
      <p style="color:#888;font-size:13px;">This code expires in 10 minutes. If you did not request this, please ignore this email.</p>
    </div>
  `)
  try {
    const transport = createTransport()
    await transport.sendMail({ from: process.env.SMTP_USER, to, subject, html })
    await logEmail(to, subject, 'otp', 'sent')
  } catch (err) {
    await logEmail(to, subject, 'otp', 'failed', (err as Error).message)
    console.error('[Mailer] OTP send failed:', (err as Error).message)
  }
}

/* ─── Welcome Email ──────────────────────────────────────────────────────── */
export async function sendWelcomeEmail(to: string, companyName: string): Promise<void> {
  const subject = 'Welcome to SEOULINKHEALTH'
  const html = htmlWrapper(subject, `
    <div style="padding:32px 28px;">
      <h2 style="color:#0D1B2A;margin:0 0 16px;">Welcome, ${esc(companyName)}!</h2>
      <p style="color:#555;line-height:1.6;">Thank you for registering with SEOULINKHEALTH. Your account has been created successfully.</p>
      <p style="color:#555;line-height:1.6;">You can now log in to access your company dashboard, submit inquiries, and communicate with our team.</p>
      <div style="text-align:center;margin:24px 0;">
        <a href="https://doublej.app/company/login" style="display:inline-block;background:#0D1B2A;color:#fff;text-decoration:none;padding:12px 32px;border-radius:6px;font-weight:bold;">Go to Dashboard</a>
      </div>
    </div>
  `)
  try {
    const transport = createTransport()
    await transport.sendMail({ from: process.env.SMTP_USER, to, subject, html })
    await logEmail(to, subject, 'welcome', 'sent')
  } catch (err) {
    await logEmail(to, subject, 'welcome', 'failed', (err as Error).message)
  }
}

/* ─── Temp Password Email ────────────────────────────────────────────────── */
export async function sendTempPasswordEmail(to: string, tempPassword: string): Promise<void> {
  const subject = 'SEOULINKHEALTH — Your Temporary Password'
  const html = htmlWrapper(subject, `
    <div style="padding:32px 28px;">
      <h2 style="color:#0D1B2A;margin:0 0 16px;">Password Reset</h2>
      <p style="color:#555;line-height:1.6;">Your temporary password is:</p>
      <div style="text-align:center;margin:24px 0;">
        <span style="display:inline-block;font-size:24px;font-weight:bold;color:#0D1B2A;background:#f0f0f0;padding:12px 24px;border-radius:8px;letter-spacing:2px;">${esc(tempPassword)}</span>
      </div>
      <p style="color:#555;line-height:1.6;">Please log in and change your password immediately in Settings.</p>
      <p style="color:#888;font-size:13px;">If you did not request this, please contact us immediately.</p>
    </div>
  `)
  try {
    const transport = createTransport()
    await transport.sendMail({ from: process.env.SMTP_USER, to, subject, html })
    await logEmail(to, subject, 'temp_password', 'sent')
  } catch (err) {
    await logEmail(to, subject, 'temp_password', 'failed', (err as Error).message)
  }
}

/* ─── Form Submission Confirmation to Submitter ──────────────────────────── */
export async function sendSubmissionConfirmation(to: string, name: string, type: 'application' | 'inquiry'): Promise<void> {
  const typeLabel = type === 'application' ? 'Expert Network Application' : 'Service Inquiry'
  const subject = `SEOULINKHEALTH — Your ${typeLabel} Has Been Received`
  const html = htmlWrapper(subject, `
    <div style="padding:32px 28px;">
      <h2 style="color:#0D1B2A;margin:0 0 16px;">Thank You, ${esc(name)}!</h2>
      <p style="color:#555;line-height:1.6;">We have received your ${typeLabel.toLowerCase()}. Our team will review it and respond as soon as possible.</p>
      <p style="color:#555;line-height:1.6;">You can track the status of your submission by logging into your company dashboard.</p>
      <div style="text-align:center;margin:24px 0;">
        <a href="https://doublej.app/company/dashboard" style="display:inline-block;background:#B8965A;color:#0D1B2A;text-decoration:none;padding:12px 32px;border-radius:6px;font-weight:bold;">View Dashboard</a>
      </div>
    </div>
  `)
  try {
    const transport = createTransport()
    await transport.sendMail({ from: process.env.SMTP_USER, to, subject, html })
    await logEmail(to, subject, 'confirmation', 'sent')
  } catch (err) {
    await logEmail(to, subject, 'confirmation', 'failed', (err as Error).message)
  }
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
