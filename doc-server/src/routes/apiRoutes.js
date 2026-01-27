// src/routes/apiRoutes.js
const express = require('express');
const { register, login } = require('../controllers/apiAuthController');
const { listDocs } = require('../controllers/apiDocController');
const apiAuthMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/auth/register', register);
router.post('/auth/login', login);
router.get('/docs', apiAuthMiddleware, listDocs);

module.exports = router;