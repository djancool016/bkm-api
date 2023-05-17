'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('Saving', {
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
            balance: {
                allowNull: false,
                type: Sequelize.INTEGER
            },
            opening_date: {
                allowNull: false,
                type: Sequelize.DATEONLY
            },
            is_valid: {
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
        await queryInterface.dropTable('Saving');
    }
};