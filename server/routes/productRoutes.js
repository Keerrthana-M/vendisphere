import express from 'express'
import { getProducts, getProductById, createProduct, updateProduct, deleteProduct } from '../controllers/productController.js'
import { requireAuth, requireRole } from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/', getProducts)
router.get('/:id', getProductById)
router.post('/', requireAuth, requireRole('vendor', 'admin'), createProduct)
router.put('/:id', requireAuth, requireRole('vendor', 'admin'), updateProduct)
router.delete('/:id', requireAuth, requireRole('vendor', 'admin'), deleteProduct)

export default router
