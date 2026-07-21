import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import pool from '../db/index.js'
import { sendVerificationEmail } from '../services/emailService.js'

const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString()

export const register = async (req, res) => {
    const { username, email, password } = req.body

    if (!username || !email || !password)
        return res.status(400).json({ error: 'Todos los campos son obligatorios' })

    if (!/^[a-zA-Z0-9_]+$/.test(username))
        return res.status(400).json({ error: 'El username solo puede tener letras, números y _' })

    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/
    if (!passwordRegex.test(password))
        return res.status(400).json({
            error: 'La contraseña debe tener al menos 8 caracteres, una mayúscula y un carácter especial (!@#$%^&*)'
        })

    try {
        const passwordHash = await bcrypt.hash(password, 10)

        const userResult = await pool.query(
            'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email',
            [username, email, passwordHash]
        )

        const user = userResult.rows[0]


        const code = generateCode()
        const expireMins = parseInt(process.env.CODE_EXPIRES_MINUTES || '15')
        const expiresAt = new Date(Date.now() + expireMins * 60 * 1000).toISOString()

        await pool.query(
            'INSERT INTO verification_codes (user_id, code, type, expires_at) VALUES ($1, $2, $3, $4)',
            [user.id, code, 'email_verification', expiresAt]
        )


        await sendVerificationEmail(email, code)


        res.status(201).json({
            message: 'Usuario creado. Revisá tu email para verificar tu cuenta.',
            userId: user.id
        })

    } catch (error) {
        console.error('ERROR EN REGISTER:', error)
        if (error.code === '23505')
            return res.status(409).json({ error: 'El email o usuario ya existe' })
        res.status(500).json({ error: 'Error interno del servidor' })
    }
}

export const login = async (req, res) => {
    const { identifier, password } = req.body

    if (!identifier || !password)
        return res.status(400).json({ error: 'Usuario/email y contraseña requeridos' })

    try {
        const result = await pool.query(
            'SELECT * FROM users WHERE email = $1 OR username = $1',
            [identifier]
        )

        if (result.rows.length === 0)
            return res.status(401).json({ error: 'Credenciales inválidas' })

        const user = result.rows[0]


        const isValid = await bcrypt.compare(password, user.password_hash)
        if (!isValid)
            return res.status(401).json({ error: 'Credenciales inválidas' })

        if (!user.is_verified)
            return res.status(403).json({
                error: 'Cuenta no verificada. Revisá tu email.',
                userId: user.id
            })

        const token = jwt.sign(
            { userId: user.id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        )

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        })

        res.json({
            user: { id: user.id, username: user.username, email: user.email }
        })

    } catch (error) {
        res.status(500).json({ error: 'Error interno del servidor' })
    }
}

export const logout = (req, res) => {
    res.clearCookie('token')
    res.json({ message: 'Sesión cerrada exitosamente' })
}