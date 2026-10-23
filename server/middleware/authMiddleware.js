import jwt from 'jsonwebtoken'
import { User } from '../models/User.js'
import { VendorProfile } from '../models/VendorProfile.js'

export const requireAuth = async (req, res, next) => {
  try {
    let token = req.cookies?.token

    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1]
    }

    if (!token) {
      return res.status(401).json({ message: 'Authentication required' })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'vendisphere_super_secret_jwt_key_2026')
    const user = await User.findById(decoded.id).select('-password')

    if (!user) {
      return res.status(401).json({ message: 'User no longer exists' })
    }

    req.user = user
    next()
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' })
  }
}

export const requireRole = (...roles) => {
  return async (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied. Insufficient permissions.' })
    }

    // Additional check for vendor approval status
    if (req.user.role === 'vendor' && roles.includes('vendor')) {
      const profile = await VendorProfile.findOne({ user: req.user._id })
      if (!profile || profile.approvalStatus !== 'approved') {
        return res.status(403).json({ 
          message: 'Vendor account is pending admin approval. You cannot operate until approved.',
          approvalStatus: profile ? profile.approvalStatus : 'pending'
        })
      }
    }

    next()
  }
}
