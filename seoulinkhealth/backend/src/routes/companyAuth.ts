import { Router, Request, Response, NextFunction } from 'express'
import { body, validationResult } from 'express-validator'
import crypto from 'crypto'
import jwt, { type SignOptions } from 'jsonwebtoken'
import prisma from '../lib/prisma'
import { createError } from '../middleware/errorHandler'
import { requireCompanyAuth, type CompanyAuthRequest } from '../middleware/companyAuth'
import { sendOTPEmail, sendWelcomeEmail, sendTempPasswordEmail } from '../utils/mailer'

const router = Router()

/* ─── Helpers ───────────────────────────────────────────────────────────── */
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex')
}

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

function generateTempPassword(): string {
  return crypto.randomBytes(6).toString('base64url').slice(0, 12)
}

/* ─── POST /register ────────────────────────────────────────────────────── */
router.post(
  '/register',
  [
    body('companyName').trim().isLength({ min: 2, max: 200 }).withMessage('Company name must be 2-200 characters.'),
    body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email address.'),
    body('password').isLength({ min: 8, max: 128 }).withMessage('Password must be at least 8 characters.'),
    body('contactPerson').trim().isLength({ min: 2, max: 100 }).withMessage('Contact person name is required (2-100 chars).'),
    body('telephone').optional().trim(),
    body('dialCode').optional().trim(),
    body('country').optional().trim(),
    body('industry').optional().trim(),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return next(createError('Validation failed.', 400, errors.array()))
      }

      const { companyName, email, password, contactPerson, telephone, dialCode, country, industry } = req.body

      // Check if company already exists
      const existing = await prisma.company.findUnique({ where: { email } })
      if (existing) {
        return next(createError('An account with this email already exists.', 409))
      }

      // Create company
      const company = await prisma.company.create({
        data: {
          companyName,
          email,
          passwordHash: hashPassword(password),
          contactPerson,
          telephone: telephone ?? '',
          dialCode: dialCode ?? '+82',
          country: country ?? '',
          industry: industry ?? '',
        },
      })

      // Send welcome email (non-blocking)
      sendWelcomeEmail(email, companyName).catch((err: unknown) => {
        console.error('[Mailer] Failed to send welcome email:', err)
      })

      res.status(201).json({
        success: true,
        message: 'Registration successful. Please log in to continue.',
        id: company.id,
      })
    } catch (err) {
      next(err)
    }
  }
)

/* ─── POST /login ───────────────────────────────────────────────────────── */
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email address.'),
    body('password').notEmpty().withMessage('Password is required.'),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return next(createError('Validation failed.', 400, errors.array()))
      }

      const { email, password } = req.body

      const company = await prisma.company.findUnique({ where: { email } })
      if (!company || company.passwordHash !== hashPassword(password)) {
        return next(createError('Invalid email or password.', 401))
      }

      // Generate 6-digit OTP
      const otpCode = generateOTP()
      const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

      await prisma.company.update({
        where: { id: company.id },
        data: { otpCode, otpExpiresAt },
      })

      // Send OTP email (non-blocking)
      sendOTPEmail(email, otpCode).catch((err: unknown) => {
        console.error('[Mailer] Failed to send OTP email:', err)
      })

      res.json({
        success: true,
        message: 'OTP sent to your email. Please verify to complete login.',
        requiresOTP: true,
      })
    } catch (err) {
      next(err)
    }
  }
)

/* ─── POST /verify-otp ──────────────────────────────────────────────────── */
router.post(
  '/verify-otp',
  [
    body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email address.'),
    body('otpCode').trim().isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits.'),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return next(createError('Validation failed.', 400, errors.array()))
      }

      const { email, otpCode } = req.body

      const company = await prisma.company.findUnique({ where: { email } })
      if (!company) {
        return next(createError('Invalid email or OTP.', 401))
      }

      // Verify OTP
      if (!company.otpCode || company.otpCode !== otpCode) {
        return next(createError('Invalid OTP code.', 401))
      }

      if (!company.otpExpiresAt || new Date() > company.otpExpiresAt) {
        return next(createError('OTP has expired. Please log in again.', 401))
      }

      // Clear OTP
      await prisma.company.update({
        where: { id: company.id },
        data: { otpCode: null, otpExpiresAt: null },
      })

      // Generate JWT
      const expiresIn = '24h' as SignOptions['expiresIn']
      const token = jwt.sign(
        { sub: company.id, role: 'company' },
        process.env.JWT_SECRET!,
        { expiresIn }
      )

      res.json({
        success: true,
        token,
        company: {
          id: company.id,
          email: company.email,
          companyName: company.companyName,
          contactPerson: company.contactPerson,
          tempPassword: company.tempPassword,
          telephone: company.telephone,
          dialCode: company.dialCode,
          country: company.country,
          industry: company.industry,
        },
      })
    } catch (err) {
      next(err)
    }
  }
)

/* ─── POST /forgot-password ─────────────────────────────────────────────── */
router.post(
  '/forgot-password',
  [body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email address.')],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return next(createError('Validation failed.', 400, errors.array()))
      }

      const { email } = req.body

      const company = await prisma.company.findUnique({ where: { email } })
      if (!company) {
        // Return success even if not found (prevent email enumeration)
        res.json({
          success: true,
          message: 'If an account with that email exists, a temporary password has been sent.',
        })
        return
      }

      const tempPassword = generateTempPassword()

      await prisma.company.update({
        where: { id: company.id },
        data: {
          passwordHash: hashPassword(tempPassword),
          tempPassword: true,
        },
      })

      // Send temp password email (non-blocking)
      sendTempPasswordEmail(email, tempPassword).catch((err: unknown) => {
        console.error('[Mailer] Failed to send temp password email:', err)
      })

      res.json({
        success: true,
        message: 'If an account with that email exists, a temporary password has been sent.',
      })
    } catch (err) {
      next(err)
    }
  }
)

/* ─── GET /me ───────────────────────────────────────────────────────────── */
router.get('/me', requireCompanyAuth, async (req: CompanyAuthRequest, res: Response, next: NextFunction) => {
  try {
    const company = await prisma.company.findUnique({
      where: { id: req.companyId },
      select: {
        id: true,
        email: true,
        companyName: true,
        contactPerson: true,
        telephone: true,
        dialCode: true,
        country: true,
        industry: true,
        isVerified: true,
        tempPassword: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!company) {
      return next(createError('Company not found.', 404))
    }

    res.json({ success: true, company })
  } catch (err) {
    next(err)
  }
})

/* ─── PATCH /me ─────────────────────────────────────────────────────────── */
router.patch(
  '/me',
  requireCompanyAuth,
  [
    body('companyName').optional().trim().isLength({ min: 2, max: 200 }),
    body('contactPerson').optional().trim().isLength({ min: 2, max: 100 }),
    body('telephone').optional().trim(),
    body('dialCode').optional().trim(),
    body('country').optional().trim(),
    body('industry').optional().trim(),
    body('newPassword').optional().isLength({ min: 8, max: 128 }).withMessage('Password must be at least 8 characters.'),
  ],
  async (req: CompanyAuthRequest, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return next(createError('Validation failed.', 400, errors.array()))
      }

      const { companyName, contactPerson, telephone, dialCode, country, industry, newPassword } = req.body

      const updateData: Record<string, unknown> = {}
      if (companyName !== undefined) updateData.companyName = companyName
      if (contactPerson !== undefined) updateData.contactPerson = contactPerson
      if (telephone !== undefined) updateData.telephone = telephone
      if (dialCode !== undefined) updateData.dialCode = dialCode
      if (country !== undefined) updateData.country = country
      if (industry !== undefined) updateData.industry = industry

      if (newPassword) {
        updateData.passwordHash = hashPassword(newPassword)
        updateData.tempPassword = false
      }

      const company = await prisma.company.update({
        where: { id: req.companyId },
        data: updateData,
        select: {
          id: true,
          email: true,
          companyName: true,
          contactPerson: true,
          telephone: true,
          dialCode: true,
          country: true,
          industry: true,
          isVerified: true,
          tempPassword: true,
          createdAt: true,
          updatedAt: true,
        },
      })

      res.json({ success: true, company })
    } catch (err) {
      next(err)
    }
  }
)

export default router
