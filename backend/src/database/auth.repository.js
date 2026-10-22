'use strict';
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('./connection');
const { ConflictError, UnauthorizedError, AppError } = require('../utils/errors');

const SALT_ROUNDS = 12;
const TOKEN_EXPIRY = process.env.JWT_EXPIRY || '7d';

async function register({ full_name, email, password }) {
  const { rows: existing } = await pool.query(
    'SELECT id FROM users WHERE email = $1',
    [email]
  );
  if (existing.length > 0) {
    throw new ConflictError('Email is already registered');
  }
  const password_hash = await bcrypt.hash(password, SALT_ROUNDS);
  let rows;
  try {
    ({ rows } = await pool.query(
      `INSERT INTO users (full_name, email, password_hash, role)
       VALUES ($1, $2, $3, 'employee')
       RETURNING id, full_name, email, role, is_active, created_at`,
      [full_name, email, password_hash]
    ));
  } catch (err) {
    if (err.code === '23505' && err.constraint === 'users_email_key') {
      throw new ConflictError('Email is already registered');
    }
    throw err;
  }
  const user = rows[0];
  const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
  return { user, token };
}

async function login({ email, password }) {
  const { rows } = await pool.query(
    'SELECT id, full_name, email, role, is_active, password_hash FROM users WHERE email = $1',
    [email]
  );
  // Generic error: do not reveal whether email exists
  if (rows.length === 0) {
    throw new UnauthorizedError('Invalid credentials');
  }
  const user = rows[0];
  if (!user.is_active) {
    throw new UnauthorizedError('Invalid credentials');
  }
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    throw new UnauthorizedError('Invalid credentials');
  }
  const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
  const { password_hash, ...safeUser } = user;
  return { user: safeUser, token };
}

async function getMe(userId) {
  const { rows } = await pool.query(
    'SELECT id, full_name, email, role, is_active, created_at, updated_at FROM users WHERE id = $1',
    [userId]
  );
  if (rows.length === 0) throw new AppError('User not found', 404);
  return rows[0];
}

async function updateProfile(userId, { full_name }) {
  const { rows } = await pool.query(
    `UPDATE users
     SET full_name = $1, updated_at = NOW()
     WHERE id = $2
     RETURNING id, full_name, email, role, is_active, created_at, updated_at`,
    [full_name, userId]
  );
  if (rows.length === 0) throw new AppError('User not found', 404);
  return rows[0];
}

async function changePassword(userId, { current_password, new_password }) {
  const { rows } = await pool.query(
    'SELECT password_hash FROM users WHERE id = $1',
    [userId]
  );
  if (rows.length === 0) throw new AppError('User not found', 404);
  const valid = await bcrypt.compare(current_password, rows[0].password_hash);
  if (!valid) {
    throw new UnauthorizedError('Current password is incorrect');
  }
  const newHash = await bcrypt.hash(new_password, SALT_ROUNDS);
  await pool.query(
    'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
    [newHash, userId]
  );
  return { message: 'Password updated successfully' };
}

module.exports = { register, login, getMe, updateProfile, changePassword };
