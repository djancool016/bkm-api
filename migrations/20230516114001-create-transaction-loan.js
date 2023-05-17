'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('TransactionLoan', {
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
            id_loan: {
                allowNull: false,
                type: Sequelize.INTEGER,
                references: {
                    model: 'Loan',
                    key: 'id'
                }
            },
            id_transaction: {
                allowNull: false,
                type: Sequelize.INTEGER,
                references: {
                    model: 'Transaction',
                    key: 'id'
                }
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
        await queryInterface.dropTable('TransactionLoan');
    }
};