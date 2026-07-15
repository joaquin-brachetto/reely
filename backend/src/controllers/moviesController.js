const cache = new Map()

export const proxyTmdb = async (req, res) => {
    try {
        const path = req.path.startsWith('/') ? req.path.slice(1) : req.path
        const query = new URLSearchParams(req.query)
        
        query.set('api_key', process.env.TMDB_API_KEY)
        
        const url = `${process.env.TMDB_BASE_URL}/${path}?${query.toString()}`
        
        if (cache.has(url)) {
            const cached = cache.get(url)
            if (Date.now() - cached.timestamp < 3600000) { // 1 hora
                return res.status(200).json(cached.data)
            }
            cache.delete(url)
        }
        
        const response = await fetch(url)
        const data = await response.json()
        
        if (response.ok) {
            cache.set(url, { data, timestamp: Date.now() })
        }
        
        res.status(response.status).json(data)
    } catch (error) {
        console.error('TMDB Proxy Error:', error)
        res.status(500).json({ error: 'Error al comunicarse con TMDB' })
    }
}

export const proxyOmdb = async (req, res) => {
    try {
        const query = new URLSearchParams(req.query)
        
        query.set('apikey', process.env.OMDB_API_KEY)
        
        const url = `${process.env.OMDB_BASE_URL}/?${query.toString()}`
        
        const response = await fetch(url)
        const data = await response.json()
        
        res.status(response.status).json(data)
    } catch (error) {
        console.error('OMDB Proxy Error:', error)
        res.status(500).json({ error: 'Error al comunicarse con OMDB' })
    }
}
