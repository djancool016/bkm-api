'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class TransactionLoan extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            this.belongsTo(models.Loan, {
                foreignKey: 'id_loan',
                as: 'loan',
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE'
            }),
            this.belongsTo(models.Transaction, {
                foreignKey: 'id_transaction',
                as: 'transaction',
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE'
            })
        }
    }
    TransactionLoan.init({
        id_loan: DataTypes.INTEGER,
        id_transaction: DataTypes.INTEGER
    }, {
        sequelize,
        modelName: 'TransactionLoan',
        underscored: true,
        paranoid: true,
        freezeTableName: true
    });
    return TransactionLoan;
};