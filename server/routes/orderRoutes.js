import express from 'express'
import { createOrder, getCustomerOrders, getOrderById, getVendorOrders, updateOrderStatus, getAllOrdersAdmin } from '../controllers/orderController.js'
import { requireAuth, requireRole } from '../middleware/authMiddleware.js'

const router = express.Router()

router.use(requireAuth)

router.post('/', requireRole('customer'), createOrder)
router.get('/', requireRole('customer'), getCustomerOrders)
router.get('/:id', getOrderById)
router.put('/:id/status', requireRole('vendor', 'admin'), updateOrderStatus)

export default router
