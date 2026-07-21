import { apiClient } from '../lib/axios'
import type { WatchlistItem } from '../types'

const BASE_URL = '/watchlist'

export const getWatchlistRequest = async (): Promise<WatchlistItem[]> => {
    return apiClient.get<any, WatchlistItem[]>(BASE_URL)
}

export const addToWatchlistRequest = async ({ mediaType, tmdbId, title, posterPath, releaseDate }: { mediaType: 'movie'|'tv', tmdbId: number, title?: string, posterPath?: string | null, releaseDate?: string | null }): Promise<{ message: string, item: WatchlistItem }> => {
    return apiClient.post<any, any>(BASE_URL, { mediaType, tmdbId, title, posterPath, releaseDate })
}

export const removeFromWatchlistRequest = async (mediaType: 'movie'|'tv', tmdbId: number): Promise<{ message: string }> => {
    return apiClient.delete<any, any>(`${BASE_URL}/${mediaType}/${tmdbId}`)
}
