// src/middleware/adminAuthMiddleware.js
const jwt = require("jsonwebtoken");
function requireAdmin(req, res, next) {
  try {
    const token = req.cookies?.admin_token;

    if (!token) {
      return res.redirect("/admin/login");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;
    next();
  } catch (err) {
    console.error("JWT Error:", err.message);
    return res.redirect("/admin/login");
  }
}

module.exports = requireAdmin;
