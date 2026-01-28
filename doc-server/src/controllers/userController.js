const {
    // getAllUsers,
    getPaginatedUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    findUserByEmail,
    // updateUserByToken,
    // findUserByToken
} = require('../models/userModel');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS, BASE_URL } = require('../config/config');

// Email Transporter
const transporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port: EMAIL_PORT,
    secure: false, // true for 465, false for other ports
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

        res.render('admin/users/list', {
            title: 'User Management',
            users,
            pagination,
            currentPage: 'users'
        });
    } catch (err) {
        req.session.flash = { type: 'error', message: 'Error fetching users.' };
        res.redirect('/admin/dashboard');
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
    const { name, email, role, status } = req.body;

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
        await createUser({ name, email, role, status });
        req.session.flash = { type: 'success', message: 'User created successfully.' };
        // Clear form data if any exists
        if (req.session.formData) delete req.session.formData;
        res.redirect('/admin/users');
    } catch (err) {
        return handleErrorWithStickyData(req, res, '/admin/users/create', 'Error creating user: ' + err.message, req.body);
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
    apiDeleteUser
};
