import { Router, Request, Response, NextFunction } from 'express'
import { body, validationResult } from 'express-validator'
import prisma from '../lib/prisma'
import { sendApplicationNotification, sendSubmissionConfirmation, sendTempPasswordEmail, sendWelcomeEmail } from '../utils/mailer'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { createError } from '../middleware/errorHandler'

const router = Router()

/* ─── Validation rules ───────────────────────────────────────────────────── */
const applicationValidation = [
  body('fullName').trim().isLength({ min: 2, max: 100 }).withMessage('Full name must be 2–100 characters.'),
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email address.'),
  body('dialCode').trim().notEmpty().withMessage('Country code is required.'),
  body('telephone')
    .trim()
    .isLength({ min: 5, max: 20 })
    .matches(/^[\d\s\-().]+$/)
    .withMessage('Please enter a valid phone number.'),
  body('professionalExperiences').trim().isLength({ min: 10, max: 2000 }).withMessage('Please describe your professional experience (10–2000 chars).'),
  body('education').trim().isLength({ min: 5, max: 1000 }).withMessage('Please describe your education (5–1000 chars).'),
  body('specialty').trim().isLength({ min: 2, max: 200 }).withMessage('Specialty is required (2–200 chars).'),
  body('countryOfOrigin').trim().notEmpty().withMessage('Country of origin is required.'),
  // Honeypot: must be absent or empty
  body('website_url').custom((val) => {
    if (val && val.length > 0) throw new Error('Spam detected.')
    return true
  }),
]

/* ─── POST /api/apply ────────────────────────────────────────────────────── */
router.post('/', applicationValidation, async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Honeypot fast-exit (silent — appears successful to bots)
    if (req.body.website_url) {
      res.status(200).json({ success: true })
      return
    }

    // Validate
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return next(createError('Validation failed.', 400, errors.array()))
    }

    const {
      fullName, email, dialCode, telephone,
      professionalExperiences, education, specialty, countryOfOrigin,
    } = req.body

    // Persist to DB
    const submission = await prisma.applicationSubmission.create({
      data: {
        fullName,
        email,
        dialCode,
        telephone,
        experiences: professionalExperiences,
        education,
        specialty,
        countryOfOrigin,
        status: 'New',
      },
    })

    // Send email notifications (non-blocking)
    sendApplicationNotification({
      fullName, email, dialCode, telephone,
      professionalExperiences, education, specialty, countryOfOrigin,
    }).catch(() => {})
    sendSubmissionConfirmation(email, fullName, 'application').catch(() => {})

    // Auto-create company account if not exists
    const existingCompany = await prisma.company.findUnique({ where: { email } })
    if (!existingCompany) {
      const tempPw = crypto.randomBytes(4).toString('hex')
      const hashedPw = await bcrypt.hash(tempPw, 12)
      await prisma.company.create({
        data: {
          email,
          password: hashedPw,
          companyName: fullName,
          contactPerson: fullName,
          telephone: telephone ?? '',
          dialCode: dialCode ?? '+82',
          country: countryOfOrigin ?? '',
          industry: specialty ?? '',
          tempPassword: true,
        },
      })
      sendTempPasswordEmail(email, tempPw).catch(() => {})
      sendWelcomeEmail(email, fullName).catch(() => {})
    }

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully.',
      id: submission.id,
    })
  } catch (err) {
    next(err)
  }
})

export default router
