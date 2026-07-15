import { Router } from 'express'
import { register, login, logout } from '../controllers/authController.js'
import { verifyEmail, forgotPassword, resetPassword, resendCode } from '../controllers/verificationController.js'
import { authRateLimiter } from '../middleware/rateLimiter.js'

const router = Router()


router.post('/register', register)
router.post('/login', authRateLimiter, login)
router.post('/logout', logout)
router.post('/verify-email', verifyEmail)
router.post('/forgot-password', forgotPassword)
router.post('/reset-password', resetPassword)
router.post('/resend-code', resendCode)

export default router

