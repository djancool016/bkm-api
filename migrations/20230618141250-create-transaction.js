'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('Transaction', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            id_lkm: {
                allowNull: false,
                type: Sequelize.INTEGER,
                references: {
                    model: 'Lkm',
                    key: 'id'
                }
            },
            id_type: {
                allowNull: false,
                type: Sequelize.INTEGER,
                references: {
                    model: 'typeTransaction',
                    key: 'id'
                }
            },
            total: {
                allowNull: false,
                type: Sequelize.INTEGER
            },
            trans_date: {
                allowNull: false,
                type: Sequelize.DATEONLY
            },
            remark: {
                allowNull: false,
                type: Sequelize.STRING
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
            }
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('Transaction');
    }
};