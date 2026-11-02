const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const ticketController = require('../controllers/ticketController');
const { authenticate } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');

const ticketCreateRules = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ min: 3 }).withMessage('Title must be at least 3 characters'),
  body('project_id').notEmpty().withMessage('Project is required').isInt({ min: 1 }).withMessage('Invalid project ID'),
  body('status').optional().isIn(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']).withMessage('Invalid status'),
  body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH']).withMessage('Invalid priority'),
  body('assigned_to').optional({ nullable: true }).isInt({ min: 1 }).withMessage('Invalid user ID'),
];

const ticketUpdateRules = [
  body('title').optional().trim().isLength({ min: 3 }).withMessage('Title must be at least 3 characters'),
  body('status').optional().isIn(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']).withMessage('Invalid status'),
  body('priority').optional().isIn(['LOW', 'MEDIUM', 'HIGH']).withMessage('Invalid priority'),
  body('assigned_to').optional({ nullable: true }).isInt({ min: 1 }).withMessage('Invalid user ID'),
];

// All ticket routes require authentication
router.use(authenticate);

// IMPORTANT: specific routes BEFORE parameterized routes to avoid conflicts
router.get('/stats/dashboard', ticketController.getDashboardStats);

router.get('/', ticketController.getAllTickets);
router.post('/', ticketCreateRules, validate, ticketController.createTicket);
router.get('/:id', ticketController.getTicketById);
router.put('/:id', ticketUpdateRules, validate, ticketController.updateTicket);
router.delete('/:id', ticketController.deleteTicket);

module.exports = router;
