'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Transaction extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            this.belongsTo(models.Lkm, {
                foreignKey: 'id_lkm',
                as: 'lkm',
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE'
            }),
            this.belongsTo(models.Coa, {
                foreignKey: 'id_coa',
                as: 'coa',
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE'
            })
        }
    }
    Transaction.init({
        id_lkm: DataTypes.INTEGER,
        id_coa: DataTypes.INTEGER,
        trans_code: DataTypes.STRING,
        total: DataTypes.INTEGER,
        trans_date: DataTypes.DATEONLY,
        remark: DataTypes.STRING
    }, {
        sequelize,
        modelName: 'Transaction',
        underscored: true,
        freezeTableName: true,
        paranoid: true
    });
    return Transaction;
};