import pool from '../db/index.js'

export const getWatchlist = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT media_type, tmdb_id, title, poster_path, release_date, added_at FROM watchlist WHERE user_id = $1 ORDER BY added_at DESC',
            [req.userId]
        )
        res.json(result.rows)
    } catch (error) {
        res.status(500).json({ error: 'Error interno del servidor' })
    }
}

export const addToWatchlist = async (req, res) => {
    const { mediaType, tmdbId, title, posterPath, releaseDate } = req.body

    if (!mediaType || !tmdbId || !title) {
        return res.status(400).json({ error: 'Faltan datos del título' })
    }

    try {
        await pool.query(
            `INSERT INTO watchlist (user_id, media_type, tmdb_id, title, poster_path, release_date)
             VALUES ($1, $2, $3, $4, $5, $6)
             ON CONFLICT (user_id, media_type, tmdb_id) DO NOTHING`,
            [req.userId, mediaType, tmdbId, title, posterPath || null, releaseDate || null]
        )
        res.status(201).json({ mediaType, tmdbId, title, posterPath: posterPath || null, releaseDate: releaseDate || null })
    } catch (error) {
        res.status(500).json({ error: 'Error interno del servidor' })
    }
}

export const removeFromWatchlist = async (req, res) => {
    const { mediaType, tmdbId } = req.params

    try {
        await pool.query(
            'DELETE FROM watchlist WHERE user_id = $1 AND media_type = $2 AND tmdb_id = $3',
            [req.userId, mediaType, tmdbId]
        )
        res.json({ mediaType, tmdbId: Number(tmdbId) })
    } catch (error) {
        res.status(500).json({ error: 'Error interno del servidor' })
    }
}
