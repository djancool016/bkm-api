'use strict';
const fs = require('fs');
const obj = JSON.parse(fs.readFileSync('seeders/data/transaction-seed.json', 'utf8'));

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    //await queryInterface.bulkInsert('Transaction', obj, {});
  },

  async down (queryInterface, Sequelize) {
    //await queryInterface.bulkDelete('Transaction', null, {});
  }
};
