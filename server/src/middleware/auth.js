import jwt from 'jsonwebtoken'
import { config } from '../config/index.js'
import { User } from '../models/User.js'

export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
  if (!token) {
    return res.status(401).json({ message: 'Authentication required' })
  }
  try {
    const decoded = jwt.verify(token, config.jwt.accessSecret)
    req.userId = decoded.userId
    next()
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' })
  }
}

export async function attachUser(req, res, next) {
  if (!req.userId) return next()
  try {
    const user = await User.findById(req.userId).select('email name _id').lean()
    if (user) req.user = { ...user, id: user._id.toString() }
  } catch (_) {}
  next()
}
