/* 404 Middleware */
export const notFound = (req, res, next) => {
  const error = new Error(`Route Not Found - ${req.originalUrl}`)
  res.status(404)
  next(error)
}

/* Global Error Handler */
export const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode

  // Mongoose Cast Error (Invalid ObjectId)
  if (err.name === "CastError") {
    statusCode = 400
    err.message = "Invalid ID format"
  }

  // Duplicate Key Error
  if (err.code === 11000) {
    statusCode = 400
    err.message = "Duplicate field value entered"
  }

  // Validation Error
  if (err.name === "ValidationError") {
    statusCode = 400
    err.message = Object.values(err.errors)
      .map(val => val.message)
      .join(", ")
  }

  res.status(statusCode).json({
    success: false,
    message: err.message,
    stack:
      process.env.NODE_ENV === "production"
        ? undefined
        : err.stack
  })
}
