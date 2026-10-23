import { User } from '../models/User.js'
import { VendorProfile } from '../models/VendorProfile.js'
import { Product } from '../models/Product.js'
import { Order } from '../models/Order.js'

export const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 })
    return res.json(users)
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Error fetching users' })
  }
}

export const getVendors = async (req, res) => {
  try {
    const vendors = await VendorProfile.find({})
      .populate('user', 'name email role createdAt')
      .sort({ createdAt: -1 })
    return res.json(vendors)
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Error fetching vendors' })
  }
}

export const approveVendor = async (req, res) => {
  try {
    const profile = await VendorProfile.findById(req.params.id)
    if (!profile) {
      return res.status(404).json({ message: 'Vendor profile not found' })
    }

    profile.approvalStatus = 'approved'
    await profile.save()

    return res.json({ message: 'Vendor approved successfully', profile })
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Error approving vendor' })
  }
}

export const rejectVendor = async (req, res) => {
  try {
    const profile = await VendorProfile.findById(req.params.id)
    if (!profile) {
      return res.status(404).json({ message: 'Vendor profile not found' })
    }

    profile.approvalStatus = 'rejected'
    await profile.save()

    return res.json({ message: 'Vendor rejected', profile })
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Error rejecting vendor' })
  }
}

export const getAdminAnalytics = async (req, res) => {
  try {
    const totalCustomers = await User.countDocuments({ role: 'customer' })
    const totalVendors = await User.countDocuments({ role: 'vendor' })
    const approvedVendors = await VendorProfile.countDocuments({ approvalStatus: 'approved' })
    const pendingVendors = await VendorProfile.countDocuments({ approvalStatus: 'pending' })
    const totalProducts = await Product.countDocuments({})
    const totalOrders = await Order.countDocuments({})

    // Exclude cancelled orders from platform gross revenue
    const activeOrders = await Order.find({ status: { $ne: 'Cancelled' } })
    const totalPlatformRevenue = activeOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0)

    return res.json({
      totalCustomers,
      totalVendors,
      approvedVendors,
      pendingVendors,
      totalProducts,
      totalOrders,
      totalPlatformRevenue: Number(totalPlatformRevenue.toFixed(2))
    })
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Error fetching admin analytics' })
  }
}
