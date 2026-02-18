import jwt from "jsonwebtoken"
import User from "../models/user.model.js"

export const protect = async (req, res, next) => {
  try {
    let token

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1]
    }

    if (!token) {
      return res.status(401).json({
        message: "Not authorized. Token missing."
      })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // password & refreshToken are select:false
    const user = await User.findById(decoded.id).select("+role")

    if (!user) {
      return res.status(401).json({
        message: "User no longer exists"
      })
    }

    if (user.deletedAt) {
      return res.status(401).json({
        message: "User account is deactivated"
      })
    }

    req.user = user
    next()
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Token expired"
      })
    }

    return res.status(401).json({
      message: "Invalid token"
    })
  }
}
