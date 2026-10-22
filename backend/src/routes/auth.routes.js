'use strict';
const express = require('express');
const rateLimit = require('express-rate-limit');
const { registerValidation, loginValidation } = require('./auth.validation');
const { body } = require('express-validator');
const validate = require('../middlewares/validate');
const authenticate = require('../middlewares/authenticate');
const authController = require('../controllers/auth.controller');

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: 'error', message: 'Too many requests, please try again later' },
});

router.post('/register', authLimiter, registerValidation, validate, authController.register);
router.post('/login', authLimiter, loginValidation, validate, authController.login);
router.get('/me', authenticate, authController.getMe);
router.patch(
  '/profile',
  authenticate,
  [body('full_name').trim().isLength({ min: 2, max: 100 }).withMessage('Full name must be 2 to 100 characters')],
  validate,
  authController.updateProfile
);
router.post(
  '/change-password',
  authenticate,
  [
    body('current_password').notEmpty().withMessage('Current password is required'),
    body('new_password').isLength({ min: 8, max: 72 }).withMessage('New password must be between 8 and 72 characters'),
  ],
  validate,
  authController.changePassword
);

module.exports = router;
