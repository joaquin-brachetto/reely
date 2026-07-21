import { apiClient } from '../lib/axios'
import type { Preferences } from '../types'

const BASE_URL = '/preferences'

export const getPreferencesRequest = async (): Promise<Preferences> => {
    return apiClient.get<any, Preferences>(BASE_URL)
}

export const updatePreferencesRequest = async ({ region, language, providerIds }: Partial<Preferences>): Promise<{ message: string, preferences: Preferences }> => {
    return apiClient.put<any, any>(BASE_URL, { region, language, providerIds })
}
