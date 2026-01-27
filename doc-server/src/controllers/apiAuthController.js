// src/controllers/apiAuthController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/config');

const users = []; // dev only, use DB later

function createToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
}

async function register(req, res) {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  const existing = users.find(u => u.email === email);
  if (existing) {
    return res.status(400).json({ error: 'Email already registered' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = { id: String(users.length + 1), email, passwordHash };
  users.push(user);

  const token = createToken(user.id);
  return res.json({ token });
}

async function login(req, res) {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  const user = users.find(u => u.email === email);
  if (!user) {
    return res.status(400).json({ error: 'Invalid email or password' });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res.status(400).json({ error: 'Invalid email or password' });
  }

  const token = createToken(user.id);
  return res.json({ token });
}

module.exports = { register, login };