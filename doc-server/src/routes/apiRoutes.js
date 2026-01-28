// src/routes/apiRoutes.js
const express = require('express');
const {
  register,
  login,
  verifyOtp,
  resendOtp,
  forgotPassword,
  resetPassword,
} = require('../controllers/apiAuthController');

const { listDocs } = require('../controllers/apiDocController');
const apiAuthMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

/* ================= AUTH ================= */
router.post('/auth/register', register);
router.post('/auth/login', login);
router.post('/auth/verify-otp', verifyOtp);
router.post('/auth/resend-otp', resendOtp);
router.post('/auth/forgot-password', forgotPassword);
router.post('/auth/reset-password', resetPassword);

/* ================= PROTECTED ================= */
router.get('/docs', apiAuthMiddleware, listDocs);

module.exports = router;
