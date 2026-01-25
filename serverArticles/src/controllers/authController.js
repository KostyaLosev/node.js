const express = require('express');
const authService = require('../services/authService');

const router = express.Router();

function isValidEmail(value) {
  return typeof value === 'string' && value.includes('@');
}

router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!isValidEmail(email)) return res.status(400).json({ error: 'Valid email is required' });
    if (typeof password !== 'string' || password.trim().length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const user = await authService.registerUser(email, password);
    res.status(201).json({ id: user.id, email: user.email });
  } catch (error) {
    if (error.code === 'EMAIL_TAKEN') {
      return res.status(409).json({ error: 'Email already in use' });
    }
    if (error.code === 'WEAK_PASSWORD') {
      return res.status(400).json({ error: error.message });
    }
    console.error(error);
    return res.status(500).json({ error: 'Failed to register user' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!isValidEmail(email) || typeof password !== 'string') {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const { token, user } = await authService.loginUser(email, password);
    res.json({ token, user: { id: user.id, email: user.email } });
  } catch (error) {
    if (error.code === 'INVALID_CREDENTIALS') {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    console.error(error);
    return res.status(500).json({ error: 'Failed to login' });
  }
});

module.exports = router;
