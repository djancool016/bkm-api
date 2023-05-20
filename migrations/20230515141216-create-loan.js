'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('Loan', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            id_ksm: {
                allowNull: false,
                type: Sequelize.INTEGER,
                references: {
                    model: 'Ksm',
                    key: 'id'
                }
            },
            total_loan: {
                allowNull: false,
                type: Sequelize.INTEGER
            },
            total_interest: {
                allowNull: false,
                type: Sequelize.INTEGER
            },
            loan_duration: {
                allowNull: false,
                type: Sequelize.INTEGER
            },
            loan_interest: {
                allowNull: false,
                type: Sequelize.DOUBLE
            },
            loan_start: {
                allowNull: true,
                type: Sequelize.DATE
            },
            loan_end: {
                allowNull: true,
                type: Sequelize.DATE
            },
            is_valid: {
                allowNull: false,
                type: Sequelize.BOOLEAN,
                defaultValue: false
            },
            is_finish: {
                allowNull: false,
                type: Sequelize.BOOLEAN,
                defaultValue: false
            },
            created_at: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            updated_at: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            deleted_at: {
                allowNull: true,
                type: Sequelize.DATE
            }
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('Loan');
    }
};