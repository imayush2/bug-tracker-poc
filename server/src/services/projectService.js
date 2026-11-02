const { Project, User, Ticket } = require('../models');

/**
 * Create a new project
 */
const createProject = async ({ name, description, userId }) => {
  return Project.create({ name, description, created_by: userId });
};

/**
 * Get all projects with creator info and ticket count
 */
const getAllProjects = async () => {
  return Project.findAll({
    include: [
      {
        model: User,
        as: 'creator',
        attributes: ['id', 'name', 'email'], // Join creator details
      },
    ],
    order: [['created_at', 'DESC']],
  });
};

/**
 * Get a single project by ID with creator info and all tickets
 */
const getProjectById = async (id) => {
  const project = await Project.findByPk(id, {
    include: [
      { model: User, as: 'creator', attributes: ['id', 'name', 'email'] },
      {
        model: Ticket,
        as: 'tickets',
        include: [
          { model: User, as: 'reporter', attributes: ['id', 'name'] },
          { model: User, as: 'assignee', attributes: ['id', 'name'] },
        ],
      },
    ],
  });

  if (!project) {
    const error = new Error('Project not found');
    error.statusCode = 404;
    throw error;
  }

  return project;
};

/**
 * Update a project
 */
const updateProject = async (id, { name, description }) => {
  const project = await Project.findByPk(id);
  if (!project) {
    const error = new Error('Project not found');
    error.statusCode = 404;
    throw error;
  }

  await project.update({ name, description });
  return project;
};

/**
 * Delete a project (cascades to its tickets due to FK constraint)
 */
const deleteProject = async (id) => {
  const project = await Project.findByPk(id);
  if (!project) {
    const error = new Error('Project not found');
    error.statusCode = 404;
    throw error;
  }

  await project.destroy();
  return { message: 'Project deleted successfully' };
};

module.exports = { createProject, getAllProjects, getProjectById, updateProject, deleteProject };
