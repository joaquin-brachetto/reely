import { Router } from 'express'
import { getWatchlist, addToWatchlist, removeFromWatchlist } from '../controllers/watchlistController.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.use(requireAuth)
router.get('/', getWatchlist)
router.post('/', addToWatchlist)
router.delete('/:mediaType/:tmdbId', removeFromWatchlist)

export default router
