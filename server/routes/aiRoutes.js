import express from 'express'
import { shoppingAssistant, vendorInsights } from '../controllers/aiController.js'
import { requireAuth, requireRole } from '../middleware/authMiddleware.js'

const router = express.Router()

router.post('/shopping-assistant', shoppingAssistant)
router.post('/vendor-insights', requireAuth, requireRole('vendor'), vendorInsights)

export default router
