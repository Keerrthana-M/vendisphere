import mongoose from 'mongoose'
import { Product } from '../models/Product.js'

await mongoose.connect('mongodb://127.0.0.1:27017/vendisphere')
const products = await Product.find({}, 'name imageUrl').lean()
for (const p of products) {
  console.log(`NAME: "${p.name}"`)
  console.log(`IMG:  ${p.imageUrl}`)
  console.log('---')
}
process.exit(0)
