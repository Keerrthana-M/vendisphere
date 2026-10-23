import { Order } from '../models/Order.js'
import { Cart } from '../models/Cart.js'
import { Product } from '../models/Product.js'

export const createOrder = async (req, res) => {
  try {
    const { shippingAddress } = req.body

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.address || !shippingAddress.city || !shippingAddress.state || !shippingAddress.postalCode || !shippingAddress.phone) {
      return res.status(400).json({ message: 'Full shipping address details are required' })
    }

    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product')

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' })
    }

    let totalAmount = 0
    const orderItems = []

    for (const item of cart.items) {
      const product = item.product
      if (!product) {
        return res.status(404).json({ message: 'One or more products in your cart no longer exist' })
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `Insufficient stock for "${product.name}". Only ${product.stock} available.` })
      }

      totalAmount += product.price * item.quantity
      orderItems.push({
        product: product._id,
        vendor: product.vendor,
        quantity: item.quantity,
        price: product.price
      })
    }

    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      totalAmount,
      shippingAddress,
      status: 'Placed'
    })

    // Reduce product stock
    for (const item of cart.items) {
      await Product.findByIdAndUpdate(item.product._id, {
        $inc: { stock: -item.quantity }
      })
    }

    // Clear cart
    cart.items = []
    await cart.save()

    return res.status(201).json({
      message: 'Order placed successfully',
      order
    })
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Error creating order' })
  }
}

export const getCustomerOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product', 'name imageUrl category price')
      .populate('items.vendor', 'name')
      .sort({ createdAt: -1 })

    return res.json(orders)
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Error fetching orders' })
  }
}

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.product', 'name imageUrl category price description')
      .populate('items.vendor', 'name email')
      .populate('user', 'name email')

    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }

    // Verify user owns order or is vendor/admin
    const isOwner = order.user._id.toString() === req.user._id.toString()
    const isVendorInOrder = order.items.some(item => item.vendor._id.toString() === req.user._id.toString())
    const isAdmin = req.user.role === 'admin'

    if (!isOwner && !isVendorInOrder && !isAdmin) {
      return res.status(403).json({ message: 'Unauthorized to view this order' })
    }

    return res.json(order)
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Error fetching order' })
  }
}

export const getVendorOrders = async (req, res) => {
  try {
    // Find orders that contain at least one item belonging to this vendor
    const orders = await Order.find({ 'items.vendor': req.user._id })
      .populate('items.product', 'name imageUrl category price')
      .populate('user', 'name email')
      .sort({ createdAt: -1 })

    // Filter order items so vendor only sees their own items
    const vendorOrders = orders.map(order => {
      const orderObj = order.toObject()
      orderObj.items = orderObj.items.filter(item => item.vendor.toString() === req.user._id.toString())
      return orderObj
    })

    return res.json(vendorOrders)
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Error fetching vendor orders' })
  }
}

export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body
    const validStatuses = ['Placed', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled']

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid order status' })
    }

    const order = await Order.findById(req.params.id)
    if (!order) {
      return res.status(404).json({ message: 'Order not found' })
    }

    // Check permission
    const isVendorInOrder = order.items.some(item => item.vendor.toString() === req.user._id.toString())
    const isAdmin = req.user.role === 'admin'

    if (!isVendorInOrder && !isAdmin) {
      return res.status(403).json({ message: 'Unauthorized to update this order' })
    }

    order.status = status
    await order.save()

    return res.json({ message: 'Order status updated successfully', order })
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Error updating order status' })
  }
}

export const getAllOrdersAdmin = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('user', 'name email')
      .populate('items.product', 'name category price')
      .sort({ createdAt: -1 })

    return res.json(orders)
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Error fetching admin orders' })
  }
}
