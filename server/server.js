import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import { connectDB } from './config/db.js'

import authRoutes from './routes/authRoutes.js'
import productRoutes from './routes/productRoutes.js'
import cartRoutes from './routes/cartRoutes.js'
import orderRoutes from './routes/orderRoutes.js'
import reviewRoutes from './routes/reviewRoutes.js'
import vendorRoutes from './routes/vendorRoutes.js'
import adminRoutes from './routes/adminRoutes.js'
import aiRoutes from './routes/aiRoutes.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Connect MongoDB
connectDB()

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl, or same-origin)
    if (!origin) return callback(null, true)
    if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      return callback(null, true)
    }
    return callback(null, true)
  },
  credentials: true
}))
app.use(express.json())
app.use(cookieParser())

// API Routes
app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/cart', cartRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/reviews', reviewRoutes)
app.use('/api/vendor', vendorRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/ai', aiRoutes)

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'VendiSphere API Server Running' })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('[Server Error]:', err.stack)
  res.status(500).json({ message: err.message || 'Internal Server Error' })
})

app.listen(PORT, () => {
  console.log(`[VendiSphere Backend] Server running on http://localhost:${PORT}`)
})
