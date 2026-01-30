// src/config/config.js
require("dotenv").config();
const path = require("path");
module.exports = {
  //SERVER PORT
  PORT: process.env.PORT || 3002,

  //SECRET KEY
  JWT_SECRET: process.env.JWT_SECRET || "dev-secret-key",

  //SERVER URL
  BASE_URL: process.env.BASE_URL || "http://localhost:3002",

  //DOCS UPLOAD PATH
  DOCS_ROOT: path.join(__dirname, "../../", "public", "docs"),

  // MongoDB URI
  MONGODB_URI: process.env.MONGODB_URI || "mongodb://localhost:27017/guru-maa",

  // Email Config
  EMAIL_HOST: process.env.EMAIL_HOST,
  EMAIL_PORT: process.env.EMAIL_PORT,
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS,
  EMAIL_SECURE: process.env.EMAIL_SECURE === "true",

  //GOOGLE SERVICE ACCOUNT
  TYPE: process.env.TYPE,
  PROJECT_ID: process.env.PROJECT_ID,
  PRIVATE_KEY_ID: process.env.PRIVATE_KEY_ID,
  PRIVATE_KEY: process.env.PRIVATE_KEY,
  CLIENT_EMAIL: process.env.CLIENT_EMAIL,
  CLIENT_ID: process.env.CLIENT_ID,
  AUTH_URL: process.env.AUTH_URL,
  TOKEN_URL: process.env.TOKEN_URL,
  AUTH_PROVIDER_CERT_URL: process.env.AUTH_PROVIDER_CERT_URL,
  CLIENT_PROVIDER_CERT_URL: process.env.CLIENT_PROVIDER_CERT_URL,
  UNIVERSE_DOMAIN: process.env.UNIVERSE_DOMAIN,
};
