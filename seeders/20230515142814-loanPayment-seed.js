'use strict';
const fs = require('fs');
const obj = JSON.parse(fs.readFileSync('seeders/data/loanPayment-seed.json', 'utf8'));

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('LoanPayment', obj, {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('LoanPayment', null, {});
  }
};
