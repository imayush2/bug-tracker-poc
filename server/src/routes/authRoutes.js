const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { authenticate } = require('../middlewares/auth');
const { validate } = require('../middlewares/validate');

// Validation rules for registration
const registerRules = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

// Validation rules for login
const loginRules = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

// Public routes (no authentication required)
router.post('/register', registerRules, validate, authController.register);
router.post('/login', loginRules, validate, authController.login);

// Protected routes (require JWT token)
router.get('/me', authenticate, authController.getMe);
router.get('/users', authenticate, authController.getAllUsers);

module.exports = router;
