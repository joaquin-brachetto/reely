import { apiClient } from '../lib/axios'

const BASE_URL = '/preferences'

export const getPreferencesRequest = async () => {
    return apiClient.get(BASE_URL)
}

export const updatePreferencesRequest = async ({ region, language, providerIds }) => {
    return apiClient.put(BASE_URL, { region, language, providerIds })
}
