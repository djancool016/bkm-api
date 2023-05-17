'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('LoanPayment', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            id_loan: {
                allowNull: false,
                type: Sequelize.INTEGER,
                references: {
                    model: 'Loan',
                    key: 'id'
                }
            },
            payment_no: {
                allowNull: false,
                type: Sequelize.INTEGER
            },
            due_date: {
                allowNull: false,
                type: Sequelize.DATEONLY
            },
            loan: {
                allowNull: false,
                type: Sequelize.INTEGER
            },
            loan_remaining: {
                allowNull: false,
                type: Sequelize.INTEGER
            },
            interest: {
                allowNull: false,
                type: Sequelize.INTEGER
            },
            interest_remaining: {
                allowNull: false,
                type: Sequelize.INTEGER
            },
            is_settled: {
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
        await queryInterface.dropTable('LoanPayment');
    }
};