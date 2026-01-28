const {
  getPaginatedUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  findUserByEmail,
  updateUserByToken,
  findUserByToken
} = require('../models/userModel');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS, EMAIL_SECURE, BASE_URL } = require('../config/config');
 
// Email Transporter
const transporter = nodemailer.createTransport({
  host: EMAIL_HOST,
  port: parseInt(EMAIL_PORT) || 587,
  secure: EMAIL_SECURE, // true for 465, false for other ports
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS,
  },
});

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
  try {
    const user = await getUserById(id);

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
      // Maybe we still want to send a "Welcome" email, but the prompt emphasizes "link goes to user email then they can setup"
      // If password SET by admin, we might not need the SETUP link, but maybe a login link?
      // The prompt says "also add password input also when when admin and new user set passowrd link goes on user email"
      // This is ambiguous. I'll assume if password IS provided, we set it.
      // If NOT provided, we generate a token for setup.
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
        await transporter.sendMail(mailOptions);
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
