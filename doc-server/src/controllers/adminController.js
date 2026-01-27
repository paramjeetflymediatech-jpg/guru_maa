// src/controllers/adminController.js
const path = require("path");
const {
  getAllDocuments,
  deleteDocument,
  DOCS_ROOT,
} = require("../models/documentModel");
const { ADMIN_EMAIL, ADMIN_PASSWORD } = require("../config/config");

function showLogin(req, res) {
  try {
    return res.render("admin/login", {title:"Admin Login", error: null });
  } catch (error) {
    return res.render("admin/login", { error: error.message });
  }
}

function handleLogin(req, res) {
  const { email, password } = req.body || {};
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    req.session.isAdmin = true;
    return res.redirect("/admin/docs");
  }
  return res.render("admin/login", { error: "Invalid credentials" });
}

function logout(req, res) {
  req.session.destroy(() => {
    res.redirect("/admin/login");
  });
}

function showDocs(req, res) {
  const docs = getAllDocuments();
  res.render("admin/docs", { docs });
}

// Multer sets req.file
function handleUpload(req, res) {
  if (!req.file) {
    return res.status(400).send("No file uploaded");
  }
  // File is saved by multer; list will include it next time
  return res.redirect("/admin/docs");
}

function handleDelete(req, res) {
  const relativePath = req.body.id; // from hidden input in form
  if (!relativePath) return res.redirect("/admin/docs");

  deleteDocument(relativePath);
  return res.redirect("/admin/docs");
}

module.exports = {
  showLogin,
  handleLogin,
  logout,
  showDocs,
  handleUpload,
  handleDelete,
};
