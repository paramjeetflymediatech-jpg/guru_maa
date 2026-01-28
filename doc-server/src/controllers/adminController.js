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
    return res.render("admin/login", { title: "Admin Login", error: null });
  } catch (error) {
    return res.render("admin/login", { error: error.message });
  }
}

function handleLogin(req, res) {
  const { email, password } = req.body || {};
  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    req.session.isAdmin = true;
    req.session.flash = { type: 'success', message: 'Welcome back, Admin!' };
    return res.redirect("/admin/dashboard");
  }
  req.session.flash = { type: 'error', message: 'Invalid credentials' };
  return res.redirect("/admin/login");
}

function logout(req, res) {
  req.session.destroy(() => {
    res.redirect("/admin/login");
  });
}

function showDashboard(req, res) {
  const docs = getAllDocuments();

  const data = {
    title: 'Dashboard',
    subtitle: 'Welcome back! Here\'s your admin overview.',
    currentPage: 'dashboard',
    stats: [
      { icon: '📄', label: 'Documents', value: docs.length, change: '+5 this month' },
      { icon: '📚', label: 'API Docs', value: 5, change: 'endpoints' },
      { icon: '💾', label: 'Storage', value: '125 MB', change: 'used' },
      { icon: '👥', label: 'Users', value: 12, change: 'active today' }
    ],
    actions: [
      { icon: '➕', label: 'Upload Document', link: '/admin/docs' },
      { icon: '📝', label: 'API Docs', link: '/admin/api-docs' },
      { icon: '⚙️', label: 'Settings', link: '/admin/settings' }
    ],
    recentDocs: docs.slice(0, 5),
    systemStatus: [
      { label: 'Database', description: 'MongoDB', status: 'Connected', type: 'active' },
      { label: 'API Server', description: 'Express.js', status: 'Running', type: 'active' },
      { label: 'Storage', description: 'Local Disk', status: 'Available', type: 'active' }
    ]
  };

  res.render("admin/dashboard", data);
}

function showDocs(req, res) {
  const docs = getAllDocuments();
  res.render("admin/docs", {
    docs,
    currentPage: 'docs'
  });
}

// Multer sets req.file
// Multer sets req.file
function handleUpload(req, res) {
  if (!req.file) {
    req.session.flash = { type: 'error', message: 'No file uploaded.' };
    return res.redirect("/admin/docs"); // Changed to redirect to show toast
  }

  req.session.flash = { type: 'success', message: 'Document uploaded successfully.' };
  return res.redirect("/admin/docs");
}

function handleDelete(req, res) {
  const relativePath = req.body.id; // from hidden input in form
  if (!relativePath) {
    req.session.flash = { type: 'error', message: 'Invalid document ID.' };
    return res.redirect("/admin/docs");
  }

  const success = deleteDocument(relativePath);
  if (success) {
    req.session.flash = { type: 'success', message: 'Document deleted successfully.' };
  } else {
    req.session.flash = { type: 'error', message: 'Failed to delete document.' };
  }
  return res.redirect("/admin/docs");
}

module.exports = {
  showLogin,
  handleLogin,
  logout,
  showDashboard,
  showDocs,
  handleUpload,
  handleDelete,
};
