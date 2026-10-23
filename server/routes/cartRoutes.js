import express from 'express'
import { getCart, addToCart, updateCartItem, removeCartItem } from '../controllers/cartController.js'
import { requireAuth, requireRole } from '../middleware/authMiddleware.js'

const router = express.Router()

router.use(requireAuth)
router.use(requireRole('customer'))

router.get('/', getCart)
router.post('/', addToCart)
router.put('/:itemId', updateCartItem)
router.delete('/:itemId', removeCartItem)

export default router
