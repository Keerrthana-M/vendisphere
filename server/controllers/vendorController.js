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

    // Find non-cancelled vendor orders to calculate true sales velocity
    const orders = await Order.find({ 
      'items.vendor': req.user._id,
      status: { $ne: 'Cancelled' }
    })

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
      let intelligenceNotice = 'No order velocity recorded yet'
      let suggestedReorder = 0

      if (avgDailySales > 0) {
        estimatedDaysStockout = Math.ceil(product.stock / avgDailySales)
        intelligenceNotice = `Estimated stockout in ~${estimatedDaysStockout} day(s) at ${avgDailySales} units/day`
        // 14-day supply model with a 5-unit safety buffer
        const targetInventory = Math.ceil(avgDailySales * 14) + 5
        suggestedReorder = Math.max(0, targetInventory - product.stock)
      } else if (product.stock <= 5) {
        intelligenceNotice = `Low stock (${product.stock} units). Consider initial batch restock.`
        suggestedReorder = 10 - product.stock
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
        suggestedReorder,
        intelligenceNotice,
        isLowStock,
        status: product.stock === 0 ? 'Out of Stock' : isLowStock ? 'Low Stock' : 'In Stock'
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
    const allOrders = await Order.find({ 'items.vendor': req.user._id })
    const activeOrders = allOrders.filter(o => o.status !== 'Cancelled')

    let totalRevenue = 0
    let productsSold = 0
    const productSalesCount = {}

    activeOrders.forEach(order => {
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
    const avgOrderValue = activeOrders.length > 0 ? totalRevenue / activeOrders.length : 0

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
      totalOrders: activeOrders.length,
      cancelledOrders: allOrders.length - activeOrders.length,
      averageOrderValue: Number(avgOrderValue.toFixed(2)),
      productsSold,
      totalProducts: products.length,
      lowStockCount,
      topProducts
    })
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Error fetching vendor analytics' })
  }
}
