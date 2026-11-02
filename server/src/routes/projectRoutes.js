const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const projectController = require('../controllers/projectController');
const { authenticate } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');

const projectRules = [
  body('name').trim().notEmpty().withMessage('Project name is required').isLength({ min: 2, max: 150 }).withMessage('Name must be 2-150 characters'),
  body('description').optional().trim(),
];

// All project routes require authentication
router.use(authenticate);

router.get('/', projectController.getAllProjects);
router.post('/', projectRules, validate, projectController.createProject);
router.get('/:id', projectController.getProjectById);
router.put('/:id', projectRules, validate, projectController.updateProject);
router.delete('/:id', projectController.deleteProject);

module.exports = router;
