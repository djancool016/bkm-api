'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Loan extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            this.belongsTo(models.Ksm, {
                foreignKey: 'id_ksm',
                as: 'ksm',
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE'
            })
        }
    }
    Loan.init({
        id_ksm: DataTypes.INTEGER,
        total_loan: DataTypes.INTEGER,
        total_interest: DataTypes.INTEGER,
        loan_duration: DataTypes.INTEGER,
        loan_interest: DataTypes.DOUBLE,
        loan_start: DataTypes.DATEONLY,
        loan_end: DataTypes.DATEONLY,
        is_valid: DataTypes.BOOLEAN,
        is_finish: DataTypes.BOOLEAN
    }, {
        sequelize,
        modelName: 'Loan',
        underscored: true,
        freezeTableName: true,
        paranoid: true

    });
    return Loan;
};