import { createContext, useContext, useCallback, ReactNode } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from './AuthContext'
import { useUserCountry } from '../hooks/useUserCountry'
import { getPreferencesRequest, updatePreferencesRequest } from '../services/preferencesService'
import type { Preferences } from '../types'

interface PreferencesContextType {
    preferences: Preferences;
    country: string;
    loading: boolean;
    updatePreferences: (partial: Partial<Preferences>) => void;
}

const PreferencesContext = createContext<PreferencesContextType | null>(null)

export function PreferencesProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth()
    const detectedCountry = useUserCountry()
    const queryClient = useQueryClient()

    const { data: preferences = { region: null, language: null, providerIds: [] }, isLoading } = useQuery<Preferences>({
        queryKey: ['preferences'],
        queryFn: () => getPreferencesRequest(),
        enabled: !!user,
        staleTime: 1000 * 60 * 5
    })

    const updateMutation = useMutation({
        mutationFn: (newPrefs: Preferences) => updatePreferencesRequest(newPrefs),
        onMutate: async (newPrefs) => {
            await queryClient.cancelQueries({ queryKey: ['preferences'] })
            const previous = queryClient.getQueryData<Preferences>(['preferences'])
            queryClient.setQueryData<Preferences>(['preferences'], { ...previous, ...newPrefs } as Preferences)
            return { previous }
        },
        onError: (_err, _newPrefs, context: any) => {
            if (context?.previous) {
                queryClient.setQueryData(['preferences'], context.previous)
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['preferences'] })
        }
    })

    const updatePreferences = useCallback((partial: Partial<Preferences>) => {
        if (!user) return
        updateMutation.mutate({ ...preferences, ...partial } as Preferences)
    }, [preferences, user, updateMutation])

    const country = preferences.region || detectedCountry

    return (
        <PreferencesContext.Provider value={{ preferences, country, loading: isLoading, updatePreferences }}>
            {children}
        </PreferencesContext.Provider>
    )
}

export function usePreferences(): PreferencesContextType {
    const context = useContext(PreferencesContext)
    if (!context) throw new Error('usePreferences must be used within a PreferencesProvider')
    return context
}
