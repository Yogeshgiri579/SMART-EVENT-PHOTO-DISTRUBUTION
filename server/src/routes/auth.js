import { Router } from 'express'
import jwt from 'jsonwebtoken'
import { config } from '../config/index.js'
import { User } from '../models/User.js'
import { authMiddleware, attachUser } from '../middleware/auth.js'

const router = Router()

router.post('/register', async (req, res, next) => {
  try {
    const { email, password, name } = req.body
    if (!email || !password || !name) {
      return res.status(400).json({ message: 'Email, password and name are required' })
    }
    const existing = await User.findOne({ email })
    if (existing) return res.status(400).json({ message: 'Email already registered' })
    const user = await User.create({ email, password, name })
    const accessToken = jwt.sign(
      { userId: user._id },
      config.jwt.accessSecret,
      { expiresIn: config.jwt.accessExpiry }
    )
    const refreshToken = jwt.sign(
      { userId: user._id },
      config.jwt.refreshSecret,
      { expiresIn: config.jwt.refreshExpiry }
    )
    const u = user.toObject()
    delete u.password
    res.status(201).json({
      user: { ...u, id: u._id.toString() },
      accessToken,
      refreshToken,
    })
  } catch (e) {
    next(e)
  }
})

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }
    const user = await User.findOne({ email }).select('+password')
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' })
    }
    const accessToken = jwt.sign(
      { userId: user._id },
      config.jwt.accessSecret,
      { expiresIn: config.jwt.accessExpiry }
    )
    const refreshToken = jwt.sign(
      { userId: user._id },
      config.jwt.refreshSecret,
      { expiresIn: config.jwt.refreshExpiry }
    )
    const u = user.toObject()
    delete u.password
    res.json({
      user: { ...u, id: u._id.toString() },
      accessToken,
      refreshToken,
    })
  } catch (e) {
    next(e)
  }
})

router.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body
    if (!refreshToken) return res.status(400).json({ message: 'Refresh token required' })
    const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret)
    const accessToken = jwt.sign(
      { userId: decoded.userId },
      config.jwt.accessSecret,
      { expiresIn: config.jwt.accessExpiry }
    )
    res.json({ accessToken })
  } catch {
    return res.status(401).json({ message: 'Invalid refresh token' })
  }
})

router.get('/me', authMiddleware, attachUser, async (req, res) => {
  if (!req.user) return res.status(401).json({ message: 'User not found' })
  res.json({ user: req.user })
})

export default router
