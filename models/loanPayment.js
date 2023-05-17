'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class LoanPayment extends Model {
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
            })
        }
    }
    LoanPayment.init({
        id_loan: DataTypes.INTEGER,
        payment_no: DataTypes.INTEGER,
        due_date: DataTypes.DATEONLY,
        loan: DataTypes.INTEGER,
        loan_remaining: DataTypes.INTEGER,
        interest: DataTypes.INTEGER,
        interest_remaining: DataTypes.INTEGER,
        is_settled: DataTypes.BOOLEAN
    }, {
        sequelize,
        modelName: 'LoanPayment',
        underscored: true,
        freezeTableName: true,
        paranoid: true
    });
    return LoanPayment;
};