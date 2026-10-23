import { Product } from '../models/Product.js'
import { User } from '../models/User.js'
import { VendorProfile } from '../models/VendorProfile.js'
import { PRODUCT_CATEGORIES } from '../config/constants.js'

export const getProducts = async (req, res) => {
  try {
    const { search, category, vendor, minPrice, maxPrice, inStockOnly, sort } = req.query
    let filter = {}

    if (search && search.trim() !== '') {
      filter.$or = [
        { name: { $regex: search.trim(), $options: 'i' } },
        { description: { $regex: search.trim(), $options: 'i' } }
      ]
    }

    if (category && category !== 'All') {
      filter.category = category
    }

    if (vendor) {
      filter.vendor = vendor
    }

    if (minPrice !== undefined && minPrice !== '' || maxPrice !== undefined && maxPrice !== '') {
      filter.price = {}
      if (minPrice !== undefined && minPrice !== '') {
        const minVal = Number(minPrice)
        if (!isNaN(minVal)) filter.price.$gte = minVal
      }
      if (maxPrice !== undefined && maxPrice !== '') {
        const maxVal = Number(maxPrice)
        if (!isNaN(maxVal)) filter.price.$lte = maxVal
      }
    }

    if (inStockOnly === 'true' || inStockOnly === true) {
      filter.stock = { $gt: 0 }
    }

    let sortOptions = { createdAt: -1 }
    if (sort === 'price_asc') {
      sortOptions = { price: 1 }
    } else if (sort === 'price_desc') {
      sortOptions = { price: -1 }
    } else if (sort === 'rating_desc') {
      sortOptions = { rating: -1, reviewCount: -1 }
    } else if (sort === 'newest') {
      sortOptions = { createdAt: -1 }
    }

    const products = await Product.find(filter)
      .populate('vendor', 'name email')
      .sort(sortOptions)

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

    if (!PRODUCT_CATEGORIES.includes(category)) {
      return res.status(400).json({ 
        message: `Invalid category "${category}". Must be one of: ${PRODUCT_CATEGORIES.join(', ')}` 
      })
    }

    const numPrice = Number(price)
    const numStock = Number(stock)

    if (isNaN(numPrice) || numPrice < 0) {
      return res.status(400).json({ message: 'Price must be a positive number' })
    }

    if (isNaN(numStock) || numStock < 0 || !Number.isInteger(numStock)) {
      return res.status(400).json({ message: 'Stock must be a non-negative integer' })
    }

    const product = await Product.create({
      name: name.trim(),
      description: description.trim(),
      category,
      price: numPrice,
      imageUrl: imageUrl.trim(),
      stock: numStock,
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

    if (category) {
      if (!PRODUCT_CATEGORIES.includes(category)) {
        return res.status(400).json({
          message: `Invalid category "${category}". Must be one of: ${PRODUCT_CATEGORIES.join(', ')}`
        })
      }
      product.category = category
    }

    if (name) product.name = name.trim()
    if (description) product.description = description.trim()
    if (imageUrl) product.imageUrl = imageUrl.trim()

    if (price !== undefined) {
      const numPrice = Number(price)
      if (isNaN(numPrice) || numPrice < 0) {
        return res.status(400).json({ message: 'Price must be a positive number' })
      }
      product.price = numPrice
    }

    if (stock !== undefined) {
      const numStock = Number(stock)
      if (isNaN(numStock) || numStock < 0 || !Number.isInteger(numStock)) {
        return res.status(400).json({ message: 'Stock must be a non-negative integer' })
      }
      product.stock = numStock
    }

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
