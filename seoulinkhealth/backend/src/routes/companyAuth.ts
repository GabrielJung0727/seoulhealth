import { Router, Request, Response, NextFunction } from 'express'
import { body, validationResult } from 'express-validator'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '../lib/prisma'
import { createError } from '../middleware/errorHandler'

/* ─── Company Auth Request ──────────────────────────────────────────────── */
interface CompanyAuthRequest extends Request {
  companyId?: string
}

/**
 * Middleware: verify JWT with role='company', extract companyId from payload.sub
 */
function requireCompanyAuth(
  req: CompanyAuthRequest,
  res: Response,
  next: NextFunction
): void {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return next(createError('No token provided.', 401))
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as {
      sub: string
      role: string
    }
    if (payload.role !== 'company') return next(createError('Not a company account.', 403))
    req.companyId = payload.sub
    next()
  } catch {
    next(createError('Invalid or expired token.', 401))
  }
}

/* ═══════════════════════════════════════════════════════════════════════════
   Company Auth Router — mounted at /api/company/auth
   ═══════════════════════════════════════════════════════════════════════════ */
const router = Router()

/* ─── POST /register ───────────────────────────────────────────────────── */
router.post(
  '/register',
  [
    body('companyName').notEmpty().trim().withMessage('Company name is required.'),
    body('contactPerson').notEmpty().trim().withMessage('Contact person is required.'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required.'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters.'),
    body('dialCode').notEmpty().trim().withMessage('Dial code is required.'),
    body('telephone').notEmpty().trim().withMessage('Telephone is required.'),
    body('country').notEmpty().trim().withMessage('Country is required.'),
    body('industry').notEmpty().trim().withMessage('Industry is required.'),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return next(createError('Validation failed.', 400, errors.array()))
      }

      const { companyName, contactPerson, email, password, dialCode, telephone, country, industry } = req.body

      // Check email uniqueness
      const existing = await prisma.company.findUnique({ where: { email } })
      if (existing) {
        return next(createError('Email is already registered.', 409))
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12)

      await prisma.company.create({
        data: {
          companyName,
          contactPerson,
          email,
          password: hashedPassword,
          dialCode,
          telephone,
          country,
          industry,
        },
      })

      res.status(201).json({ success: true, message: 'Company registered successfully.' })
    } catch (err) {
      next(err)
    }
  }
)

/* ─── POST /login ──────────────────────────────────────────────────────── */
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required.'),
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
      if (!company) {
        return next(createError('Invalid credentials.', 401))
      }

      // Verify password
      const isValid = await bcrypt.compare(password, company.password)
      if (!isValid) {
        return next(createError('Invalid credentials.', 401))
      }

      // Generate 6-digit OTP
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString()
      const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

      // Hash OTP before storing
      const otpHash = crypto.createHash('sha256').update(otpCode).digest('hex')

      await prisma.company.update({
        where: { id: company.id },
        data: { otpCode: otpHash, otpExpiresAt },
      })

      // TODO: Send OTP via email — for now just store it
      res.json({ success: true, requiresOTP: true, message: 'OTP sent to your email.' })
    } catch (err) {
      next(err)
    }
  }
)

/* ─── POST /verify-otp ─────────────────────────────────────────────────── */
router.post(
  '/verify-otp',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required.'),
    body('otpCode').notEmpty().trim().withMessage('OTP code is required.'),
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
        return next(createError('Invalid credentials.', 401))
      }

      // Verify OTP matches and is not expired (compare hashed values)
      const otpHash = crypto.createHash('sha256').update(otpCode).digest('hex')
      if (!company.otpCode || company.otpCode !== otpHash) {
        return next(createError('Invalid OTP code.', 401))
      }

      if (!company.otpExpiresAt || new Date() > company.otpExpiresAt) {
        return next(createError('OTP code has expired.', 401))
      }

      // Clear OTP from DB
      await prisma.company.update({
        where: { id: company.id },
        data: { otpCode: null, otpExpiresAt: null },
      })

      // Generate JWT
      const token = jwt.sign(
        { sub: company.id, role: 'company' },
        process.env.JWT_SECRET!,
        { expiresIn: '24h' }
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

/* ─── POST /forgot-password ────────────────────────────────────────────── */
router.post(
  '/forgot-password',
  [body('email').isEmail().normalizeEmail().withMessage('Valid email is required.')],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const errors = validationResult(req)
      if (!errors.isEmpty()) {
        return next(createError('Validation failed.', 400, errors.array()))
      }

      const { email } = req.body

      const company = await prisma.company.findUnique({ where: { email } })
      if (!company) {
        // Return success even if email not found (prevent enumeration)
        res.json({ success: true, message: 'If the email exists, a temporary password has been sent.' })
        return
      }

      // Generate random 8-character temp password
      const tempPassword = crypto.randomBytes(4).toString('hex') // 8 hex chars

      // Hash and save
      const hashedTemp = await bcrypt.hash(tempPassword, 12)
      await prisma.company.update({
        where: { id: company.id },
        data: { password: hashedTemp, tempPassword: true },
      })

      // TODO: Send temp password via email

      res.json({ success: true, message: 'If the email exists, a temporary password has been sent.' })
    } catch (err) {
      next(err)
    }
  }
)

/* ─── GET /me — company profile ────────────────────────────────────────── */
router.get(
  '/me',
  requireCompanyAuth,
  async (req: CompanyAuthRequest, res: Response, next: NextFunction) => {
    try {
      const company = await prisma.company.findUnique({
        where: { id: req.companyId },
        select: {
          id: true,
          companyName: true,
          contactPerson: true,
          email: true,
          telephone: true,
          dialCode: true,
          country: true,
          industry: true,
          tempPassword: true,
          createdAt: true,
          updatedAt: true,
        },
      })

      if (!company) {
        return next(createError('Company not found.', 404))
      }

      res.json({ success: true, data: company })
    } catch (err) {
      next(err)
    }
  }
)

/* ─── PATCH /me — update company profile ───────────────────────────────── */
router.patch(
  '/me',
  requireCompanyAuth,
  async (req: CompanyAuthRequest, res: Response, next: NextFunction) => {
    try {
      const company = await prisma.company.findUnique({
        where: { id: req.companyId },
      })

      if (!company) {
        return next(createError('Company not found.', 404))
      }

      const { companyName, contactPerson, dialCode, telephone, country, industry, newPassword, currentPassword } = req.body

      // If changing password, verify current password first
      if (newPassword) {
        if (!currentPassword) {
          return next(createError('Current password is required to set a new password.', 400))
        }

        const passwordMatch = await bcrypt.compare(currentPassword, company.password)
        if (!passwordMatch) {
          return next(createError('Current password is incorrect.', 401))
        }

        if (newPassword.length < 8) {
          return next(createError('New password must be at least 8 characters.', 400))
        }
      }

      // Build update data
      const updateData: Record<string, unknown> = {}
      if (companyName !== undefined) updateData.companyName = companyName
      if (contactPerson !== undefined) updateData.contactPerson = contactPerson
      if (dialCode !== undefined) updateData.dialCode = dialCode
      if (telephone !== undefined) updateData.telephone = telephone
      if (country !== undefined) updateData.country = country
      if (industry !== undefined) updateData.industry = industry

      if (newPassword) {
        updateData.password = await bcrypt.hash(newPassword, 12)
        updateData.tempPassword = false
      }

      const updated = await prisma.company.update({
        where: { id: req.companyId },
        data: updateData,
        select: {
          id: true,
          companyName: true,
          contactPerson: true,
          email: true,
          telephone: true,
          dialCode: true,
          country: true,
          industry: true,
          tempPassword: true,
          createdAt: true,
          updatedAt: true,
        },
      })

      res.json({ success: true, data: updated })
    } catch (err) {
      next(err)
    }
  }
)

/* ─── GET /inquiries — company's inquiry submissions ───────────────────── */
router.get(
  '/inquiries',
  requireCompanyAuth,
  async (req: CompanyAuthRequest, res: Response, next: NextFunction) => {
    try {
      const company = await prisma.company.findUnique({
        where: { id: req.companyId },
        select: { email: true },
      })

      if (!company) {
        return next(createError('Company not found.', 404))
      }

      // Match inquiries by company email
      const inquiries = await prisma.inquirySubmission.findMany({
        where: { email: company.email },
        orderBy: { createdAt: 'desc' },
      })

      res.json({
        success: true,
        data: inquiries,
        pagination: { total: inquiries.length },
      })
    } catch (err) {
      next(err)
    }
  }
)

/* ─── GET /projects — company's projects ───────────────────────────────── */
router.get(
  '/projects',
  requireCompanyAuth,
  async (req: CompanyAuthRequest, res: Response, next: NextFunction) => {
    try {
      // Project model not yet defined in schema — return empty for now
      res.json({ success: true, data: [] })
    } catch (err) {
      next(err)
    }
  }
)

export default router
