import { Product } from '../models/Product.js'
import { User } from '../models/User.js'
import { VendorProfile } from '../models/VendorProfile.js'

export const getProducts = async (req, res) => {
  try {
    const { search, category, vendor } = req.query
    let filter = {}

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ]
    }

    if (category && category !== 'All') {
      filter.category = category
    }

    if (vendor) {
      filter.vendor = vendor
    }

    const products = await Product.find(filter)
      .populate('vendor', 'name email')
      .sort({ createdAt: -1 })

    return res.json(products)
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Error fetching products' })
  }
}

export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('vendor', 'name email')
    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }

    // Attach vendor profile business name if available
    const vendorProfile = await VendorProfile.findOne({ user: product.vendor._id })

    return res.json({
      ...product.toObject(),
      vendorBusinessName: vendorProfile ? vendorProfile.businessName : product.vendor.name
    })
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Error fetching product' })
  }
}

export const createProduct = async (req, res) => {
  try {
    const { name, description, category, price, imageUrl, stock } = req.body

    if (!name || !description || !category || price === undefined || !imageUrl || stock === undefined) {
      return res.status(400).json({ message: 'All product fields are required' })
    }

    const product = await Product.create({
      name,
      description,
      category,
      price: Number(price),
      imageUrl,
      stock: Number(stock),
      vendor: req.user._id
    })

    return res.status(201).json(product)
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Error creating product' })
  }
}

export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)

    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }

    if (product.vendor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized to modify this product' })
    }

    const { name, description, category, price, imageUrl, stock } = req.body

    if (name) product.name = name
    if (description) product.description = description
    if (category) product.category = category
    if (price !== undefined) product.price = Number(price)
    if (imageUrl) product.imageUrl = imageUrl
    if (stock !== undefined) product.stock = Number(stock)
    product.updatedAt = Date.now()

    await product.save()
    return res.json(product)
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Error updating product' })
  }
}

export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)

    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }

    if (product.vendor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Unauthorized to delete this product' })
    }

    await Product.findByIdAndDelete(req.params.id)
    return res.json({ message: 'Product deleted successfully' })
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Error deleting product' })
  }
}
