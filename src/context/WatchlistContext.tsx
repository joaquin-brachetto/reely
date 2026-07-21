import { createContext, useContext, useCallback, ReactNode } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from './AuthContext'
import { getWatchlistRequest, addToWatchlistRequest, removeFromWatchlistRequest } from '../services/watchlistService'
import type { WatchlistItem } from '../types'

interface ToggleItemArgs {
    mediaType: 'movie' | 'tv';
    tmdbId: number;
    title?: string;
    posterPath?: string | null;
    releaseDate?: string | null;
}

interface WatchlistContextType {
    watchlist: WatchlistItem[];
    loading: boolean;
    isSaved: (mediaType: 'movie' | 'tv', tmdbId: number) => boolean;
    toggle: (item: ToggleItemArgs) => void;
}

const WatchlistContext = createContext<WatchlistContextType | null>(null)

export function WatchlistProvider({ children }: { children: ReactNode }) {
    const { user } = useAuth()
    const queryClient = useQueryClient()

    const { data: watchlist = [], isLoading } = useQuery<WatchlistItem[]>({
        queryKey: ['watchlist'],
        queryFn: () => getWatchlistRequest(),
        enabled: !!user,
        staleTime: 1000 * 60 * 5
    })

    const isSaved = useCallback((mediaType: 'movie' | 'tv', tmdbId: number) => {
        return watchlist.some(item => item.media_type === mediaType && item.tmdb_id === tmdbId)
    }, [watchlist])

    const toggleMutation = useMutation({
        mutationFn: async (item: ToggleItemArgs) => {
            const { mediaType, tmdbId, title, posterPath, releaseDate } = item
            if (isSaved(mediaType, tmdbId)) {
                return removeFromWatchlistRequest(mediaType, tmdbId)
            } else {
                return addToWatchlistRequest({ mediaType, tmdbId, title, posterPath, releaseDate })
            }
        },
        onMutate: async (item: ToggleItemArgs) => {
            await queryClient.cancelQueries({ queryKey: ['watchlist'] })
            const previous = queryClient.getQueryData<WatchlistItem[]>(['watchlist']) || []
            const alreadySaved = previous.some(w => w.media_type === item.mediaType && w.tmdb_id === item.tmdbId)

            let next: WatchlistItem[]
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

            queryClient.setQueryData<WatchlistItem[]>(['watchlist'], next)
            return { previous }
        },
        onError: (_err, _newTodo, context: any) => {
            if (context?.previous) {
                queryClient.setQueryData(['watchlist'], context.previous)
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['watchlist'] })
        }
    })

    const toggle = useCallback((item: ToggleItemArgs) => {
        if (!user) return
        toggleMutation.mutate(item)
    }, [user, toggleMutation])

    return (
        <WatchlistContext.Provider value={{ watchlist, loading: isLoading, isSaved, toggle }}>
            {children}
        </WatchlistContext.Provider>
    )
}

export function useWatchlist(): WatchlistContextType {
    const context = useContext(WatchlistContext)
    if (!context) throw new Error('useWatchlist must be used within a WatchlistProvider')
    return context
}
