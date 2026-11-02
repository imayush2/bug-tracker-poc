const ticketService = require('../services/ticketService');

/**
 * GET /api/tickets?search=&status=&priority=&project_id=
 */
const getAllTickets = async (req, res, next) => {
  try {
    // Pass all query parameters to service for filtering
    const tickets = await ticketService.getAllTickets(req.query);
    res.status(200).json({
      success: true,
      data: { tickets, total: tickets.length },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/tickets/:id
 */
const getTicketById = async (req, res, next) => {
  try {
    const ticket = await ticketService.getTicketById(req.params.id);
    res.status(200).json({ success: true, data: { ticket } });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/tickets
 */
const createTicket = async (req, res, next) => {
  try {
    const { title, description, status, priority, project_id, assigned_to } = req.body;
    const ticket = await ticketService.createTicket({
      title,
      description,
      status,
      priority,
      project_id,
      assigned_to,
      userId: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: 'Ticket created successfully',
      data: { ticket },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/tickets/:id
 */
const updateTicket = async (req, res, next) => {
  try {
    const ticket = await ticketService.updateTicket(req.params.id, req.body);
    res.status(200).json({
      success: true,
      message: 'Ticket updated successfully',
      data: { ticket },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/tickets/:id
 */
const deleteTicket = async (req, res, next) => {
  try {
    await ticketService.deleteTicket(req.params.id);
    res.status(200).json({
      success: true,
      message: 'Ticket deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/tickets/stats/dashboard
 */
const getDashboardStats = async (req, res, next) => {
  try {
    const stats = await ticketService.getDashboardStats();
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllTickets, getTicketById, createTicket, updateTicket, deleteTicket, getDashboardStats };
