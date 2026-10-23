import { Product } from '../models/Product.js'
import { Order } from '../models/Order.js'
import { VendorProfile } from '../models/VendorProfile.js'

export const getVendorProducts = async (req, res) => {
  try {
    const products = await Product.find({ vendor: req.user._id }).sort({ createdAt: -1 })
    return res.json(products)
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Error fetching vendor products' })
  }
}

export const getVendorInventory = async (req, res) => {
  try {
    const products = await Product.find({ vendor: req.user._id })

    // Find all vendor order items to calculate average daily sales
    const orders = await Order.find({ 'items.vendor': req.user._id })

    const salesMap = {}
    let earliestOrderDate = new Date()

    orders.forEach(order => {
      if (order.createdAt < earliestOrderDate) {
        earliestOrderDate = order.createdAt
      }
      order.items.forEach(item => {
        if (item.vendor.toString() === req.user._id.toString()) {
          const pid = item.product.toString()
          salesMap[pid] = (salesMap[pid] || 0) + item.quantity
        }
      })
    })

    // Calculate days operating
    const now = new Date()
    const diffTime = Math.abs(now - earliestOrderDate)
    const daysOperating = Math.max(Math.ceil(diffTime / (1000 * 60 * 60 * 24)), 1)

    const inventoryData = products.map(product => {
      const pid = product._id.toString()
      const totalSold = salesMap[pid] || 0
      const avgDailySales = Number((totalSold / daysOperating).toFixed(2))

      let estimatedDaysStockout = null
      let intelligenceNotice = 'Not enough sales data'

      if (avgDailySales > 0) {
        estimatedDaysStockout = Math.ceil(product.stock / avgDailySales)
        intelligenceNotice = `Estimated stockout in approx. ${estimatedDaysStockout} day(s)`
      }

      const isLowStock = product.stock <= 5

      return {
        _id: product._id,
        name: product.name,
        category: product.category,
        price: product.price,
        stock: product.stock,
        totalSold,
        avgDailySales,
        estimatedDaysStockout,
        intelligenceNotice,
        isLowStock,
        status: isLowStock ? 'Low Stock' : 'In Stock'
      }
    })

    return res.json(inventoryData)
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Error fetching vendor inventory' })
  }
}

export const getVendorAnalytics = async (req, res) => {
  try {
    const products = await Product.find({ vendor: req.user._id })
    const orders = await Order.find({ 'items.vendor': req.user._id })

    let totalRevenue = 0
    let productsSold = 0
    const productSalesCount = {}

    orders.forEach(order => {
      order.items.forEach(item => {
        if (item.vendor.toString() === req.user._id.toString()) {
          totalRevenue += item.price * item.quantity
          productsSold += item.quantity

          const pid = item.product.toString()
          productSalesCount[pid] = (productSalesCount[pid] || 0) + item.quantity
        }
      })
    })

    const lowStockCount = products.filter(p => p.stock <= 5).length

    // Sort products by sales
    const topProducts = products.map(p => {
      const pid = p._id.toString()
      return {
        _id: p._id,
        name: p.name,
        category: p.category,
        price: p.price,
        stock: p.stock,
        unitsSold: productSalesCount[pid] || 0,
        revenue: (productSalesCount[pid] || 0) * p.price
      }
    }).sort((a, b) => b.unitsSold - a.unitsSold).slice(0, 5)

    return res.json({
      totalRevenue: Number(totalRevenue.toFixed(2)),
      totalOrders: orders.length,
      productsSold,
      totalProducts: products.length,
      lowStockCount,
      topProducts
    })
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Error fetching vendor analytics' })
  }
}
