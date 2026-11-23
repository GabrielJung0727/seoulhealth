import { Router, Request, Response, NextFunction } from 'express'
import { body, validationResult } from 'express-validator'
import jwt, { type SignOptions } from 'jsonwebtoken'
import { createError } from '../middleware/errorHandler'
import { verifyAdminPassword } from '../lib/adminPassword'

const router = Router()

/**
 * POST /api/auth/login
 *
 * Accepts { password } and returns a signed JWT if the password matches
 * the ADMIN_PASSWORD environment variable.
 *
 * Token expires in 8 hours (configurable via JWT_EXPIRES env var).
 */
router.post(
  '/login',
  [body('password').notEmpty().withMessage('Password is required.')],
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return next(createError('Validation failed.', 400, errors.array()))
    }

    const { password } = req.body

    if (!process.env.ADMIN_PASSWORD) {
      console.error('[Auth] ADMIN_PASSWORD is not set in environment.')
      return next(createError('Server configuration error.', 500))
    }

    try {
      if (!(await verifyAdminPassword(String(password)))) {
        return next(createError('Invalid credentials.', 401))
      }
    } catch (err) {
      return next(err)
    }

    const expiresIn = (process.env.JWT_EXPIRES as SignOptions['expiresIn'] | undefined) ?? '8h'
    const token = jwt.sign({ sub: 'admin' }, process.env.JWT_SECRET!, { expiresIn })

    res.json({ success: true, token })
  }
)

export default router
