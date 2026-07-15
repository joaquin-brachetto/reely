const BASE_URL = `${import.meta.env.VITE_API_URL}/watchlist`

export const getWatchlistRequest = async (token) => {
    const res = await fetch(BASE_URL, {
        headers: { Authorization: `Bearer ${token}` }
    })
    if (!res.ok) throw new Error('Error al obtener la watchlist')
    return res.json()
}

export const addToWatchlistRequest = async (token, { mediaType, tmdbId, title, posterPath, releaseDate }) => {
    const res = await fetch(BASE_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ mediaType, tmdbId, title, posterPath, releaseDate })
    })
    if (!res.ok) throw new Error('Error al guardar en la watchlist')
    return res.json()
}

export const removeFromWatchlistRequest = async (token, mediaType, tmdbId) => {
    const res = await fetch(`${BASE_URL}/${mediaType}/${tmdbId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
    })
    if (!res.ok) throw new Error('Error al quitar de la watchlist')
    return res.json()
}
