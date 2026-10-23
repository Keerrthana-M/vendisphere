import express from 'express'
import { getUsers, getVendors, approveVendor, rejectVendor, getAdminAnalytics } from '../controllers/adminController.js'
import { getProducts } from '../controllers/productController.js'
import { getAllOrdersAdmin } from '../controllers/orderController.js'
import { requireAuth, requireRole } from '../middleware/authMiddleware.js'

const router = express.Router()

router.use(requireAuth)
router.use(requireRole('admin'))

router.get('/users', getUsers)
router.get('/vendors', getVendors)
router.put('/vendors/:id/approve', approveVendor)
router.put('/vendors/:id/reject', rejectVendor)
router.get('/products', getProducts)
router.get('/orders', getAllOrdersAdmin)
router.get('/analytics', getAdminAnalytics)

export default router
