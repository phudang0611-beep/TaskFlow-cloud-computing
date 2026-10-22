'use strict';
const tasksRepository = require('../database/tasks.repository');
const { success, paginated } = require('../utils/response');

async function createTask(req, res, next) {
  try {
    let { title, description, priority, due_date, assignee_ids, project_id } = req.body;
    const user = req.user;

    // If no assignee specified, default to self
    if (!assignee_ids || !Array.isArray(assignee_ids) || assignee_ids.length === 0) {
      assignee_ids = [user.id];
    }

    const task = await tasksRepository.createTask({
      title,
      description,
      priority,
      due_date,
      created_by: user.id,
      assignee_ids,
      project_id: project_id ? parseInt(project_id) : undefined,
      userRole: user.role,
    });
    return success(res, task, 'Task created', 201);
  } catch (err) { next(err); }
}

async function getTasks(req, res, next) {
  try {
    const { page, limit, search, status, priority, assignee_id, due_after, due_before, created_by, project_id } = req.query;
    const result = await tasksRepository.getTasks(req.user, {
      page: parseInt(page) || 1,
      limit: Math.min(parseInt(limit) || 20, 100),
      search, status, priority,
      assignee_id: assignee_id ? parseInt(assignee_id) : undefined,
      due_after, due_before,
      created_by: created_by ? parseInt(created_by) : undefined,
      project_id: project_id ? parseInt(project_id) : undefined,
    });
    return paginated(res, result.tasks, {
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages: Math.ceil(result.total / result.limit),
    });
  } catch (err) { next(err); }
}

async function getTaskById(req, res, next) {
  try {
    const task = await tasksRepository.getTaskById(parseInt(req.params.id), req.user);
    return success(res, task);
  } catch (err) { next(err); }
}

async function updateTask(req, res, next) {
  try {
    const task = await tasksRepository.updateTask(parseInt(req.params.id), req.user, req.body);
    return success(res, task, 'Task updated');
  } catch (err) { next(err); }
}

async function deleteTask(req, res, next) {
  try {
    const result = await tasksRepository.deleteTask(parseInt(req.params.id), req.user);
    return success(res, result, 'Task deleted');
  } catch (err) { next(err); }
}

async function updateTaskStatus(req, res, next) {
  try {
    const { status } = req.body;
    const task = await tasksRepository.updateTaskStatus(parseInt(req.params.id), req.user, status);
    return success(res, task, 'Task status updated');
  } catch (err) { next(err); }
}

async function getTaskStats(req, res, next) {
  try {
    const stats = await tasksRepository.getTaskStats(req.user, req.query.project_id);
    return success(res, stats);
  } catch (err) { next(err); }
}

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  updateTaskStatus,
  getTaskStats,
};
