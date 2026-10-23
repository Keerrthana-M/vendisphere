import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import { User } from '../models/User.js'
import { VendorProfile } from '../models/VendorProfile.js'
import { Product } from '../models/Product.js'
import { Order } from '../models/Order.js'
import { Cart } from '../models/Cart.js'

dotenv.config()

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/vendisphere'
    console.log(`[Seed] Connecting to MongoDB: ${mongoUri}`)
    await mongoose.connect(mongoUri)

    console.log('[Seed] Clearing existing collections...')
    await User.deleteMany({})
    await VendorProfile.deleteMany({})
    await Product.deleteMany({})
    await Order.deleteMany({})
    await Cart.deleteMany({})

    const defaultPassword = await bcrypt.hash('password123', 10)
    const adminPassword = await bcrypt.hash('admin123', 10)

    // 1. Create Admin
    const admin = await User.create({
      name: 'Platform Admin',
      email: 'admin@vendisphere.com',
      password: adminPassword,
      role: 'admin'
    })

    // 2. Create Approved Vendors
    const techVendorUser = await User.create({
      name: 'TechHub Electronics',
      email: 'techvendor@vendisphere.com',
      password: defaultPassword,
      role: 'vendor'
    })

    const techVendorProfile = await VendorProfile.create({
      user: techVendorUser._id,
      businessName: 'TechHub Official Store',
      description: 'Authorized seller of premium audio gear and smart devices.',
      approvalStatus: 'approved'
    })

    const fashionVendorUser = await User.create({
      name: 'Style & Apparel Co',
      email: 'fashionvendor@vendisphere.com',
      password: defaultPassword,
      role: 'vendor'
    })

    const fashionVendorProfile = await VendorProfile.create({
      user: fashionVendorUser._id,
      businessName: 'Style & Apparel Store',
      description: 'Modern trendsetting footwear and lifestyle accessories.',
      approvalStatus: 'approved'
    })

    // 3. Create Pending Vendor (for approval testing)
    const pendingVendorUser = await User.create({
      name: 'Fresh Harvest Foods',
      email: 'pendingvendor@vendisphere.com',
      password: defaultPassword,
      role: 'vendor'
    })

    await VendorProfile.create({
      user: pendingVendorUser._id,
      businessName: 'Fresh Harvest Store',
      description: 'Artisanal organic snacks and natural groceries.',
      approvalStatus: 'pending'
    })

    // 4. Create Customer
    const customer = await User.create({
      name: 'John Customer',
      email: 'customer@vendisphere.com',
      password: defaultPassword,
      role: 'customer'
    })

    // 5. Seed Products
    const products = await Product.create([
      {
        name: 'Wireless Noise-Cancelling Headphones',
        description: 'High-fidelity audio with active noise cancellation, plush memory foam earcups, and 30-hour battery life.',
        category: 'Electronics',
        price: 8999,
        imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60',
        stock: 18,
        vendor: techVendorUser._id,
        rating: 4.8,
        reviewCount: 12
      },
      {
        name: 'Horizon Smartwatch Pro',
        description: 'Fitness smartwatch with AMOLED display, continuous heart rate tracking, sleep analytics, and 7-day battery.',
        category: 'Electronics',
        price: 14999,
        imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60',
        stock: 10,
        vendor: techVendorUser._id,
        rating: 4.6,
        reviewCount: 8
      },
      {
        name: 'Urban Flex Running Shoes',
        description: 'Lightweight breathable mesh sneakers designed for maximum cushioning, heel support, and road grip.',
        category: 'Fashion',
        price: 5499,
        imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=60',
        stock: 22,
        vendor: fashionVendorUser._id,
        rating: 4.7,
        reviewCount: 15
      },
      {
        name: 'Waterproof Laptop Backpack',
        description: 'Durable travel pack with dedicated 15.6" padded laptop sleeve, anti-theft zipper, and external USB port.',
        category: 'Accessories',
        price: 2999,
        imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&auto=format&fit=crop&q=60',
        stock: 30,
        vendor: fashionVendorUser._id,
        rating: 4.5,
        reviewCount: 6
      },
      {
        name: 'Organic Trail Snack Mix',
        description: 'Nutritious blend of dry roasted almonds, organic cranberries, pumpkin seeds, and dark chocolate chips.',
        category: 'Grocery',
        price: 649,
        imageUrl: 'https://images.unsplash.com/photo-1548681528-6a5c45b66b42?w=500&auto=format&fit=crop&q=60',
        stock: 45,
        vendor: techVendorUser._id,
        rating: 4.9,
        reviewCount: 20
      },
      {
        name: 'Fast Magnetic Wireless Charger',
        description: '15W fast wireless charging pad compatible with all Qi-enabled smartphones with sleek aluminum housing.',
        category: 'Accessories',
        price: 1799,
        imageUrl: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=500&auto=format&fit=crop&q=60',
        stock: 3,
        vendor: techVendorUser._id,
        rating: 4.4,
        reviewCount: 5
      },
      {
        name: 'Cotton Kurta Set',
        description: 'Premium breathable cotton kurta with matching pyjama, perfect for festive occasions and casual wear.',
        category: 'Fashion',
        price: 1299,
        imageUrl: 'https://images.unsplash.com/photo-1635355955841-3fe4c0c5d0be?w=500&auto=format&fit=crop&q=60',
        stock: 40,
        vendor: fashionVendorUser._id,
        rating: 4.3,
        reviewCount: 9
      },
      {
        name: 'Non-Stick Cookware Set (5 Piece)',
        description: 'Granite-coated non-stick pans and pots for healthy cooking with stay-cool handles and tempered glass lids.',
        category: 'Home & Kitchen',
        price: 3499,
        imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&auto=format&fit=crop&q=60',
        stock: 15,
        vendor: fashionVendorUser._id,
        rating: 4.6,
        reviewCount: 11
      }
    ])

    // 6. Seed Sample Order
    await Order.create({
      user: customer._id,
      items: [
        {
          product: products[0]._id,
          vendor: techVendorUser._id,
          quantity: 1,
          price: 8999
        },
        {
          product: products[2]._id,
          vendor: fashionVendorUser._id,
          quantity: 1,
          price: 5499
        }
      ],
      totalAmount: 14498,
      shippingAddress: {
        fullName: 'John Customer',
        address: '45 Brigade Road',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560001',
        phone: '9876543210'
      },
      status: 'Delivered'
    })

    console.log('[Seed] Database successfully seeded!')
    console.log('--------------------------------------------------')
    console.log('DEMO ACCOUNTS CREATED:')
    console.log('• Admin:    admin@vendisphere.com    / admin123')
    console.log('• Vendor:   techvendor@vendisphere.com / password123 (Approved)')
    console.log('• Vendor:   pendingvendor@vendisphere.com / password123 (Pending)')
    console.log('• Customer: customer@vendisphere.com / password123')
    console.log('--------------------------------------------------')

    process.exit(0)
  } catch (error) {
    console.error('[Seed Error]:', error)
    process.exit(1)
  }
}

seedData()
