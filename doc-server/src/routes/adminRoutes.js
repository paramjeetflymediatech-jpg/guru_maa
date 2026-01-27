// src/routes/adminRoutes.js
const express = require('express');
const multer = require('multer');
const path = require('path');
const { DOCS_ROOT } = require('../models/documentModel');
const requireAdmin = require('../middleware/adminAuthMiddleware');
const {
  showLogin,
  handleLogin,
  logout,
  showDocs,
  handleUpload,
  handleDelete,
} = require('../controllers/adminController');

const router = express.Router();

// Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, DOCS_ROOT); // all files into docs root; you can change to subfolders later
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname); // keep original filename
  },
});
const upload = multer({ storage });

// Login/logout
router.get('/login', showLogin);
router.post('/login', handleLogin);
router.get('/logout', logout);

// Docs management (protected)
router.get('/docs', requireAdmin, showDocs);
router.post('/docs/upload', requireAdmin, upload.single('file'), handleUpload);
router.post('/docs/delete', requireAdmin, handleDelete);

module.exports = router;