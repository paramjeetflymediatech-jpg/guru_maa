const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user",
  },
  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "active",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  password: {
    type: String,
  },
  otp: {
    type: String,
  },
  isVerified: {
    tyoe: Boolean,
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
});

const bcrypt = require("bcryptjs");

// Hash password before saving
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// Method to check password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);

// Service Layer Wrappers

async function getAllUsers() {
  return await User.find().sort({ createdAt: -1 });
}

async function getPaginatedUsers(page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  const users = await User.find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
  const total = await User.countDocuments();
  return {
    users,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      totalDocs: total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

async function getUserById(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  return await User.findById(id);
}

async function createUser(userData) {
  const user = new User(userData);
  return await user.save();
}

async function updateUser(id, updateData) {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  // { new: true } returns the updated document
  return await User.findByIdAndUpdate(id, updateData, { new: true });
}

async function deleteUser(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) return false;
  const result = await User.findByIdAndDelete(id);
  return !!result;
}

// Check email existence (helper for validation)
async function findUserByEmail(email) {
  return await User.findOne({ email });
}

module.exports = {
  User, // Exporting the model itself too, just in case
  getAllUsers,
  getPaginatedUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  findUserByEmail,
  updateUserByToken,
  findUserByToken,
};

async function updateUserByToken(token, updateData) {
  return await User.findOneAndUpdate(
    {
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    },
    updateData,
    { new: true },
  );
}

async function findUserByToken(token) {
  return await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  });
}
