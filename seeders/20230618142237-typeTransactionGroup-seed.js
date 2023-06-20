'use strict';
const fs = require('fs');
const obj = JSON.parse(fs.readFileSync('seeders/data/typeTransactionGroup-seed.json', 'utf8'));

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.bulkInsert('typeTransactionGroup', obj, {});
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('typeTransactionGroup', null, {});
    }
};