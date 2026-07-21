import { useQuery } from '@tanstack/react-query'
import { searchTitles, discoverTitles } from '../services/movieService'

export function useTitles(mediaType: 'all' | 'movie' | 'tv', { query, year, genreIds, page = 1 }: { query?: string; year?: string; genreIds?: any; page?: number } = {}, options: { enabled?: boolean } = {}) {
    const queryKey = ['titles', mediaType, query, year, genreIds, page]

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
                return { results, total_pages: data.total_pages, total_results: data.total_results }
            } else {
                const data = await discoverTitles(mediaType, { year, genreIds, page })
                return { results: data.results, total_pages: data.total_pages, total_results: data.total_results }
            }
        },
        ...options
    })

    return { 
        titles: queryResult.data?.results || [], 
        totalPages: queryResult.data?.total_pages || 1,
        totalResults: queryResult.data?.total_results || 0,
        loading: queryResult.isLoading, 
        error: queryResult.error?.message || null 
    }
}
