import { apiClient } from '../lib/axios'

const BASE_URL = '/auth'

export const registerRequest = async (username, email, password) => {
    return apiClient.post(`${BASE_URL}/register`, { username, email, password })
}

export const loginRequest = async (identifier, password) => {
    return apiClient.post(`${BASE_URL}/login`, { identifier, password })
}

export const verifyEmailRequest = async (userId, code) => {
    return apiClient.post(`${BASE_URL}/verify-email`, { userId, code })
}

export const forgotPasswordRequest = async (email) => {
    return apiClient.post(`${BASE_URL}/forgot-password`, { email })
}

export const resetPasswordRequest = async (email, code, newPassword) => {
    return apiClient.post(`${BASE_URL}/reset-password`, { email, code, newPassword })
}

export const resendCodeRequest = async (userId) => {
    return apiClient.post(`${BASE_URL}/resend-code`, { userId })
}

export const logoutRequest = async () => {
    return apiClient.post(`${BASE_URL}/logout`)
}