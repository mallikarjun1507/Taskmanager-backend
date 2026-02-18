import mongoose from "mongoose"

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"]
    },

    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description too long"]
    },

    status: {
      type: String,
      enum: {
        values: ["TODO", "IN_PROGRESS", "DONE"],
        message: "Invalid status value"
      },
      default: "TODO"
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    deletedAt: {
      type: Date,
      default: null,
      index: true
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
)

/* Compound index for better filtering performance */
taskSchema.index({ status: 1, assignedTo: 1 })

/* Prevent returning soft-deleted tasks by default */
taskSchema.pre(/^find/, function () {
  this.where({ deletedAt: null })
})


export default mongoose.model("Task", taskSchema)
