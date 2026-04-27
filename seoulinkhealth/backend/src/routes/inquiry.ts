import { Router, Request, Response, NextFunction } from 'express'
import { body, validationResult } from 'express-validator'
import prisma from '../lib/prisma'
import { sendInquiryNotification, sendSubmissionConfirmation, sendTempPasswordEmail, sendWelcomeEmail } from '../utils/mailer'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { createError } from '../middleware/errorHandler'

const router = Router()

/* ─── Validation rules ───────────────────────────────────────────────────── */
const inquiryValidation = [
  body('fullName').trim().isLength({ min: 2, max: 100 }).withMessage('Full name must be 2–100 characters.'),
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email address.'),
  body('dialCode').trim().notEmpty().withMessage('Country code is required.'),
  body('telephone')
    .trim()
    .isLength({ min: 5, max: 20 })
    .matches(/^[\d\s\-().]+$/)
    .withMessage('Please enter a valid phone number.'),
  body('currentEmployment').trim().isLength({ min: 2, max: 500 }).withMessage('Current employment is required.'),
  body('professionalExperiences').trim().isLength({ min: 10, max: 2000 }).withMessage('Please describe your experience (10–2000 chars).'),
  body('inquirySubject').trim().isLength({ min: 3, max: 200 }).withMessage('Subject is required (3–200 chars).'),
  body('inquiryDescription').trim().isLength({ min: 20, max: 3000 }).withMessage('Description is required (20–3000 chars).'),
  body('additionalComments').optional().trim().isLength({ max: 1000 }).withMessage('Additional comments must be under 1000 chars.'),
  // Honeypot
  body('website_url').custom((val) => {
    if (val && val.length > 0) throw new Error('Spam detected.')
    return true
  }),
]

/* ─── POST /api/inquiry ──────────────────────────────────────────────────── */
router.post('/', inquiryValidation, async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Honeypot fast-exit
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
      currentEmployment, professionalExperiences,
      inquirySubject, inquiryDescription, additionalComments,
    } = req.body

    // Persist to DB
    const submission = await prisma.inquirySubmission.create({
      data: {
        fullName,
        email,
        dialCode,
        telephone,
        currentEmployment,
        experiences: professionalExperiences,
        inquirySubject,
        inquiryDescription,
        additionalComments: additionalComments ?? null,
        status: 'New',
      },
    })

    // Send email notifications (non-blocking)
    sendInquiryNotification({
      fullName, email, dialCode, telephone,
      currentEmployment, professionalExperiences,
      inquirySubject, inquiryDescription, additionalComments,
    }).catch(() => {})
    sendSubmissionConfirmation(email, fullName, 'inquiry').catch(() => {})

    // Auto-create company account if not exists
    const existingCompany = await prisma.company.findUnique({ where: { email } })
    if (!existingCompany) {
      const tempPw = crypto.randomBytes(4).toString('hex')
      const hashedPw = await bcrypt.hash(tempPw, 12)
      await prisma.company.create({
        data: {
          email,
          password: hashedPw,
          companyName: currentEmployment || fullName,
          contactPerson: fullName,
          telephone: telephone ?? '',
          dialCode: dialCode ?? '+82',
          tempPassword: true,
        },
      })
      sendTempPasswordEmail(email, tempPw).catch(() => {})
      sendWelcomeEmail(email, currentEmployment || fullName).catch(() => {})
    }

    res.status(201).json({
      success: true,
      message: 'Inquiry submitted successfully.',
      id: submission.id,
    })
  } catch (err) {
    next(err)
  }
})

export default router
