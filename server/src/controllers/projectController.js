const projectService = require('../services/projectService');

/**
 * POST /api/projects
 */
const createProject = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const project = await projectService.createProject({
      name,
      description,
      userId: req.user.id, // From authenticate middleware
    });

    res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: { project },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/projects
 */
const getAllProjects = async (req, res, next) => {
  try {
    const projects = await projectService.getAllProjects();
    res.status(200).json({
      success: true,
      data: { projects },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/projects/:id
 */
const getProjectById = async (req, res, next) => {
  try {
    const project = await projectService.getProjectById(req.params.id);
    res.status(200).json({
      success: true,
      data: { project },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/projects/:id
 */
const updateProject = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const project = await projectService.updateProject(req.params.id, { name, description });

    res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      data: { project },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/projects/:id
 */
const deleteProject = async (req, res, next) => {
  try {
    await projectService.deleteProject(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Project deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createProject, getAllProjects, getProjectById, updateProject, deleteProject };
