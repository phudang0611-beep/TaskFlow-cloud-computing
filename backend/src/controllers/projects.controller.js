'use strict';
const projectsRepository = require('../database/projects.repository');
const { success } = require('../utils/response');

async function getProjects(req, res, next) {
  try {
    const projects = await projectsRepository.getProjects(req.user);
    return success(res, projects);
  } catch (err) { next(err); }
}

async function getProjectById(req, res, next) {
  try {
    const project = await projectsRepository.getProjectById(parseInt(req.params.id), req.user);
    return success(res, project);
  } catch (err) { next(err); }
}

async function createProject(req, res, next) {
  try {
    const project = await projectsRepository.createProject(req.body, req.user);
    return success(res, project, 'Project created successfully', 201);
  } catch (err) { next(err); }
}

async function addProjectMember(req, res, next) {
  try {
    const { user_id } = req.body;
    const result = await projectsRepository.addProjectMember(parseInt(req.params.id), parseInt(user_id), req.user);
    return success(res, result, 'Member added to project', 201);
  } catch (err) { next(err); }
}

async function removeProjectMember(req, res, next) {
  try {
    const result = await projectsRepository.removeProjectMember(parseInt(req.params.id), parseInt(req.params.userId), req.user);
    return success(res, result, 'Member removed from project');
  } catch (err) { next(err); }
}

async function deleteProject(req, res, next) {
  try {
    const result = await projectsRepository.deleteProject(parseInt(req.params.id), req.user);
    return success(res, result, 'Project deleted successfully');
  } catch (err) { next(err); }
}

async function inviteProjectMember(req, res, next) {
  try {
    const { user_id } = req.body;
    const result = await projectsRepository.inviteProjectMember(parseInt(req.params.id), parseInt(user_id), req.user);
    return success(res, result, 'Invitation sent successfully', 201);
  } catch (err) { next(err); }
}

async function getProjectPendingInvitations(req, res, next) {
  try {
    const invitations = await projectsRepository.getProjectPendingInvitations(parseInt(req.params.id), req.user);
    return success(res, invitations);
  } catch (err) { next(err); }
}

async function cancelInvitation(req, res, next) {
  try {
    const result = await projectsRepository.cancelInvitation(parseInt(req.params.inviteId), req.user);
    return success(res, result, 'Invitation cancelled');
  } catch (err) { next(err); }
}

async function getMyInvitations(req, res, next) {
  try {
    const invitations = await projectsRepository.getMyPendingInvitations(req.user.id);
    return success(res, invitations);
  } catch (err) { next(err); }
}

async function respondToInvitation(req, res, next) {
  try {
    const { accept } = req.body;
    const result = await projectsRepository.respondToInvitation(parseInt(req.params.id), Boolean(accept), req.user);
    return success(res, result, accept ? 'Invitation accepted! Welcome to the project.' : 'Invitation declined');
  } catch (err) { next(err); }
}

module.exports = {
  getProjects,
  getProjectById,
  createProject,
  addProjectMember,
  removeProjectMember,
  deleteProject,
  inviteProjectMember,
  getProjectPendingInvitations,
  cancelInvitation,
  getMyInvitations,
  respondToInvitation,
};
