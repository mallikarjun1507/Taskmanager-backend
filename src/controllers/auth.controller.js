import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import User from "../models/user.model.js"
import {
  generateAccessToken,
  generateRefreshToken
} from "../utils/generateTokens.js"

/* =========================
   REGISTER
========================= */
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields are required" })

    const existingUser = await User.findOne({ email })
    if (existingUser)
      return res.status(400).json({ message: "Email already exists" })

    const user = await User.create({
      name,
      email,
      password
    })

    res.status(201).json({
      message: "User registered successfully"
    })
  } catch (error) {
    next(error)
  }
}

/* =========================
   LOGIN
========================= */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email })
      .select("+password +refreshToken")

    if (!user)
      return res.status(400).json({ message: "Invalid credentials" })

    const valid = await bcrypt.compare(password, user.password)

    if (!valid)
      return res.status(400).json({ message: "Invalid credentials" })

    const accessToken = generateAccessToken(user)
    const refreshToken = generateRefreshToken(user)

    user.refreshToken = refreshToken
    await user.save()

    return res.json({
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    })

  } catch (error) {
    console.error("LOGIN ERROR:", error)
    next(error)
  }
}

/* =========================
   REFRESH TOKEN (ROTATION)
========================= */
export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body

    if (!refreshToken)
      return res.status(401).json({ message: "No refresh token" })

    // VERIFY TOKEN
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET
    )

    const user = await User.findById(decoded.id)
      .select("+refreshToken")

    if (!user)
      return res.status(403).json({ message: "User not found" })

    // CHECK IF TOKEN MATCHES DB
    if (user.refreshToken !== refreshToken)
      return res.status(403).json({ message: "Invalid refresh token" })

    // ROTATE TOKEN
    const newAccessToken = generateAccessToken(user)
    const newRefreshToken = generateRefreshToken(user)

    user.refreshToken = newRefreshToken
    await user.save()

    return res.json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    })

  } catch (error) {
    console.log("REFRESH ERROR:", error.message)
    return res.status(403).json({ message: "Invalid or expired token" })
  }
}

/* =========================
   LOGOUT
========================= */
export const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body

    if (!refreshToken)
      return res.json({ message: "Logged out" })

    const user = await User.findOne({ refreshToken })

    if (user) {
      user.refreshToken = null
      await user.save()
    }

    return res.json({ message: "Logged out successfully" })

  } catch (error) {
    return res.status(500).json({ message: "Logout failed" })
  }
}

/* =========================
   GET PROFILE
========================= */
export const getProfile = async (req, res) => {
  return res.json({
    id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role
  })
}
