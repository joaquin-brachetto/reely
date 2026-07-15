import express from 'express'
import { proxyTmdb, proxyOmdb } from '../controllers/moviesController.js'

const router = express.Router()

router.use('/tmdb', proxyTmdb)
router.get('/omdb', proxyOmdb)

export default router
