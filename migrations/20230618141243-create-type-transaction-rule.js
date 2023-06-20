'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('typeTransactionRule', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            id_type: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'typeTransaction',
                    key: 'id'
                }
            },
            id_coa: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'Coa',
                    key: 'id'
                }
            },
            id_register: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'Register',
                    key: 'id'
                }
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            }
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('typeTransactionRule');
    }
};