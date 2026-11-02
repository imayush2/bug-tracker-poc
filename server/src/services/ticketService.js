const { Op } = require('sequelize');
const { Ticket, User, Project } = require('../models');

/**
 * Build Sequelize WHERE clause from query parameters
 * This enables search and filter functionality
 */
const buildWhereClause = ({ search, status, priority, project_id }) => {
  const where = {};

  // Search by title (case-insensitive LIKE query)
  if (search) {
    where.title = { [Op.iLike]: `%${search}%` }; // iLike = case-insensitive
  }

  // Filter by status
  if (status) {
    where.status = status;
  }

  // Filter by priority
  if (priority) {
    where.priority = priority;
  }

  // Filter by project
  if (project_id) {
    where.project_id = project_id;
  }

  return where;
};

/**
 * Get all tickets with optional search and filters
 */
const getAllTickets = async (queryParams) => {
  const where = buildWhereClause(queryParams);

  return Ticket.findAll({
    where,
    include: [
      { model: Project, as: 'project', attributes: ['id', 'name'] },
      { model: User, as: 'reporter', attributes: ['id', 'name'] },
      { model: User, as: 'assignee', attributes: ['id', 'name'] },
    ],
    order: [['created_at', 'DESC']],
  });
};

/**
 * Get a single ticket by ID
 */
const getTicketById = async (id) => {
  const ticket = await Ticket.findByPk(id, {
    include: [
      { model: Project, as: 'project', attributes: ['id', 'name'] },
      { model: User, as: 'reporter', attributes: ['id', 'name', 'email'] },
      { model: User, as: 'assignee', attributes: ['id', 'name', 'email'] },
    ],
  });

  if (!ticket) {
    const error = new Error('Ticket not found');
    error.statusCode = 404;
    throw error;
  }

  return ticket;
};

/**
 * Create a new ticket
 */
const createTicket = async ({ title, description, status, priority, project_id, assigned_to, userId }) => {
  // Verify the project exists
  const project = await Project.findByPk(project_id);
  if (!project) {
    const error = new Error('Project not found');
    error.statusCode = 404;
    throw error;
  }

  const ticket = await Ticket.create({
    title,
    description,
    status: status || 'OPEN',
    priority: priority || 'MEDIUM',
    project_id,
    assigned_to: assigned_to || null,
    created_by: userId,
  });

  // Reload with associations to return full data
  return getTicketById(ticket.id);
};

/**
 * Update a ticket
 */
const updateTicket = async (id, updateData) => {
  const ticket = await Ticket.findByPk(id);
  if (!ticket) {
    const error = new Error('Ticket not found');
    error.statusCode = 404;
    throw error;
  }

  // Only update provided fields
  const allowedFields = ['title', 'description', 'status', 'priority', 'project_id', 'assigned_to'];
  const filteredData = {};
  allowedFields.forEach((field) => {
    if (updateData[field] !== undefined) {
      filteredData[field] = updateData[field];
    }
  });

  await ticket.update(filteredData);
  return getTicketById(ticket.id);
};

/**
 * Delete a ticket
 */
const deleteTicket = async (id) => {
  const ticket = await Ticket.findByPk(id);
  if (!ticket) {
    const error = new Error('Ticket not found');
    error.statusCode = 404;
    throw error;
  }

  await ticket.destroy();
  return { message: 'Ticket deleted successfully' };
};

/**
 * Get dashboard statistics
 */
const getDashboardStats = async () => {
  const { Project, Ticket } = require('../models');
  const { sequelize } = require('../models');

  const totalProjects = await Project.count();
  const totalTickets = await Ticket.count();
  const openTickets = await Ticket.count({ where: { status: 'OPEN' } });
  const inProgressTickets = await Ticket.count({ where: { status: 'IN_PROGRESS' } });
  const resolvedTickets = await Ticket.count({ where: { status: 'RESOLVED' } });
  const closedTickets = await Ticket.count({ where: { status: 'CLOSED' } });

  return {
    totalProjects,
    totalTickets,
    openTickets,
    inProgressTickets,
    resolvedTickets,
    closedTickets,
  };
};

module.exports = { getAllTickets, getTicketById, createTicket, updateTicket, deleteTicket, getDashboardStats };
