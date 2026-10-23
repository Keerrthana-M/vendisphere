import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { User } from '../models/User.js'
import { VendorProfile } from '../models/VendorProfile.js'

const generateToken = (res, userId, role) => {
  const secret = process.env.JWT_SECRET || 'vendisphere_super_secret_jwt_key_2026'
  const token = jwt.sign({ id: userId, role }, secret, { expiresIn: '7d' })

  res.cookie('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  })

  return token
}

export const register = async (req, res) => {
  try {
    const { name, email, password, role, businessName, description } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' })
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already registered' })
    }

    // Prevent public registration of admin users
    const userRole = (role === 'vendor') ? 'vendor' : 'customer'

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: userRole
    })

    let vendorProfile = null
    if (userRole === 'vendor') {
      vendorProfile = await VendorProfile.create({
        user: user._id,
        businessName: businessName || `${name}'s Store`,
        description: description || 'Vendor storefront on VendiSphere marketplace.',
        approvalStatus: 'pending'
      })
    }

    const token = generateToken(res, user._id, user.role)

    return res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        vendorProfile
      }
    })
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Server error during registration' })
  }
}

export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    let vendorProfile = null
    if (user.role === 'vendor') {
      vendorProfile = await VendorProfile.findOne({ user: user._id })
    }

    const token = generateToken(res, user._id, user.role)

    return res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        vendorProfile
      }
    })
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Server error during login' })
  }
}

export const logout = async (req, res) => {
  res.clearCookie('token')
  return res.json({ message: 'Logout successful' })
}

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password')
    let vendorProfile = null
    if (user.role === 'vendor') {
      vendorProfile = await VendorProfile.findOne({ user: user._id })
    }

    return res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        vendorProfile
      }
    })
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Server error' })
  }
}
