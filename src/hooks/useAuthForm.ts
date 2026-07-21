import { useState, ChangeEvent, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
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
    const [currentView, setCurrentView] = useState<string>('login')
    const [userId, setUserId] = useState<string | null>(null)
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        identifier: '',
        password: '',
        newPassword: '',
        code: ''
    })
    const [error, setError] = useState<string | null>(null)
    const [message, setMessage] = useState<string | null>(null)
    const [isBlocked, setIsBlocked] = useState<boolean>(false)
    const [resetEmail, setResetEmail] = useState<string>('')

    const { login } = useAuth()
    const navigate = useNavigate()

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const goToView = (view: string) => {
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

    // --- Mutaions usando React Query ---
    // loginMutation maneja automáticamente el estado de "isLoading", "isError", etc.
    const loginMutation = useMutation({
        mutationFn: ({ identifier, password }: any) => loginRequest(identifier, password),
        onSuccess: (data) => {
            login(data.user)
            navigate('/')
        },
        onError: (err: any) => {
            // Axios mete el status en err.response.status y la data en err.response.data
            const status = err.response?.status;
            const data = err.response?.data;
            
            if (status === 403) {
                setUserId(data.userId)
                goToView('verify')
                setMessage('Tu cuenta no está verificada. Ingresá el código que te enviamos.')
                return
            }
            if (status === 429) {
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
            setError(data?.error || 'No se pudo conectar con el servidor')
        }
    })

    const registerMutation = useMutation({
        mutationFn: ({ username, email, password }: any) => registerRequest(username, email, password),
        onSuccess: (data) => {
            setUserId(data.userId)
            goToView('verify')
            setMessage('Te enviamos un código a tu email. Ingresalo para activar tu cuenta.')
        },
        onError: (err: any) => setError(err.response?.data?.error || 'No se pudo conectar con el servidor')
    })

    const verifyMutation = useMutation({
        mutationFn: ({ userId, code }: any) => verifyEmailRequest(userId, code),
        onSuccess: () => {
            goToView('login')
            setMessage('¡Cuenta verificada! Ya podés iniciar sesión.')
        },
        onError: (err: any) => setError(err.response?.data?.error || 'No se pudo conectar con el servidor')
    })

    const forgotPasswordMutation = useMutation({
        mutationFn: (email: string) => forgotPasswordRequest(email),
        onSuccess: () => {
            setResetEmail(formData.email)
            goToView('reset')
            setMessage('Revisa tu correo. Te enviamos un código de recuperación.')
        },
        onError: (err: any) => setError(err.response?.data?.error || 'No se pudo conectar con el servidor')
    })

    const resetPasswordMutation = useMutation({
        mutationFn: ({ email, code, newPassword }: any) => resetPasswordRequest(email, code, newPassword),
        onSuccess: () => {
            goToView('login')
            setMessage('¡Contraseña actualizada! Ya podés iniciar sesión.')
        },
        onError: (err: any) => setError(err.response?.data?.error || 'No se pudo conectar con el servidor')
    })

    const resendCodeMutation = useMutation({
        mutationFn: (userId: string) => resendCodeRequest(userId),
        onSuccess: () => setMessage('Código reenviado. Revisá tu email.'),
        onError: (err: any) => setError(err.response?.data?.error || 'No se pudo conectar con el servidor')
    })

    // --- Manejadores de Formularios ---

    const handleLogin = (e: FormEvent) => {
        e.preventDefault()
        setError(null)
        loginMutation.mutate({ identifier: formData.identifier, password: formData.password })
    }

    const handleRegister = (e: FormEvent) => {
        e.preventDefault()
        setError(null)
        if (!passwordRegex.test(formData.password)) {
            setError('La contraseña debe tener al menos 8 caracteres, una mayúscula y un carácter especial (!@#$%^&*)')
            return
        }
        registerMutation.mutate({ username: formData.username, email: formData.email, password: formData.password })
    }

    const handleVerify = (e: FormEvent) => {
        e.preventDefault()
        setError(null)
        if (userId) verifyMutation.mutate({ userId, code: formData.code })
    }

    const handleForgotPassword = (e: FormEvent) => {
        e.preventDefault()
        setError(null)
        forgotPasswordMutation.mutate(formData.email)
    }

    const handleResetPassword = (e: FormEvent) => {
        e.preventDefault()
        setError(null)
        if (!passwordRegex.test(formData.newPassword)) {
            setError('La contraseña debe tener al menos 8 caracteres, una mayúscula y un carácter especial (!@#$%^&*)')
            return
        }
        resetPasswordMutation.mutate({ 
            email: resetEmail || formData.email, 
            code: formData.code, 
            newPassword: formData.newPassword 
        })
    }

    const handleResendCode = () => {
        setError(null)
        if (userId) resendCodeMutation.mutate(userId)
    }

    // Calculamos el "loading" global verificando si alguna mutación está en curso (isPending)
    const loading = loginMutation.isPending || 
                    registerMutation.isPending || 
                    verifyMutation.isPending || 
                    forgotPasswordMutation.isPending || 
                    resetPasswordMutation.isPending || 
                    resendCodeMutation.isPending;

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