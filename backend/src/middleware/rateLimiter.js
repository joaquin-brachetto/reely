import rateLimit from 'express-rate-limit'

export const authRateLimiter = rateLimit({
    windowMs: parseInt(process.env.LOCKOUT_MINUTES) * 60 * 1000,
    max: parseInt(process.env.MAX_LOGIN_ATTEMPTS),
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: `Demasiados intentos. Intentá de nuevo en ${process.env.LOCKOUT_MINUTES} minutos.`
    }
})