import { useQuery } from '@tanstack/react-query'
import { searchTitles, discoverTitles } from '../services/movieService'

export function useTitles(mediaType: 'all' | 'movie' | 'tv', { query, year, genreIds }: { query?: string; year?: string; genreIds?: any } = {}, options: { enabled?: boolean } = {}) {
    const queryKey = ['titles', mediaType, query, year, genreIds]

    const queryResult = useQuery({
        queryKey,
        queryFn: async () => {
            if (query) {
                const data = await searchTitles(query, mediaType, { year })
                let results = data.results
                const hasGenreFilter = genreIds && Object.values(genreIds).some(Boolean)
                if (hasGenreFilter) {
                    results = results.filter((item: any) => {
                        const genreId = genreIds[item.media_type]
                        return genreId ? item.genre_ids?.includes(genreId) : false
                    })
                }
                return results
            } else {
                const data = await discoverTitles(mediaType, { year, genreIds })
                return data.results
            }
        },
        ...options
    })

    return { 
        titles: queryResult.data || [], 
        loading: queryResult.isLoading, 
        error: queryResult.error?.message || null 
    }
}
