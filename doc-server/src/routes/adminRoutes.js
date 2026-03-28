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
  showCategories,
  handleCategoryCreate,
  handleCategoryUpdate,
  handleCategoryDelete,
  showCreateText,
  handleTextCreate,
  showEditDoc,
  handleDocUpdate,
  handleSearch,
  showDeleteRequests,
  handleDeleteRequestAction,
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
router.post("/docs/search", requireAdmin, handleSearch);

// Text content creation
router.get("/docs/create/text", requireAdmin, showCreateText);
router.post("/docs/create/text", requireAdmin, handleTextCreate);

// Edit document
router.get("/docs/edit/:id", requireAdmin, showEditDoc);
router.post("/docs/edit/:id", requireAdmin, handleDocUpdate);

// Categories management (protected)
router.get("/categories", requireAdmin, showCategories);
router.post("/categories/create", requireAdmin, handleCategoryCreate);
router.post("/categories/update", requireAdmin, handleCategoryUpdate);
router.post("/categories/delete", requireAdmin, handleCategoryDelete);

// Deletion Requests (protected)
router.get("/delete-requests", requireAdmin, showDeleteRequests);
router.post("/delete-requests/action", requireAdmin, handleDeleteRequestAction);

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
