import { Router } from 'express'
import { getPreferences, updatePreferences } from '../controllers/preferencesController.js'
import { requireAuth } from '../middleware/auth.js'

const router = Router()

router.use(requireAuth)
router.get('/', getPreferences)
router.put('/', updatePreferences)

export default router
