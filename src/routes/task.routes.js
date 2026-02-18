import express from "express"
import {
  createTask,
  getTasks,
  updateTask,
  deleteTask
} from "../controllers/task.controller.js"

import { protect } from "../middlewares/auth.middleware.js"
import { authorizeRoles } from "../middlewares/role.middleware.js"

const router = express.Router()

/* All routes require authentication */
router.use(protect)

/* Create - ADMIN & MANAGER */
router.post(
  "/",
  authorizeRoles("ADMIN", "MANAGER"),
  createTask
)

/* Get - All roles */
router.get("/", getTasks)

/* Update - ADMIN, MANAGER, USER (with restriction inside controller) */
router.put(
  "/:id",
  authorizeRoles("ADMIN", "MANAGER", "USER"),
  updateTask
)

/* Delete - ADMIN only */
router.delete(
  "/:id",
  authorizeRoles("ADMIN"),
  deleteTask
)

export default router
