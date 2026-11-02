'use strict';
const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const env = process.env.NODE_ENV || 'development';
const config = require('../config/database.js')[env];

let sequelize;

// In production, use DATABASE_URL (provided by Railway, Render, Neon, etc.)
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config
  );
}

// Import all models
const User = require('./user')(sequelize, DataTypes);
const Project = require('./project')(sequelize, DataTypes);
const Ticket = require('./ticket')(sequelize, DataTypes);

// Define associations (relationships between tables)
// A User can create many Projects
User.hasMany(Project, { foreignKey: 'created_by', as: 'createdProjects' });
Project.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });

// A Project can have many Tickets
Project.hasMany(Ticket, { foreignKey: 'project_id', as: 'tickets' });
Ticket.belongsTo(Project, { foreignKey: 'project_id', as: 'project' });

// A User can create many Tickets
User.hasMany(Ticket, { foreignKey: 'created_by', as: 'createdTickets' });
Ticket.belongsTo(User, { foreignKey: 'created_by', as: 'reporter' });

// A User can be assigned many Tickets
User.hasMany(Ticket, { foreignKey: 'assigned_to', as: 'assignedTickets' });
Ticket.belongsTo(User, { foreignKey: 'assigned_to', as: 'assignee' });

module.exports = { sequelize, User, Project, Ticket };
