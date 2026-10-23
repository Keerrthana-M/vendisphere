import express from 'express'
import { getVendorProducts, getVendorInventory, getVendorAnalytics } from '../controllers/vendorController.js'
import { getVendorOrders } from '../controllers/orderController.js'
import { requireAuth, requireRole } from '../middleware/authMiddleware.js'

const router = express.Router()

router.use(requireAuth)
router.use(requireRole('vendor'))

router.get('/products', getVendorProducts)
router.get('/inventory', getVendorInventory)
router.get('/analytics', getVendorAnalytics)
router.get('/orders', getVendorOrders)

export default router
