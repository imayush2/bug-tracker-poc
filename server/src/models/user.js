'use strict';
const bcrypt = require('bcryptjs');

// Model factory function - Sequelize expects a function that returns the model
module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    'User',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          notEmpty: { msg: 'Name is required' },
          len: { args: [2, 100], msg: 'Name must be between 2-100 characters' },
        },
      },
      email: {
        type: DataTypes.STRING(150),
        allowNull: false,
        unique: { msg: 'Email already exists' },
        validate: {
          isEmail: { msg: 'Must be a valid email address' },
        },
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          len: { args: [6, 255], msg: 'Password must be at least 6 characters' },
        },
      },
      role: {
        type: DataTypes.ENUM('admin', 'developer', 'tester'),
        defaultValue: 'developer',
      },
    },
    {
      tableName: 'users',
      timestamps: true, // Adds createdAt and updatedAt automatically
      underscored: true, // Converts camelCase to snake_case in DB columns
      hooks: {
        // Before saving a user, hash the password automatically
        beforeCreate: async (user) => {
          if (user.password) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
          }
        },
        beforeUpdate: async (user) => {
          if (user.changed('password')) {
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(user.password, salt);
          }
        },
      },
    }
  );

  // Instance method - check if a plain password matches the hashed password
  User.prototype.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
  };

  // Instance method - return user without sensitive data
  User.prototype.toJSON = function () {
    const values = { ...this.get() };
    delete values.password; // Never send password in API responses
    return values;
  };

  return User;
};
