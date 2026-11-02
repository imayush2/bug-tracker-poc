'use strict';
const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const dbConfigs = require('../config/database.js');
const env = (process.env.NODE_ENV || 'development').trim();
const config = dbConfigs[env] || dbConfigs.production || dbConfigs.development || {};

let sequelize;

// If a DATABASE_URL is provided (Render, Neon, Railway, Vercel), connect directly with SSL
if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  });
} else if (config.use_env_variable && process.env[config.use_env_variable]) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(
    config.database || 'bug_tracker',
    config.username || 'postgres',
    config.password || 'postgres',
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
