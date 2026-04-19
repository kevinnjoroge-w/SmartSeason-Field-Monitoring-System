const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db/pool');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, data: null, message: 'Email and password are required' });
    }

    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ success: false, data: null, message: 'Invalid credentials' });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, data: null, message: 'Invalid credentials' });
    }

    const payload = { id: user.id, role: user.role };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

    delete user.password;
    res.json({ success: true, data: { token, user }, message: 'Login successful' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, data: null, message: 'Server error' });
  }
});

// GET /api/auth/me
router.get('/me', authenticate, async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT id, name, email, role FROM users WHERE id = $1', [req.user.id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, data: null, message: 'User not found' });
    }
    res.json({ success: true, data: rows[0], message: 'User profile retrieved' });
  } catch (error) {
    console.error('Me update error:', error);
    res.status(500).json({ success: false, data: null, message: 'Server error' });
  }
});

module.exports = router;
