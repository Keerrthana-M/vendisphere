import { Cart } from '../models/Cart.js'
import { Product } from '../models/Product.js'

export const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate({
      path: 'items.product',
      populate: { path: 'vendor', select: 'name' }
    })

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] })
    }

    return res.json(cart)
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Error fetching cart' })
  }
}

export const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body

    if (!productId) {
      return res.status(400).json({ message: 'Product ID is required' })
    }

    const product = await Product.findById(productId)
    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }

    if (product.stock < quantity) {
      return res.status(400).json({ message: `Insufficient stock. Only ${product.stock} items available.` })
    }

    let cart = await Cart.findOne({ user: req.user._id })
    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] })
    }

    const existingIndex = cart.items.findIndex(item => item.product.toString() === productId)

    if (existingIndex > -1) {
      const newQty = cart.items[existingIndex].quantity + Number(quantity)
      if (product.stock < newQty) {
        return res.status(400).json({ message: `Cannot add more. Available stock is ${product.stock}.` })
      }
      cart.items[existingIndex].quantity = newQty
    } else {
      cart.items.push({ product: productId, quantity: Number(quantity) })
    }

    await cart.save()
    const updatedCart = await Cart.findById(cart._id).populate({
      path: 'items.product',
      populate: { path: 'vendor', select: 'name' }
    })

    return res.json(updatedCart)
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Error adding to cart' })
  }
}

export const updateCartItem = async (req, res) => {
  try {
    const { itemId } = req.params
    const { quantity } = req.body

    const cart = await Cart.findOne({ user: req.user._id })
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' })
    }

    const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId)
    if (itemIndex === -1) {
      return res.status(404).json({ message: 'Cart item not found' })
    }

    if (Number(quantity) <= 0) {
      cart.items.splice(itemIndex, 1)
    } else {
      const product = await Product.findById(cart.items[itemIndex].product)
      if (product && product.stock < Number(quantity)) {
        return res.status(400).json({ message: `Only ${product.stock} items available in stock.` })
      }
      cart.items[itemIndex].quantity = Number(quantity)
    }

    await cart.save()
    const updatedCart = await Cart.findById(cart._id).populate({
      path: 'items.product',
      populate: { path: 'vendor', select: 'name' }
    })

    return res.json(updatedCart)
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Error updating cart item' })
  }
}

export const removeCartItem = async (req, res) => {
  try {
    const { itemId } = req.params

    const cart = await Cart.findOne({ user: req.user._id })
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' })
    }

    cart.items = cart.items.filter(item => item._id.toString() !== itemId)

    await cart.save()
    const updatedCart = await Cart.findById(cart._id).populate({
      path: 'items.product',
      populate: { path: 'vendor', select: 'name' }
    })

    return res.json(updatedCart)
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Error removing item from cart' })
  }
}
