// src/models/deleteRequestModel.js
const mongoose = require("mongoose");

const deleteRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  reason: {
    type: String,
    required: false,
    trim: true,
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
});

// Middleware to update the updatedAt field
deleteRequestSchema.pre("save", function () {
  this.updatedAt = Date.now();
});

module.exports = mongoose.model("DeleteRequest", deleteRequestSchema);
