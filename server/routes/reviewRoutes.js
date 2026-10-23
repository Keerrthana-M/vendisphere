import express from 'express'
import { createReview, getProductReviews } from '../controllers/reviewController.js'
import { requireAuth, requireRole } from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/product/:productId', getProductReviews)
router.post('/', requireAuth, requireRole('customer'), createReview)

export default router
