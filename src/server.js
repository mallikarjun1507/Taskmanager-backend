import express from "express"
import http from "http"
import dotenv from "dotenv"
import cors from "cors"
import helmet from "helmet"
import rateLimit from "express-rate-limit"
import cookieParser from "cookie-parser"
import { Server } from "socket.io"


import connectDB from "./config/db.js"
import taskRoutes from "./routes/task.routes.js"
import authRoutes from "./routes/auth.routes.js"
import { notFound, errorHandler } from "./middlewares/error.middleware.js"
import User from "./models/user.model.js" 

dotenv.config()

/* =========================
   DATABASE CONNECTION
========================= */
connectDB()

/* =========================
   CREATE DEFAULT ADMIN
========================= */
const createDefaultAdmin = async () => {
  try {
    const adminExists = await User.findOne({ role: "ADMIN" })

    if (!adminExists) {
      await User.create({
        name: "Super Admin",
        email: "admin@taskmanager.com",
        password: "admin123",  
        role: "ADMIN"
      })

      console.log(" Default ADMIN created")
    } else {
      console.log(" Admin already exists")
    }
  } catch (error) {
    console.error("Admin creation error:", error)
  }
}

setTimeout(() => {
  createDefaultAdmin()
}, 3000)

//Check Manager
    const managerExists = await User.findOne({ role: "MANAGER" })

    if (!managerExists) {
      await User.create({
        name: "Project Manager",
        email: "manager@taskmanager.com",
        password: "manager123",
        role: "MANAGER"
      })
      console.log(" Default MANAGER created")
    }



/* =========================
   APP INIT
========================= */
const app = express()
const server = http.createServer(app)

/* =========================
   TRUST PROXY (Production)
========================= */
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1)
}

/* =========================
   SOCKET.IO
========================= */
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "*",
    credentials: true
  }
})

app.set("io", io)

io.on("connection", (socket) => {
  console.log(" Socket connected:", socket.id)

  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id)
  })
})

/* =========================
   GLOBAL MIDDLEWARES
========================= */
app.use(express.json({ limit: "10kb" }))
app.use(cookieParser())

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true
  })
)

app.use(
  helmet({
    crossOriginResourcePolicy: false
  })
)

/* =========================
   GLOBAL RATE LIMIT
========================= */
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: "Too many requests, try again later"
  })
)

/* =========================
   HEALTH CHECK
========================= */
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    uptime: process.uptime()
  })
})

/* =========================
   ROUTES
========================= */
app.use("/api/auth", authRoutes)
app.use("/api/tasks", taskRoutes)

/* =========================
   ERROR HANDLING
========================= */
app.use(notFound)
app.use(errorHandler)

/* =========================
   SERVER START
========================= */
const PORT = process.env.PORT || 5000

server.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`)
})

/* =========================
   GRACEFUL SHUTDOWN
========================= */
process.on("SIGTERM", () => {
  console.log("SIGTERM received. Shutting down...")
  server.close(() => {
    console.log(" Process terminated")
  })
})
