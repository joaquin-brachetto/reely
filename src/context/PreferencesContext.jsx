import { createContext, useContext, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from './AuthContext'
import { useUserCountry } from '../hooks/useUserCountry'
import { getPreferencesRequest, updatePreferencesRequest } from '../services/preferencesService'

const PreferencesContext = createContext(null)

export function PreferencesProvider({ children }) {
    const { token } = useAuth()
    const detectedCountry = useUserCountry()
    const queryClient = useQueryClient()

    const { data: preferences = { region: null, language: null, providerIds: [] }, isLoading } = useQuery({
        queryKey: ['preferences'],
        queryFn: () => getPreferencesRequest(),
        enabled: !!token,
        staleTime: 1000 * 60 * 5
    })

    const updateMutation = useMutation({
        mutationFn: (newPrefs) => updatePreferencesRequest(newPrefs),
        onMutate: async (newPrefs) => {
            await queryClient.cancelQueries({ queryKey: ['preferences'] })
            const previous = queryClient.getQueryData(['preferences'])
            queryClient.setQueryData(['preferences'], { ...previous, ...newPrefs })
            return { previous }
        },
        onError: (err, newPrefs, context) => {
            queryClient.setQueryData(['preferences'], context.previous)
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['preferences'] })
        }
    })

    const updatePreferences = useCallback((partial) => {
        if (!token) return
        updateMutation.mutate({ ...preferences, ...partial })
    }, [preferences, token, updateMutation])

    const country = preferences.region || detectedCountry

    return (
        <PreferencesContext.Provider value={{ preferences, country, loading: isLoading, updatePreferences }}>
            {children}
        </PreferencesContext.Provider>
    )
}

export function usePreferences() {
    return useContext(PreferencesContext)
}
