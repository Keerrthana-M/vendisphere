import mongoose from 'mongoose'
import dotenv from 'dotenv'
import { Product } from '../models/Product.js'

dotenv.config()

const imageFixMap = [
  {
    name: 'Cotton Kurta Set',
    imageUrl: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=500&auto=format&fit=crop&q=60'
  },
  {
    name: 'Organic Trail Snack Mix',
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=500&auto=format&fit=crop&q=60'
  },
  {
    name: 'Fast Magnetic Wireless Charger',
    imageUrl: 'https://images.unsplash.com/photo-1587471879279-55d3a67e89e3?w=500&auto=format&fit=crop&q=60'
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
