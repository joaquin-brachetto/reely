import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
    loginRequest,
    registerRequest,
    verifyEmailRequest,
    forgotPasswordRequest,
    resetPasswordRequest,
    resendCodeRequest
} from '../services/authService'

const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/

export function useAuthForm() {
    const [currentView, setCurrentView] = useState('login')
    const [userId, setUserId] = useState(null)
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        identifier: '',
        password: '',
        newPassword: '',
        code: ''
    })
    const [error, setError] = useState(null)
    const [message, setMessage] = useState(null)
    const [loading, setLoading] = useState(false)
    const [isBlocked, setIsBlocked] = useState(false)
    const [resetEmail, setResetEmail] = useState('')


    const { login } = useAuth()
    const navigate = useNavigate()

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const goToView = (view) => {
        setCurrentView(view)
        setError(null)
        setMessage(null)
        setFormData(prev => ({
            ...prev,
            password: '',
            newPassword: '',
            code: ''
        }))
    }

    const handleLogin = async (e) => {
        e.preventDefault()
        setError(null)
        setLoading(true)

        try {
            const res = await loginRequest(formData.identifier, formData.password)
            const data = await res.json()

            if (!res.ok) {
                if (res.status === 403) {
                    setUserId(data.userId)
                    goToView('verify')
                    setMessage('Tu cuenta no está verificada. Ingresá el código que te enviamos.')
                    return
                }
                if (res.status === 429) {
                    const lockoutMinutes = parseInt(import.meta.env.VITE_LOCKOUT_MINUTES) || 15
                    const lockoutMs = lockoutMinutes * 60 * 1000
                    setError(data.error)
                    setIsBlocked(true)
                    setTimeout(() => {
                        setIsBlocked(false)
                        setError(null)
                    }, lockoutMs)
                    return
                }
                setError(data.error)
                return
            }

            login(data.user, data.token)
            navigate('/')

        } catch {
            setError('No se pudo conectar con el servidor')
        } finally {
            setLoading(false)
        }
    }

    const handleRegister = async (e) => {
        e.preventDefault()
        setError(null)

        if (!passwordRegex.test(formData.password)) {
            setError('La contraseña debe tener al menos 8 caracteres, una mayúscula y un carácter especial (!@#$%^&*)')
            return
        }

        setLoading(true)

        try {
            const res = await registerRequest(formData.username, formData.email, formData.password)
            const data = await res.json()

            if (!res.ok) {
                setError(data.error)
                return
            }

            setUserId(data.userId)
            goToView('verify')
            setMessage('Te enviamos un código a tu email. Ingresalo para activar tu cuenta.')

        } catch {
            setError('No se pudo conectar con el servidor')
        } finally {
            setLoading(false)
        }
    }

    const handleVerify = async (e) => {
        e.preventDefault()
        setError(null)
        setLoading(true)

        try {
            const res = await verifyEmailRequest(userId, formData.code)
            const data = await res.json()

            if (!res.ok) {
                setError(data.error)
                return
            }

            goToView('login')
            setMessage('¡Cuenta verificada! Ya podés iniciar sesión.')

        } catch {
            setError('No se pudo conectar con el servidor')
        } finally {
            setLoading(false)
        }
    }

    const handleForgotPassword = async (e) => {
        e.preventDefault()
        setError(null)
        setLoading(true)

        try {
            const res = await forgotPasswordRequest(formData.email)
            const data = await res.json()

            if (!res.ok) {
                setError(data.error)
                return
            }

            setResetEmail(formData.email)
            goToView('reset')
            setMessage('Revisa tu correo. Te enviamos un código de recuperación.')

        } catch {
            setError('No se pudo conectar con el servidor')
        } finally {
            setLoading(false)
        }
    }

    const handleResetPassword = async (e) => {
        e.preventDefault()
        setError(null)

        if (!passwordRegex.test(formData.newPassword)) {
            setError('La contraseña debe tener al menos 8 caracteres, una mayúscula y un carácter especial (!@#$%^&*)')
            return
        }

        setLoading(true)

        try {
            const res = await resetPasswordRequest(resetEmail || formData.email, formData.code, formData.newPassword)
            const data = await res.json()

            if (!res.ok) {
                setError(data.error)
                return
            }

            goToView('login')
            setMessage('¡Contraseña actualizada! Ya podés iniciar sesión.')

        } catch {
            setError('No se pudo conectar con el servidor')
        } finally {
            setLoading(false)
        }
    }

    const handleResendCode = async () => {
        setError(null)
        setLoading(true)

        try {
            const res = await resendCodeRequest(userId)
            const data = await res.json()

            if (!res.ok) {
                setError(data.error)
                return
            }

            setMessage('Código reenviado. Revisá tu email.')

        } catch {
            setError('No se pudo conectar con el servidor')
        } finally {
            setLoading(false)
        }
    }

    return {
        currentView,
        formData,
        error,
        message,
        loading,
        isBlocked,
        handleChange,
        handleLogin,
        handleRegister,
        handleVerify,
        handleForgotPassword,
        handleResetPassword,
        handleResendCode,
        goToView,
    }
}