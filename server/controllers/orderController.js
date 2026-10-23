import { Order } from '../models/Order.js'
import { Cart } from '../models/Cart.js'
import { Product } from '../models/Product.js'

export const createOrder = async (req, res) => {
  try {
    const { shippingAddress } = req.body

    if (
      !shippingAddress ||
      !shippingAddress.fullName ||
      !shippingAddress.address ||
      !shippingAddress.city ||
      !shippingAddress.state ||
      !shippingAddress.postalCode ||
      !shippingAddress.phone
    ) {
      return res.status(400).json({ message: 'Full shipping address details are required' })
    }

    const cleanPhone = shippingAddress.phone.replace(/[\s\-\(\)]/g, '')
    if (cleanPhone.length < 10) {
      return res.status(400).json({ message: 'Please provide a valid 10-digit phone number' })
    }

    const cart = await Cart.findOne({ user: req.user._id }).populate('items.product')

    if (!cart || !cart.items || cart.items.length === 0) {
      return res.status(400).json({ message: 'Your shopping cart is empty' })
    }

    // 1. Pre-validate all items exist and calculate authoritative total
    let totalAmount = 0
    const orderItems = []

    for (const item of cart.items) {
      const product = item.product
      if (!product) {
        return res.status(404).json({ message: 'One or more products in your cart no longer exist. Please update your cart.' })
      }

      totalAmount += product.price * item.quantity
      orderItems.push({
        product: product._id,
        vendor: product.vendor,
        quantity: item.quantity,
        price: product.price
      })
    }

    // 2. Atomic stock reservation with automatic rollback on race conditions
    const decrementedItems = []
    for (const item of cart.items) {
      const updatedProduct = await Product.findOneAndUpdate(
        { _id: item.product._id, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
        { new: true }
      )

      if (!updatedProduct) {
        // Rollback any items that were already decremented in this transaction
        for (const rolledItem of decrementedItems) {
          await Product.findByIdAndUpdate(rolledItem.productId, {
            $inc: { stock: rolledItem.quantity }
          })
        }
        return res.status(400).json({
          message: `Insufficient stock for "${item.product.name}". The remaining stock was reserved by another buyer.`
        })
      }

      decrementedItems.push({
        productId: item.product._id,
        quantity: item.quantity
      })
    }

    // 3. Create persistent Order document
    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      totalAmount: Number(totalAmount.toFixed(2)),
      shippingAddress: {
        fullName: shippingAddress.fullName.trim(),
        address: shippingAddress.address.trim(),
        city: shippingAddress.city.trim(),
        state: shippingAddress.state.trim(),
        postalCode: shippingAddress.postalCode.trim(),
        phone: cleanPhone
      },
      status: 'Placed'
    })

    // 4. Safely clear user's cart
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

    const previousStatus = order.status

    // If order was cancelled and somebody tries to un-cancel, prevent unless admin
    if (previousStatus === 'Cancelled' && status !== 'Cancelled' && !isAdmin) {
      return res.status(400).json({ message: 'Cannot reactivate a cancelled order' })
    }

    // If order transitions to Cancelled from an active status, restore product inventory
    if (status === 'Cancelled' && previousStatus !== 'Cancelled') {
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity }
        })
      }
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
