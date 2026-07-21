import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.js'
import preferencesRoutes from './routes/preferences.js'
import watchlistRoutes from './routes/watchlist.js'
import moviesRoutes from './routes/movies.js'
import cookieParser from 'cookie-parser'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors({ 
    origin: function (origin, callback) {
        const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:5173'
        if (!origin || origin === allowedOrigin || origin.endsWith('.vercel.app')) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    },
    credentials: true 
}))
app.use(express.json())
app.use(cookieParser())

app.use('/api/auth', authRoutes)
app.use('/api/preferences', preferencesRoutes)
app.use('/api/watchlist', watchlistRoutes)
app.use('/api/movies', moviesRoutes)

app.get('/health', (req, res) => {
    res.json({ status: 'ok' })
})

import { runMigrations } from './db/index.js'

if (process.env.NODE_ENV !== 'test') {
    runMigrations().then(() => {
        app.listen(PORT, () => {
            console.log(`Servidor corriendo en http://localhost:${PORT}`)
        })
    })
}

export default app