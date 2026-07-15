import { useState, useCallback } from 'react'
import { searchTitles, discoverTitles } from '../services/movieService'

export function useTitles() {
    const [titles, setTitles] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const fetchTitles = useCallback(async (mediaType, { query, year, genreIds } = {}) => {
        setLoading(true)
        setError(null)
        try {
            let results

            if (query) {
                const data = await searchTitles(query, mediaType, { year })
                results = data.results
                const hasGenreFilter = genreIds && Object.values(genreIds).some(Boolean)
                if (hasGenreFilter) {
                    results = results.filter((item) => {
                        const genreId = genreIds[item.media_type]
                        return genreId ? item.genre_ids?.includes(genreId) : false
                    })
                }
            } else {
                const data = await discoverTitles(mediaType, { year, genreIds })
                results = data.results
            }

            setTitles(results)
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }, [])

    return { titles, loading, error, fetchTitles }
}
