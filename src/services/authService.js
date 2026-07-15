const BASE_URL = `${import.meta.env.VITE_API_URL}/auth`

export const registerRequest = async (username, email, password) => {
    const res = await fetch(`${BASE_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, email, password })
    })
    return res
}

export const loginRequest = async (identifier, password) => {
    const res = await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ identifier, password })
    })
    return res
}

export const verifyEmailRequest = async (userId, code) => {
    const res = await fetch(`${BASE_URL}/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, code })
    })
    return res
}

export const forgotPasswordRequest = async (email) => {
    const res = await fetch(`${BASE_URL}/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
    })
    return res
}

export const resetPasswordRequest = async (email, code, newPassword) => {
    const res = await fetch(`${BASE_URL}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, newPassword })
    })
    return res
}

export const resendCodeRequest = async (userId) => {
    const res = await fetch(`${BASE_URL}/resend-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userId })
    })
    return res
}

export const logoutRequest = async () => {
    const res = await fetch(`${BASE_URL}/logout`, {
        method: 'POST',
        credentials: 'include'
    })
    return res
}