'use strict';
const express = require('express');
const { body, param, query } = require('express-validator');
const authenticate = require('../middlewares/authenticate');
const authorize = require('../middlewares/authorize');
const validate = require('../middlewares/validate');
const usersController = require('../controllers/users.controller');

const router = express.Router();

router.use(authenticate);

router.get('/search', usersController.searchUsers);

router.get(
  '/',
  authorize('admin'),
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('role').optional().isIn(['admin', 'employee']),
    query('is_active').optional().isIn(['true', 'false']),
    query('search').optional().isString().isLength({ max: 200 }),
  ],
  validate,
  usersController.getUsers
);
router.get('/:id', param('id').isInt({ min: 1 }).withMessage('User id must be a positive integer'), validate, usersController.getUserById);
router.patch(
  '/:id/status',
  authorize('admin'),
  [
    param('id').isInt({ min: 1 }).withMessage('User id must be a positive integer'),
    body('is_active').isBoolean().withMessage('is_active must be boolean'),
  ],
  validate,
  usersController.updateUserStatus
);

router.post(
  '/',
  authorize('admin'),
  [
    body('full_name').trim().isLength({ min: 2, max: 100 }),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8, max: 72 }),
    body('role').optional().isIn(['admin', 'employee']),
  ],
  validate,
  usersController.createUser
);

module.exports = router;
