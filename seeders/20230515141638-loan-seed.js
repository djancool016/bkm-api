'use strict';
const fs = require('fs');
const obj = JSON.parse(fs.readFileSync('seeders/data/loan-seed.json', 'utf8'));

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    //await queryInterface.bulkInsert('Loan', obj, {});
  },

  async down (queryInterface, Sequelize) {
    //await queryInterface.bulkDelete('Loan', null, {});
  }
};
