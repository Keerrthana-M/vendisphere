import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { Product } from '../models/Product.js'

dotenv.config()

const imageFixMap = [
  {
    name: 'Cotton Kurta Set',
    imageUrl: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Organic Trail Snack Mix',
    imageUrl: 'https://images.unsplash.com/photo-1599599810769-bcde5a160d32?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Fast Magnetic Wireless Charger',
    imageUrl: 'https://images.unsplash.com/photo-1615526675159-e248c3021d3f?w=600&auto=format&fit=crop&q=80'
  }
]

const fixImages = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/vendisphere'
    console.log(`[FixImages] Connecting to MongoDB: ${mongoUri}`)
    await mongoose.connect(mongoUri)

    for (const fix of imageFixMap) {
      // Force update regardless of current value
      const result = await Product.findOneAndUpdate(
        { name: fix.name },
        { $set: { imageUrl: fix.imageUrl } },
        { new: true }
      )
      if (result) {
        console.log(`✅ Updated: ${fix.name} → ${fix.imageUrl}`)
      } else {
        console.log(`❌ Product not found: ${fix.name}`)
      }
    }

    console.log('\n[FixImages] Done!')
    process.exit(0)
  } catch (error) {
    console.error('[FixImages Error]:', error)
    process.exit(1)
  }
}

fixImages()
