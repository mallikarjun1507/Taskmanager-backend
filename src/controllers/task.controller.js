import Task from "../models/task.model.js"

/* =========================
   CREATE TASK
========================= */
export const createTask = async (req, res, next) => {
  try {
    const { title, description, assignedTo } = req.body

    if (!title)
      return res.status(400).json({ message: "Title is required" })

    const task = await Task.create({
      title,
      description,
      assignedTo,
      createdBy: req.user._id
    })

    req.app.get("io").emit("taskUpdated")

    res.status(201).json(task)
  } catch (error) {
    next(error)
  }
}

/* =========================
   GET TASKS (ROLE AWARE)
========================= */
export const getTasks = async (req, res) => {
  try {
    console.log("REQ USER:", req.user)

    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    const filter = {}

    // Role-based filtering
    if (req.user.role === "USER") {
      filter.assignedTo = req.user._id
    }

    if (req.query.status) {
      filter.status = req.query.status
    }

    if (req.query.assignedTo && req.user.role !== "USER") {
      filter.assignedTo = req.query.assignedTo
    }

    const tasks = await Task.find(filter)
      .populate("assignedTo", "name email")
      .sort("-createdAt")
      .skip(skip)
      .limit(limit)

    const total = await Task.countDocuments(filter)

    res.json({
      page,
      totalPages: Math.ceil(total / limit),
      total,
      tasks
    })

  } catch (error) {
    console.error(" GET TASK ERROR:", error)
    res.status(500).json({ message: error.message })
  }
}

/* =========================
   UPDATE TASK
========================= */
export const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)

    if (!task || task.deletedAt)
      return res.status(404).json({ message: "Task not found" })

    // USER can only update own task
    if (
      req.user.role === "USER" &&
      task.assignedTo?.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Access denied" })
    }

    Object.assign(task, req.body)
    await task.save()

    req.app.get("io").emit("taskUpdated")

    res.json(task)
  } catch (error) {
    next(error)
  }
}

/* =========================
   SOFT DELETE
========================= */
export const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)

    if (!task || task.deletedAt)
      return res.status(404).json({ message: "Task not found" })

    //  USER cannot delete unless ADMIN
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({
        message: "Only ADMIN can delete tasks"
      })
    }

    task.deletedAt = new Date()
    await task.save()

    req.app.get("io").emit("taskUpdated")

    res.json({ message: "Task soft deleted successfully" })
  } catch (error) {
    next(error)
  }
}
