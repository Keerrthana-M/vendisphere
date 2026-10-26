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

// Allowed origins: localhost in dev, CLIENT_URL (Vercel URL) in production
const ALLOWED_ORIGINS = [
  /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/,
  ...(process.env.CLIENT_URL ? [process.env.CLIENT_URL] : [])
]

// Connect MongoDB
connectDB()

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl, same-origin)
    if (!origin) return callback(null, true)
    const allowed = ALLOWED_ORIGINS.some(pattern =>
      typeof pattern === 'string' ? pattern === origin : pattern.test(origin)
    )
    if (allowed) return callback(null, true)
    return callback(new Error(`CORS: origin ${origin} not allowed`))
  },
  credentials: true
}))

// Set secure cookie flags in production
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Vary', 'Origin')
  }
  next()
})
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

// Listen on 0.0.0.0 so cloud platforms (Render) can route traffic correctly
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[VendiSphere Backend] Server running on port ${PORT}`)
})
