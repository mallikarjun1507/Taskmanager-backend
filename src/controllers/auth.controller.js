import bcrypt from "bcryptjs"
import User from "../models/user.model.js"
import {
  generateAccessToken,
  generateRefreshToken
} from "../utils/generateTokens.js"
import jwt from "jsonwebtoken"

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

    //  DO NOT HASH HERE
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

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000 // very important
    })

    res.json({
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    })

  } catch (error) {
    console.error(" LOGIN ERROR:", error)
    next(error)
  }
}


/* =========================
   REFRESH TOKEN (ROTATION)
========================= */
export const refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken
    

    if (!token)
      return res.status(401).json({ message: "No refresh token" })

    const decoded = jwt.verify(
      token,
      process.env.JWT_REFRESH_SECRET
    )
    
    const user = await User.findById(decoded.id)
     .select("+refreshToken")
    const email = user.email


    if (!user || user.refreshToken !== token)
      return res.status(403).json({ message: "Invalid refresh token" })

    //  Token Rotation (Very Important)
    const newAccessToken = generateAccessToken(user)
    const newRefreshToken = generateRefreshToken(user)
    user.refreshToken = newRefreshToken
    await user.save()

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "None",
      path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000 // very important
    })
    res.json({ accessToken: newAccessToken,user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      } })
  } catch (error) {
    return res.status(403).json({ message: "Invalid or expired token" })
  }
}

/* =========================
   LOGOUT
========================= */
export const logout = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken

    if (!token)
      return res.json({ message: "Logged out" })

    const user = await User.findOne({ refreshToken: token })

    if (user) {
      user.refreshToken = null
      await user.save()
    }

    res.clearCookie("refreshToken", {
      httpOnly: true,
      sameSite: "None",
      secure: true
    })

    res.json({ message: "Logged out successfully" })
  } catch (error) {
    next(error)
  }
}

/* =========================
   GET PROFILE
========================= */
export const getProfile = async (req, res) => {
  res.json(req.user)
}
