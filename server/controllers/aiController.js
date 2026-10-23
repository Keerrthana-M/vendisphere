import { Product } from '../models/Product.js'
import { Order } from '../models/Order.js'
import { generateShoppingAssistantResponse, generateVendorInsightsResponse } from '../services/aiService.js'

export const shoppingAssistant = async (req, res) => {
  try {
    const { query } = req.body
    const availableProducts = await Product.find({}).select('name category description price imageUrl rating')
    const response = await generateShoppingAssistantResponse(query, availableProducts)
    return res.json(response)
  } catch (error) {
    return res.status(500).json({ 
      reply: 'Shopping Assistant service is momentarily updating. Please try searching directly in the marketplace!',
      recommendations: []
    })
  }
}

export const vendorInsights = async (req, res) => {
  try {
    const products = await Product.find({ vendor: req.user._id })
    const orders = await Order.find({ 'items.vendor': req.user._id })

    let totalRevenue = 0
    let totalOrders = orders.length

    orders.forEach(o => {
      o.items.forEach(item => {
        if (item.vendor.toString() === req.user._id.toString()) {
          totalRevenue += item.price * item.quantity
        }
      })
    })

    const inventoryStatus = products.map(p => ({
      name: p.name,
      stock: p.stock
    }))

    const insightsResponse = await generateVendorInsightsResponse({
      totalRevenue,
      totalOrders,
      products,
      inventoryStatus
    })

    return res.json(insightsResponse)
  } catch (error) {
    return res.status(500).json({ 
      summary: 'VendiSphere AI Vendor Insights',
      insights: ['Maintain optimal inventory levels to serve growing customer demand.'],
      generatedAt: new Date().toISOString()
    })
  }
}
