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
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
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

if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`Servidor corriendo en http://localhost:${PORT}`)
    })
}

export default app