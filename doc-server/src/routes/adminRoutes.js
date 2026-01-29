// src/routes/adminRoutes.js
const express = require("express");
const requireAdmin = require("../middleware/adminAuthMiddleware");
const {
  showLogin,
  handleLogin,
  logout,
  showDashboard,
  showDocs,
  handleUpload,
  handleDelete,
} = require("../controllers/adminController");

const {
  showUsers,
  showCreateUser,
  showEditUser,
  apiCreateUser,
  apiUpdateUser,
  apiDeleteUser,
  showSetupPassword,
  handleSetupPassword,
} = require("../controllers/userController");
const router = express.Router();
const upload = require("../middleware/uploadMiddleware");

// Login/logout
router.get("/login", showLogin);
router.post("/login", handleLogin);
router.get("/logout", logout);

// Dashboard (protected)
router.get("/dashboard", requireAdmin, showDashboard);

// Docs management (protected)
router.get("/docs", requireAdmin, showDocs);
router.post("/docs/upload", requireAdmin, upload.single("file"), handleUpload);
router.post("/docs/delete", requireAdmin, handleDelete);

// User Management Routes (protected)
router.get("/users", requireAdmin, showUsers);
router.get("/users/create", requireAdmin, showCreateUser);
router.get("/users/edit/:id", requireAdmin, showEditUser);
router.post("/users/create", requireAdmin, apiCreateUser);
router.post("/users/update", requireAdmin, apiUpdateUser);
router.post("/users/delete", requireAdmin, apiDeleteUser);
router.get("/setup-password/:token", showSetupPassword);
router.post("/setup-password/:token", handleSetupPassword);

module.exports = router;
