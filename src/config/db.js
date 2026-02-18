import mongoose from "mongoose"

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not defined in environment variables")
    }

    mongoose.set("strictQuery", true)

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      autoIndex: process.env.NODE_ENV !== "production"
    })

    console.log(
      ` MongoDB Connected: ${conn.connection.host}`
    )

    /* Connection Events */
    mongoose.connection.on("connected", () => {
      console.log(" Mongoose connected to DB")
    })

    mongoose.connection.on("error", (err) => {
      console.error(" Mongoose connection error:", err.message)
    })

    mongoose.connection.on("disconnected", () => {
      console.warn(" Mongoose disconnected")
    })

  } catch (error) {
    console.error(" Database connection failed:", error.message)
    process.exit(1)
  }
}

/* Graceful Shutdown */
process.on("SIGINT", async () => {
  await mongoose.connection.close()
  console.log(" MongoDB connection closed due to app termination")
  process.exit(0)
})


export default connectDB
