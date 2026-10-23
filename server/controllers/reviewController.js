import { Review } from '../models/Review.js'
import { Product } from '../models/Product.js'
import { Order } from '../models/Order.js'

export const createReview = async (req, res) => {
  try {
    const { productId, rating, comment } = req.body

    if (!productId || !rating || !comment) {
      return res.status(400).json({ message: 'Product ID, rating (1-5), and comment are required' })
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' })
    }

    const product = await Product.findById(productId)
    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }

    // Verify user has purchased this product
    const purchasedOrder = await Order.findOne({
      user: req.user._id,
      'items.product': productId
    })

    if (!purchasedOrder) {
      return res.status(403).json({ message: 'You can only review products you have purchased' })
    }

    // Check duplicate review
    const existingReview = await Review.findOne({
      user: req.user._id,
      product: productId
    })

    if (existingReview) {
      return res.status(400).json({ message: 'You have already submitted a review for this product' })
    }

    const review = await Review.create({
      user: req.user._id,
      product: productId,
      rating: Number(rating),
      comment
    })

    // Recalculate product rating & reviewCount
    const allReviews = await Review.find({ product: productId })
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length

    product.rating = Number(avgRating.toFixed(1))
    product.reviewCount = allReviews.length
    await product.save()

    return res.status(201).json({ message: 'Review created successfully', review })
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Error creating review' })
  }
}

export const getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate('user', 'name')
      .sort({ createdAt: -1 })

    return res.json(reviews)
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Error fetching reviews' })
  }
}
