import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useAuth } from './AuthContext'
import { getWatchlistRequest, addToWatchlistRequest, removeFromWatchlistRequest } from '../services/watchlistService'

const WatchlistContext = createContext(null)

export function WatchlistProvider({ children }) {
    const { token } = useAuth()
    const [watchlist, setWatchlist] = useState([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (!token) {
            setWatchlist([])
            return
        }

        setLoading(true)
        getWatchlistRequest(token)
            .then(setWatchlist)
            .catch(() => {})
            .finally(() => setLoading(false))
    }, [token])

    const isSaved = useCallback((mediaType, tmdbId) => {
        return watchlist.some(item => item.media_type === mediaType && item.tmdb_id === tmdbId)
    }, [watchlist])

    const toggle = useCallback(async (item) => {
        if (!token) return

        const { mediaType, tmdbId, title, posterPath, releaseDate } = item
        const alreadySaved = isSaved(mediaType, tmdbId)

        if (alreadySaved) {
            setWatchlist(prev => prev.filter(w => !(w.media_type === mediaType && w.tmdb_id === tmdbId)))
            try {
                await removeFromWatchlistRequest(token, mediaType, tmdbId)
            } catch {
                setWatchlist(prev => [...prev, { media_type: mediaType, tmdb_id: tmdbId, title, poster_path: posterPath, release_date: releaseDate }])
            }
            return
        }

        setWatchlist(prev => [...prev, { media_type: mediaType, tmdb_id: tmdbId, title, poster_path: posterPath, release_date: releaseDate }])
        try {
            await addToWatchlistRequest(token, { mediaType, tmdbId, title, posterPath, releaseDate })
        } catch {
            setWatchlist(prev => prev.filter(w => !(w.media_type === mediaType && w.tmdb_id === tmdbId)))
        }
    }, [token, isSaved])

    return (
        <WatchlistContext.Provider value={{ watchlist, loading, isSaved, toggle }}>
            {children}
        </WatchlistContext.Provider>
    )
}

export function useWatchlist() {
    return useContext(WatchlistContext)
}
