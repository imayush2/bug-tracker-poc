const authService = require('../services/authService');

/**
 * POST /api/auth/register
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    const { user, token } = await authService.register({ name, email, password, role });

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: { user, token },
    });
  } catch (error) {
    next(error); // Pass to global error handler
  }
};

/**
 * POST /api/auth/login
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { user, token } = await authService.login({ email, password });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: { user, token },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/auth/me - Get current logged-in user
 */
const getMe = async (req, res) => {
  // req.user is set by the authenticate middleware
  res.status(200).json({
    success: true,
    data: { user: req.user },
  });
};

/**
 * GET /api/auth/users - Get all users (for assign dropdown)
 */
const getAllUsers = async (req, res, next) => {
  try {
    const users = await authService.getAllUsers();
    res.status(200).json({ success: true, data: { users } });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe, getAllUsers };
