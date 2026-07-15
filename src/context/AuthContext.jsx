import { createContext, useContext, useState } from 'react'
import { logoutRequest } from '../services/authService'

const AuthContext = createContext(null)

function getStoredSession() {
    const storedUser = localStorage.getItem('user')
    if (!storedUser) return { user: null }

    try {
        return { user: JSON.parse(storedUser) }
    } catch {
        return { user: null }
    }
}

export function AuthProvider({ children }) {
    const [{ user }, setSession] = useState(getStoredSession)

    const login = (userData) => {
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



export function useAuth() {
    return useContext(AuthContext)
}
