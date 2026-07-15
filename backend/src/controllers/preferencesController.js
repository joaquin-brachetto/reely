import pool from '../db/index.js'

export const getPreferences = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT region, language, provider_ids FROM user_preferences WHERE user_id = $1',
            [req.userId]
        )

        if (result.rows.length === 0) {
            return res.json({ region: null, language: null, providerIds: [] })
        }

        const { region, language, provider_ids } = result.rows[0]
        res.json({ region, language, providerIds: provider_ids || [] })
    } catch (error) {
        res.status(500).json({ error: 'Error interno del servidor' })
    }
}

export const updatePreferences = async (req, res) => {
    const { region, language, providerIds } = req.body

    try {
        await pool.query(
            `INSERT INTO user_preferences (user_id, region, language, provider_ids, updated_at)
             VALUES ($1, $2, $3, $4, NOW())
             ON CONFLICT (user_id)
             DO UPDATE SET region = $2, language = $3, provider_ids = $4, updated_at = NOW()`,
            [req.userId, region || null, language || null, providerIds || []]
        )
        res.json({ region: region || null, language: language || null, providerIds: providerIds || [] })
    } catch (error) {
        res.status(500).json({ error: 'Error interno del servidor' })
    }
}
