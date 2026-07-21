import { apiClient } from '../lib/axios'

const BASE_URL = '/watchlist'

export const getWatchlistRequest = async () => {
    return apiClient.get(BASE_URL)
}

export const addToWatchlistRequest = async ({ mediaType, tmdbId, title, posterPath, releaseDate }) => {
    return apiClient.post(BASE_URL, { mediaType, tmdbId, title, posterPath, releaseDate })
}

export const removeFromWatchlistRequest = async (mediaType, tmdbId) => {
    return apiClient.delete(`${BASE_URL}/${mediaType}/${tmdbId}`)
}
