import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useAuth } from './AuthContext'
import { useUserCountry } from '../hooks/useUserCountry'
import { getPreferencesRequest, updatePreferencesRequest } from '../services/preferencesService'

const PreferencesContext = createContext(null)

export function PreferencesProvider({ children }) {
    const { token } = useAuth()
    const detectedCountry = useUserCountry()

    const [preferences, setPreferences] = useState({ region: null, language: null, providerIds: [] })
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (!token) {
            setPreferences({ region: null, language: null, providerIds: [] })
            return
        }

        setLoading(true)
        getPreferencesRequest(token)
            .then(setPreferences)
            .catch(() => {})
            .finally(() => setLoading(false))
    }, [token])

    const updatePreferences = useCallback(async (partial) => {
        const next = { ...preferences, ...partial }
        setPreferences(next)
        if (!token) return
        try {
            const saved = await updatePreferencesRequest(token, next)
            setPreferences(saved)
        } catch {}
    }, [preferences, token])

    const country = preferences.region || detectedCountry

    return (
        <PreferencesContext.Provider value={{ preferences, country, loading, updatePreferences }}>
            {children}
        </PreferencesContext.Provider>
    )
}

export function usePreferences() {
    return useContext(PreferencesContext)
}
