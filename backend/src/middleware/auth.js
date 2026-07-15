import jwt from 'jsonwebtoken'

export const requireAuth = (req, res, next) => {
    const authHeader = req.headers.authorization
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

    if (!token) return res.status(401).json({ error: 'No autenticado' })

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET)
        req.userId = payload.userId
        next()
    } catch {
        res.status(401).json({ error: 'Token inválido o expirado' })
    }
}
