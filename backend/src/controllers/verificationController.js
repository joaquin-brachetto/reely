import pool from '../db/index.js'
import bcrypt from 'bcryptjs'
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/emailService.js'

const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString()

export const verifyEmail = async (req, res) => {
    const { userId, code } = req.body

    try {
        const result = await pool.query(
            `SELECT * FROM verification_codes 
       WHERE user_id = $1 AND code = $2 AND type = 'email_verification' AND expires_at > NOW()`,
            [userId, code]
        )

        if (result.rows.length === 0)
            return res.status(400).json({ error: 'Código inválido o expirado' })

        await pool.query('UPDATE users SET is_verified = TRUE WHERE id = $1', [userId])
        await pool.query('DELETE FROM verification_codes WHERE user_id = $1 AND type = $2',
            [userId, 'email_verification'])

        res.json({ message: 'Email verificado correctamente' })

    } catch (error) {
        res.status(500).json({ error: 'Error interno del servidor' })
    }
}

export const forgotPassword = async (req, res) => {
    const { email } = req.body

    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email])

        if (result.rows.length === 0)
            return res.json({ message: 'Si ese email existe, recibirás un código' })

        const user = result.rows[0]
        const code = generateCode()
        const expiresAt = new Date(Date.now() + process.env.CODE_EXPIRES_MINUTES * 60 * 1000).toISOString()


        await pool.query(
            'DELETE FROM verification_codes WHERE user_id = $1 AND type = $2',
            [user.id, 'password_reset']
        )

        await pool.query(
            'INSERT INTO verification_codes (user_id, code, type, expires_at) VALUES ($1, $2, $3, $4)',
            [user.id, code, 'password_reset', expiresAt]
        )

        await sendPasswordResetEmail(email, code)

        res.json({ message: 'Si ese email existe, recibirás un código' })

    } catch (error) {
        res.status(500).json({ error: 'Error interno del servidor' })
    }
}

export const resetPassword = async (req, res) => {

    const { email, code, newPassword } = req.body

    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/
    if (!passwordRegex.test(newPassword))
        return res.status(400).json({
            error: 'La contraseña debe tener al menos 8 caracteres, una mayúscula y un carácter especial'
        })

    try {
        const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email])

        if (userResult.rows.length === 0)
            return res.status(400).json({ error: 'Código inválido o expirado' })

        const user = userResult.rows[0]

        const codeResult = await pool.query(
            `SELECT * FROM verification_codes 
       WHERE user_id = $1 AND code = $2 AND type = 'password_reset' AND expires_at > NOW()`,
            [user.id, code]
        )

        if (codeResult.rows.length === 0)
            return res.status(400).json({ error: 'Código inválido o expirado' })

        const passwordHash = await bcrypt.hash(newPassword, 10)

        await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [passwordHash, user.id])
        await pool.query('DELETE FROM verification_codes WHERE user_id = $1 AND type = $2',
            [user.id, 'password_reset'])

        res.json({ message: 'Contraseña actualizada correctamente' })

    } catch (error) {
        res.status(500).json({ error: 'Error interno del servidor' })
    }
}

export const resendCode = async (req, res) => {
    const { userId } = req.body

    try {
        const userResult = await pool.query(
            'SELECT * FROM users WHERE id = $1 AND is_verified = FALSE',
            [userId]
        )

        if (userResult.rows.length === 0)
            return res.status(400).json({ error: 'Usuario no encontrado o ya verificado' })

        const user = userResult.rows[0]
        const code = generateCode()
        const expiresAt = new Date(Date.now() + process.env.CODE_EXPIRES_MINUTES * 60 * 1000).toISOString()

        await pool.query(
            'DELETE FROM verification_codes WHERE user_id = $1 AND type = $2',
            [userId, 'email_verification']
        )

        await pool.query(
            'INSERT INTO verification_codes (user_id, code, type, expires_at) VALUES ($1, $2, $3, $4)',
            [userId, code, 'email_verification', expiresAt]
        )

        await sendVerificationEmail(user.email, code)

        res.json({ message: 'Código reenviado. Revisá tu email.' })

    } catch (error) {
        res.status(500).json({ error: 'Error interno del servidor' })
    }
}