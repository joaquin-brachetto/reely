import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config()

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    connectionTimeout: 5000,
    greetingTimeout: 5000,
    socketTimeout: 5000
})

export const sendVerificationEmail = async (email, code) => {
    await transporter.sendMail({
        from: `"${process.env.APP_NAME}" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `Verificá tu cuenta en ${process.env.APP_NAME}`,
        html: `
      <h2>Bienvenido a ${process.env.APP_NAME}</h2>
      <p>Tu código de verificación es:</p>
      <h1 style="letter-spacing: 8px">${code}</h1>
      <p>Este código expira en ${process.env.CODE_EXPIRES_MINUTES || '15'} minutos.</p>
    `
    })
}

export const sendPasswordResetEmail = async (email, code) => {
    await transporter.sendMail({
        from: `"${process.env.APP_NAME}" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `Recuperar contraseña en ${process.env.APP_NAME}`,
        html: `
      <h2>Recuperar contraseña</h2>
      <p>Tu código de recuperación es:</p>
      <h1 style="letter-spacing: 8px">${code}</h1>
      <p>Este código expira en ${process.env.CODE_EXPIRES_MINUTES || '15'} minutos.</p>
    `
    })
}