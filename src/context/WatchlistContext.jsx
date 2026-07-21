import { createContext, useContext, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from './AuthContext'
import { getWatchlistRequest, addToWatchlistRequest, removeFromWatchlistRequest } from '../services/watchlistService'

const WatchlistContext = createContext(null)

export function WatchlistProvider({ children }) {
    const { token } = useAuth()
    const queryClient = useQueryClient()

    const { data: watchlist = [], isLoading } = useQuery({
        queryKey: ['watchlist'],
        queryFn: () => getWatchlistRequest(),
        enabled: !!token,
        staleTime: 1000 * 60 * 5
    })

    const isSaved = useCallback((mediaType, tmdbId) => {
        return watchlist.some(item => item.media_type === mediaType && item.tmdb_id === tmdbId)
    }, [watchlist])

    const toggleMutation = useMutation({
        mutationFn: async (item) => {
            const { mediaType, tmdbId, title, posterPath, releaseDate } = item
            if (isSaved(mediaType, tmdbId)) {
                return removeFromWatchlistRequest(mediaType, tmdbId)
            } else {
                return addToWatchlistRequest({ mediaType, tmdbId, title, posterPath, releaseDate })
            }
        },
        onMutate: async (item) => {
            await queryClient.cancelQueries({ queryKey: ['watchlist'] })
            const previous = queryClient.getQueryData(['watchlist']) || []
            const alreadySaved = previous.some(w => w.media_type === item.mediaType && w.tmdb_id === item.tmdbId)

            let next
            if (alreadySaved) {
                next = previous.filter(w => !(w.media_type === item.mediaType && w.tmdb_id === item.tmdbId))
            } else {
                next = [...previous, { 
                    media_type: item.mediaType, 
                    tmdb_id: item.tmdbId, 
                    title: item.title, 
                    poster_path: item.posterPath, 
                    release_date: item.releaseDate 
                }]
            }

            queryClient.setQueryData(['watchlist'], next)
            return { previous }
        },
        onError: (err, newTodo, context) => {
            queryClient.setQueryData(['watchlist'], context.previous)
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['watchlist'] })
        }
    })

    const toggle = useCallback((item) => {
        if (!token) return
        toggleMutation.mutate(item)
    }, [token, toggleMutation])

    return (
        <WatchlistContext.Provider value={{ watchlist, loading: isLoading, isSaved, toggle }}>
            {children}
        </WatchlistContext.Provider>
    )
}

export function useWatchlist() {
    return useContext(WatchlistContext)
}
