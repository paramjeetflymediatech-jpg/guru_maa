// src/config/config.js
require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 4000,
  JWT_SECRET: process.env.JWT_SECRET || 'dev-secret-key',
  BASE_URL: process.env.BASE_URL || 'http://localhost:4000',
  ADMIN_EMAIL: process.env.ADMIN_EMAIL || 'admin@yopmail.com',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'admin123', // dev only
   // MongoDB URI
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/guru-maa',
};