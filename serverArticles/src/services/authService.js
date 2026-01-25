const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
const SALT_ROUNDS = 10;

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

function isValidPassword(password) {
  return typeof password === 'string' && password.trim().length >= 8;
}

async function registerUser(email, password) {
  const normalizedEmail = normalizeEmail(email);

  const existing = await User.findOne({ where: { email: normalizedEmail } });
  if (existing) {
    const error = new Error('Email already in use');
    error.code = 'EMAIL_TAKEN';
    throw error;
  }

  if (!isValidPassword(password)) {
    const error = new Error('Password must be at least 8 characters');
    error.code = 'WEAK_PASSWORD';
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await User.create({ email: normalizedEmail, passwordHash });

  return user;
}

async function loginUser(email, password) {
  const normalizedEmail = normalizeEmail(email);
  const user = await User.findOne({ where: { email: normalizedEmail } });
  if (!user) {
    const error = new Error('Invalid credentials');
    error.code = 'INVALID_CREDENTIALS';
    throw error;
  }

  const matches = await bcrypt.compare(password, user.passwordHash);
  if (!matches) {
    const error = new Error('Invalid credentials');
    error.code = 'INVALID_CREDENTIALS';
    throw error;
  }

  const token = jwt.sign(
    { id: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  return { user, token };
}

module.exports = {
  registerUser,
  loginUser,
};
