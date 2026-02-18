import express from "express"
import {
  register,
  login,
  refreshToken,
  logout,
  getProfile
} from "../controllers/auth.controller.js"

import { protect } from "../middlewares/auth.middleware.js"
import { authorizeRoles } from "../middlewares/role.middleware.js"
import User from "../models/user.model.js"

const router = express.Router()

/* =========================
   AUTH ROUTES
========================= */

/* Register */
router.post("/register", register)

/* Login */
router.post("/login", login)

/* Refresh Access Token */
router.post("/refresh", refreshToken)

/* Logout */
router.post("/logout", logout)

/* Get Current User Profile */
router.get("/me", protect, getProfile)

/* =========================
   GET USERS (For Task Assignment)
   Only ADMIN & MANAGER
========================= */
router.get(
  "/users",
  protect,
  authorizeRoles("ADMIN", "MANAGER"),
  async (req, res) => {
    try {
      const users = await User.find({
        role: "USER",
        deletedAt: null
      }).select("name email role")

      res.json(users)
    } catch (error) {
      res.status(500).json({ message: error.message })
    }
  }
)

export default router
