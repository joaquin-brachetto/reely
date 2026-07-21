import { apiClient } from '../lib/axios'
import type { AuthResponse } from '../types'

const BASE_URL = '/auth'

export const registerRequest = async (username: string, email: string, password: string): Promise<{ userId: string; message: string }> => {
    return apiClient.post(`${BASE_URL}/register`, { username, email, password })
}

export const loginRequest = async (identifier: string, password: string): Promise<AuthResponse> => {
    return apiClient.post(`${BASE_URL}/login`, { identifier, password })
}

export const verifyEmailRequest = async (userId: string, code: string): Promise<AuthResponse> => {
    return apiClient.post(`${BASE_URL}/verify-email`, { userId, code })
}

export const forgotPasswordRequest = async (email: string): Promise<{ message: string }> => {
    return apiClient.post(`${BASE_URL}/forgot-password`, { email })
}

export const resetPasswordRequest = async (email: string, code: string, newPassword: string): Promise<{ message: string }> => {
    return apiClient.post(`${BASE_URL}/reset-password`, { email, code, newPassword })
}

export const resendCodeRequest = async (userId: string): Promise<{ message: string }> => {
    return apiClient.post(`${BASE_URL}/resend-code`, { userId })
}

export const logoutRequest = async (): Promise<{ message: string }> => {
    return apiClient.post(`${BASE_URL}/logout`)
}