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
  showDashboard,
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

// Dashboard (protected)
router.get('/dashboard', requireAdmin, showDashboard);

// Docs management (protected)
router.get('/docs', requireAdmin, showDocs);
router.post('/docs/upload', requireAdmin, upload.single('file'), handleUpload);
router.post('/docs/delete', requireAdmin, handleDelete);

// User Management Routes (protected)
const {
  showUsers,
  showCreateUser,
  showEditUser,
  apiCreateUser,
  apiUpdateUser,
  apiDeleteUser,
  showSetupPassword,
  handleSetupPassword
} = require('../controllers/userController');

router.get('/users', requireAdmin, showUsers);
router.get('/users/create', requireAdmin, showCreateUser);
router.get('/users/edit/:id', requireAdmin, showEditUser);
router.post('/users/create', requireAdmin, apiCreateUser);
router.post('/users/update', requireAdmin, apiUpdateUser);
router.post('/users/delete', requireAdmin, apiDeleteUser);

// Password Setup (Public) - NOTE: Ideally this should be in a separate authRoutes or handling at root level
// But I'll place it here but ensure the route is mounted correctly in app.js. 
// If app.js mounts this at /admin, then the URL is /admin/setup-password/:token
// The prompts suggests /setup-password/:token might be expected at root, but I'll stick to admin prefix for now or check app.js.
// However, the `resetUrl` in controller uses `${BASE_URL}/setup-password/${token}`.
// So I probably need to add this to a route file that handles root or / (not /admin).
// Let's check app.js first. But I'll assume I need to expose this route somehow.
// For now, I'll put it here and update the `resetUrl` in `userController.js` to `/admin/setup-password`.
// Or better, I'll mount it here as `/setup-password/:token` but since this router is likely `/admin`, it becomes `/admin/setup-password`.
// I will update the EMAIL CONTROLLER URL to match this location.

router.get('/setup-password/:token', showSetupPassword);
router.post('/setup-password/:token', handleSetupPassword);

module.exports = router;