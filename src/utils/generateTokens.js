import jwt from "jsonwebtoken"
import crypto from "crypto"

/* =========================
   ACCESS TOKEN
========================= */
export const generateAccessToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined")
  }

  return jwt.sign(
    {
      id: user._id,
      role: user.role
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_ACCESS_EXPIRES || "15m",
      issuer: "task-manager-api",
      audience: "task-manager-client"
    }
  )
}

/* =========================
   REFRESH TOKEN
========================= */
export const generateRefreshToken = (user) => {
  if (!process.env.JWT_REFRESH_SECRET) {
    throw new Error("JWT_REFRESH_SECRET is not defined")
  }

  return jwt.sign(
    {
      id: user._id,
      jti: crypto.randomUUID() 
    },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRES || "7d",
      issuer: "task-manager-api",
      audience: "task-manager-client"
    }
  )
}
