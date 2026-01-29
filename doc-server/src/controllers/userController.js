const User = require("../models/userModel");
const crypto = require("crypto");
const { EMAIL_USER, BASE_URL } = require("../config/config");
const { sendPasswordSetupEmail } = require("../utils/mailer");
const mongoose = require("mongoose");
async function showUsers(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const { users, pagination } = await getPaginatedUsers(page, limit);

    res.render("admin/users/list", {
      title: "User Management",
      users,
      pagination,
      currentPage: "users",
    });
  } catch (err) {
    req.session.flash = { type: "error", message: "Error fetching users." };
    res.redirect("/admin/dashboard");
  }
}

function showCreateUser(req, res) {
  res.render("admin/users/create", {
    title: "Add New User",
    currentPage: "users",
  });
}

async function showEditUser(req, res) {
  const { id } = req.params;
  console.log(req.params, "param", id);
  try {
    const user = await User.findById({ _id: id });

    if (!user) {
      req.session.flash = { type: "error", message: "User not found." };
      return res.redirect("/admin/users");
    }

    res.render("admin/users/edit", {
      title: "Edit User",
      user,
      currentPage: "users",
    });
  } catch (err) {
    req.session.flash = { type: "error", message: "Invalid User ID." };
    res.redirect("/admin/users");
  }
}

// Helper to handle error with sticky data
function handleErrorWithStickyData(req, res, url, message, data) {
  req.session.flash = { type: "error", message };
  req.session.formData = data;
  return res.redirect(url);
}

async function apiCreateUser(req, res) {
  const { name, email, role, status, password } = req.body;

  if (!name || !email) {
    return handleErrorWithStickyData(
      req,
      res,
      "/admin/users/create",
      "Name and Email are required.",
      req.body,
    );
  }

  // Check if email already exists
  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    return handleErrorWithStickyData(
      req,
      res,
      "/admin/users/create",
      "Email already exists.",
      req.body,
    );
  }

  try {
    let userData = { name, email, role, status };
    let shouldSendEmail = true; // Default to sending invitation

    // If password is provided, save it
    if (password && password.trim() !== "") {
      userData.password = password;
      shouldSendEmail = false;
    }

    // Always generate a token if no password, or if we want to support password reset immediately
    let token;
    if (!userData.password) {
      token = crypto.randomBytes(20).toString("hex");
      userData.resetPasswordToken = token;
      userData.resetPasswordExpires = Date.now() + 3600000 * 24; // 24 hours
    }

    await createUser(userData);

    if (!userData.password) {
      // Send Invitation Email
      // Assuming adminRoutes is mounted at /admin
      const resetUrl = `${BASE_URL}/admin/setup-password/${token}`;
      const mailOptions = {
        from: `"Guru Maa Admin" <${EMAIL_USER}>`,
        to: email,
        subject: "Welcome to Guru Maa - Set Your Password",
        html: `
                    <h3>Welcome ${name},</h3>
                    <p>You have been invited to join the Guru Maa Admin Panel.</p>
                    <p>Please click the link below to set your password:</p>
                    <a href="${resetUrl}">${resetUrl}</a>
                    <p>This link will expire in 24 hours.</p>
                `,
      };

      // Non-blocking email sending to avoid delay, or await if critical
      // Given it's an admin action, awaiting is safer to know if it failed
      try {
        await sendPasswordSetupEmail(mailOptions);
        req.session.flash = {
          type: "success",
          message: "User created and invitation sent.",
        };
      } catch (emailErr) {
        console.error("Email Error:", emailErr);
        req.session.flash = {
          type: "warning",
          message: "User created but failed to send invitation email.",
        };
      }
    } else {
      req.session.flash = {
        type: "success",
        message: "User created with password.",
      };
    }

    // Clear form data
    if (req.session.formData) delete req.session.formData;
    res.redirect("/admin/users");
  } catch (err) {
    return handleErrorWithStickyData(
      req,
      res,
      "/admin/users/create",
      "Error creating user: " + err.message,
      req.body,
    );
  }
}

async function apiUpdateUser(req, res) {
  const { id, name, email, role, status } = req.body;

  if (!id) {
    req.session.flash = { type: "error", message: "User ID is missing." };
    return res.redirect("/admin/users");
  }

  // Check for email conflict (excluding current user)
  // We fetch user by email first
  const conflictUser = await findUserByEmail(email);
  // If user exists AND it's not the same ID as the one we are updating
  if (conflictUser && conflictUser._id.toString() !== id) {
    return handleErrorWithStickyData(
      req,
      res,
      `/admin/users/edit/${id}`,
      "Email is already taken by another user.",
      req.body,
    );
  }

  try {
    const updated = await updateUser(id, { name, email, role, status });
    if (updated) {
      req.session.flash = {
        type: "success",
        message: "User updated successfully.",
      };
      if (req.session.formData) delete req.session.formData;
    } else {
      req.session.flash = { type: "error", message: "User not found." };
    }
  } catch (err) {
    req.session.flash = { type: "error", message: "Error updating user." };
  }
  res.redirect("/admin/users");
}

async function apiDeleteUser(req, res) {
  const { id } = req.body;
  if (!id) {
    req.session.flash = { type: "error", message: "Invalid request." };
    return res.redirect("/admin/users");
  }

  const deleted = await deleteUser(id);
  if (deleted) {
    req.session.flash = {
      type: "success",
      message: "User deleted successfully.",
    };
  } else {
    req.session.flash = { type: "error", message: "Failed to delete user." };
  }
  res.redirect("/admin/users");
}

async function showSetupPassword(req, res) {
  const { token } = req.params;
  const user = await findUserByToken(token);

  if (!user) {
    req.session.flash = {
      type: "error",
      message: "Password reset token is invalid or has expired.",
    };
    return res.redirect("/admin/login");
  }

  res.render("admin/setup-password", {
    title: "Set Your Password",
    token,
    error: req.session.flash ? req.session.flash.message : null,
  });
}

async function handleSetupPassword(req, res) {
  const { token } = req.params;
  const { password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    req.session.flash = { type: "error", message: "Passwords do not match." };
    return res.redirect(`/setup-password/${token}`);
  }

  const user = await findUserByToken(token);
  if (!user) {
    req.session.flash = { type: "error", message: "Token invalid or expired." };
    return res.redirect("/admin/login");
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  req.session.flash = {
    type: "success",
    message: "Password set successfully! Please login.",
  };
  res.redirect("/admin/login");
}

async function getPaginatedUsers(page = 1, limit = 10) {
  const skip = (page - 1) * limit;
  const users = await User.find({ role: { $ne: "admin" } })
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
  console.loh(id, "d");
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  return await User.findById({ _id: id });
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

async function findUserByToken(token) {
  return await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  });
}

module.exports = {
  showUsers,
  showCreateUser,
  showEditUser,
  apiCreateUser,
  apiUpdateUser,
  apiDeleteUser,
  showSetupPassword,
  handleSetupPassword,
};
