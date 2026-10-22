'use strict';
const express = require('express');
const authRoutes = require('./auth.routes');
const usersRoutes = require('./users.routes');
const tasksRoutes = require('./tasks.routes');
const projectsRoutes = require('./projects.routes');
const healthController = require('../controllers/health.controller');

const router = express.Router();

router.get('/health', healthController.getHealth);
router.use('/auth', authRoutes);
router.use('/users', usersRoutes);
router.use('/tasks', tasksRoutes);
router.use('/projects', projectsRoutes);

module.exports = router;
