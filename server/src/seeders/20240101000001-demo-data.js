'use strict';
const bcrypt = require('bcryptjs');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Hash passwords for sample users
    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('admin123', salt);
    const devPassword = await bcrypt.hash('dev123', salt);
    const testerPassword = await bcrypt.hash('tester123', salt);

    // Create sample users
    await queryInterface.bulkInsert('users', [
      {
        name: 'Admin User',
        email: 'admin@bugtracker.com',
        password: adminPassword,
        role: 'admin',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'John Developer',
        email: 'john@bugtracker.com',
        password: devPassword,
        role: 'developer',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'Jane Tester',
        email: 'jane@bugtracker.com',
        password: testerPassword,
        role: 'tester',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    // Create sample projects
    await queryInterface.bulkInsert('projects', [
      {
        name: 'E-Commerce Platform',
        description: 'Online shopping platform with payment integration and product catalog',
        created_by: 1,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'Mobile Banking App',
        description: 'iOS and Android banking application with real-time transactions',
        created_by: 1,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        name: 'HR Management System',
        description: 'Internal HR tool for employee management, payroll, and leave tracking',
        created_by: 2,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    // Create sample tickets
    await queryInterface.bulkInsert('tickets', [
      {
        title: 'Login page throws 500 error on invalid credentials',
        description: 'When user enters wrong password, the app crashes instead of showing error message. Steps to reproduce: enter any email with wrong password and click login.',
        status: 'OPEN',
        priority: 'HIGH',
        project_id: 1,
        assigned_to: 2,
        created_by: 3,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        title: 'Payment gateway timeout after 30 seconds',
        description: 'Stripe payment integration times out on slow networks. Need to increase timeout or add a retry mechanism.',
        status: 'IN_PROGRESS',
        priority: 'HIGH',
        project_id: 1,
        assigned_to: 2,
        created_by: 1,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        title: 'Product images not loading on mobile',
        description: 'Product listing page shows broken image icons on iOS Safari. Works fine on Chrome desktop.',
        status: 'OPEN',
        priority: 'MEDIUM',
        project_id: 1,
        assigned_to: null,
        created_by: 3,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        title: 'OTP not delivered to international numbers',
        description: 'The SMS OTP for 2FA is not being delivered to phone numbers outside India. Twilio configuration issue.',
        status: 'OPEN',
        priority: 'HIGH',
        project_id: 2,
        assigned_to: 2,
        created_by: 3,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        title: 'Transaction history slow loading',
        description: 'The transaction history page takes 8-10 seconds to load when a user has more than 1000 transactions. Need to add pagination.',
        status: 'IN_PROGRESS',
        priority: 'MEDIUM',
        project_id: 2,
        assigned_to: 2,
        created_by: 1,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        title: 'Balance not updated in real-time after transfer',
        description: 'After successful money transfer, the account balance still shows old value. User needs to refresh page to see updated balance.',
        status: 'RESOLVED',
        priority: 'HIGH',
        project_id: 2,
        assigned_to: 2,
        created_by: 3,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        title: 'Leave approval email not sent to manager',
        description: 'When an employee applies for leave, the manager notification email is not being sent. SMTP configuration needs review.',
        status: 'OPEN',
        priority: 'MEDIUM',
        project_id: 3,
        assigned_to: null,
        created_by: 3,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        title: 'Employee list pagination broken on page 3',
        description: 'When navigating to page 3 of the employee list, the page shows a blank table. Pages 1 and 2 work fine.',
        status: 'RESOLVED',
        priority: 'LOW',
        project_id: 3,
        assigned_to: 2,
        created_by: 3,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        title: 'Add dark mode support',
        description: 'Users have requested a dark mode option for the HR portal. Should respect OS-level dark mode setting.',
        status: 'CLOSED',
        priority: 'LOW',
        project_id: 3,
        assigned_to: 2,
        created_by: 1,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('tickets', null, {});
    await queryInterface.bulkDelete('projects', null, {});
    await queryInterface.bulkDelete('users', null, {});
  },
};
