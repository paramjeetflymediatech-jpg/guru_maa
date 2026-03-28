// src/routes/apiRoutes.js
const express = require('express');
const {
  register,
  login,
  verifyOtp,
  resendOtp,
  forgotPassword,
  resetPassword,
  updateDevice,
  deleteAccount,
  requestDeleteAccount,
} = require('../controllers/apiAuthController');

const { listDocs, listCategories, trackReading } = require('../controllers/apiDocController');
const apiAuthMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

/* ================= AUTH ================= */
router.post('/auth/register', register);
router.post('/auth/login', login);
router.post('/auth/verify-otp', verifyOtp);
router.post('/auth/resend-otp', resendOtp);
router.post('/auth/forgot-password', forgotPassword);
router.post('/auth/reset-password', resetPassword);
router.post('/auth/update-device', apiAuthMiddleware, updateDevice);
router.post('/auth/delete-account', apiAuthMiddleware, deleteAccount);
router.post('/auth/request-delete-account', apiAuthMiddleware, requestDeleteAccount);

/* ================= DOCUMENTS ================= */
router.get('/docs', apiAuthMiddleware, listDocs);
router.get('/docs/:id/read', apiAuthMiddleware, trackReading);

/* ================= CATEGORIES ================= */
router.get('/categories', apiAuthMiddleware, listCategories);

module.exports = router;
