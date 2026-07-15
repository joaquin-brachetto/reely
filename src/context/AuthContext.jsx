import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

function decodeToken(token) {
    try {
        const payload = token.split('.')[1]
        return JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
    } catch {
        return null
    }
}

function isTokenValid(token) {
    const payload = decodeToken(token)
    if (!payload?.exp) return false
    return payload.exp * 1000 > Date.now()
}

function getStoredSession() {
    const token = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')

    if (!token || !storedUser || !isTokenValid(token)) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        return { user: null, token: null }
    }

    try {
        return { user: JSON.parse(storedUser), token }
    } catch {
        return { user: null, token: null }
    }
}

export function AuthProvider({ children }) {
    const [{ user, token }, setSession] = useState(getStoredSession)

    const login = (userData, jwtToken) => {
        localStorage.setItem('token', jwtToken)
        localStorage.setItem('user', JSON.stringify(userData))
        setSession({ user: userData, token: jwtToken })
    }

    const logout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setSession({ user: null, token: null })
    }

    return (
        <AuthContext.Provider value={{ user, token, login, logout }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    return useContext(AuthContext)
}
