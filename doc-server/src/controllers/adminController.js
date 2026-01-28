// src/controllers/adminController.js
const path = require("path");
const {
  getAllDocuments,
  getPaginatedDocuments,
  createDocument,
  deleteDocument,
  getDocumentCount,
  DOCS_ROOT,
} = require("../models/documentModel");
const { User } = require("../models/userModel");
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

async function showDashboard(req, res) {
  try {
    const docCount = await getDocumentCount();
    const userCount = await User.countDocuments();
    const docs = await getAllDocuments();
    const recentDocs = docs.slice(0, 5);

    const data = {
      title: 'Dashboard',
      subtitle: 'Welcome back! Here\'s your admin overview.',
      currentPage: 'dashboard',
      stats: [
        { icon: '📄', label: 'Documents', value: docCount, change: 'total files' },
        { icon: '📚', label: 'API Docs', value: 5, change: 'endpoints' },
        { icon: '💾', label: 'Storage', value: '125 MB', change: 'used' },
        { icon: '👥', label: 'Users', value: userCount, change: 'active users' }
      ],
      actions: [
        { icon: '➕', label: 'Upload Document', link: '/admin/docs' },
        { icon: '📝', label: 'API Docs', link: '/admin/api-docs' },
        { icon: '⚙️', label: 'Settings', link: '/admin/settings' }
      ],
      recentDocs: recentDocs,
      systemStatus: [
        { label: 'Database', description: 'MongoDB', status: 'Connected', type: 'active' },
        { label: 'API Server', description: 'Express.js', status: 'Running', type: 'active' },
        { label: 'Storage', description: 'Local Disk', status: 'Available', type: 'active' }
      ]
    };

    res.render("admin/dashboard", data);
  } catch (err) {
    console.error("Dashboard Error:", err);
    res.render("admin/dashboard", {
      title: 'Dashboard',
      subtitle: 'Error loading dashboard',
      currentPage: 'dashboard',
      stats: [],
      actions: [],
      recentDocs: [],
      systemStatus: []
    });
  }
}

async function showDocs(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // Using getPaginatedDocuments instead of getAllDocuments
    const result = await getPaginatedDocuments(page, limit);
    const docs = result.docs;
    const pagination = result.pagination;

    res.render("admin/docs", {
      docs,
      pagination,
      currentPage: 'docs'
    });
  } catch (err) {
    console.error("Docs Error:", err);
    req.session.flash = { type: 'error', message: 'Error loading documents.' };
    res.redirect("/admin/dashboard");
  }
}

// Multer sets req.file
async function handleUpload(req, res) {
  if (!req.file) {
    req.session.flash = { type: 'error', message: 'No file uploaded.' };
    return res.redirect("/admin/docs");
  }

  try {
    await createDocument({
      title: req.file.originalname,
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size
    });

    req.session.flash = { type: 'success', message: 'Document uploaded successfully.' };
  } catch (err) {
    console.error(err);
    req.session.flash = { type: 'error', message: 'Error saving document info.' };
  }
  return res.redirect("/admin/docs");
}

async function handleDelete(req, res) {
  const docId = req.body.id; // Expecting MongoDB _id now
  if (!docId) {
    req.session.flash = { type: 'error', message: 'Invalid document ID.' };
    return res.redirect("/admin/docs");
  }

  try {
    const success = await deleteDocument(docId);
    if (success) {
      req.session.flash = { type: 'success', message: 'Document deleted successfully.' };
    } else {
      req.session.flash = { type: 'error', message: 'Failed to delete document.' };
    }
  } catch (err) {
    req.session.flash = { type: 'error', message: 'Error deleting document.' };
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
