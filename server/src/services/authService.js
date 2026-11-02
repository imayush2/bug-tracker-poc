const jwt = require('jsonwebtoken');
const { User } = require('../models');

/**
 * Generate a JWT token for a user
 * @param {object} user - Sequelize User instance
 * @returns {string} signed JWT token
 */
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

/**
 * Register a new user
 */
const register = async ({ name, email, password, role }) => {
  // Check if email already exists
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    const error = new Error('Email already registered');
    error.statusCode = 409;
    throw error;
  }

  // Create user (password is hashed by the beforeCreate hook in User model)
  const user = await User.create({ name, email, password, role: role || 'developer' });
  const token = generateToken(user);

  return { user, token };
};

/**
 * Login a user with email and password
 */
const login = async ({ email, password }) => {
  // Find user by email
  const user = await User.findOne({ where: { email } });
  if (!user) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  // Check if password matches (using the instance method defined in User model)
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const token = generateToken(user);
  return { user, token };
};

/**
 * Get all users (for the "assign ticket" dropdown)
 */
const getAllUsers = async () => {
  return User.findAll({
    attributes: ['id', 'name', 'email', 'role'], // Only return safe fields
    order: [['name', 'ASC']],
  });
};

module.exports = { register, login, getAllUsers };
