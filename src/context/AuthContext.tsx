import { createContext, useContext, useState, ReactNode } from 'react'
import { logoutRequest } from '../services/authService'
import type { User } from '../types'

interface AuthContextType {
    user: User | null;
    login: (userData: User) => void;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null)

function getStoredSession(): { user: User | null } {
    const storedUser = localStorage.getItem('user')
    if (!storedUser) return { user: null }

    try {
        return { user: JSON.parse(storedUser) }
    } catch {
        return { user: null }
    }
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [{ user }, setSession] = useState<{ user: User | null }>(getStoredSession)

    const login = (userData: User) => {
        localStorage.setItem('user', JSON.stringify(userData))
        setSession({ user: userData })
    }

    const logout = async () => {
        try {
            await logoutRequest()
        } catch (error) {
            console.error("Error logging out", error)
        }
        localStorage.removeItem('user')
        setSession({ user: null })
    }

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext)
    if (!context) throw new Error('useAuth must be used within an AuthProvider')
    return context
}
