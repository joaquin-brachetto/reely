import { useQuery } from '@tanstack/react-query'
import { searchTitles, discoverTitles } from '../services/movieService'

export function useTitles(mediaType, { query, year, genreIds } = {}) {
    const queryKey = ['titles', mediaType, query, year, genreIds]

    const queryResult = useQuery({
        queryKey,
        queryFn: async () => {
            if (query) {
                const data = await searchTitles(query, mediaType, { year })
                let results = data.results
                const hasGenreFilter = genreIds && Object.values(genreIds).some(Boolean)
                if (hasGenreFilter) {
                    results = results.filter((item) => {
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
    })

    return { 
        titles: queryResult.data || [], 
        loading: queryResult.isLoading, 
        error: queryResult.error?.message || null 
    }
}
