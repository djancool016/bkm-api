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
                as: 'lkm'
            })
        }
    }
    Transaction.init({
        id_lkm: DataTypes.INTEGER,
        trans_code: DataTypes.STRING,
        total: DataTypes.INTEGER,
        trans_date: DataTypes.DATEONLY,
        remark: DataTypes.STRING
    }, {
        sequelize,
        modelName: 'Transaction',
        underscored: true,
        freezeTableName: true
    });
    return Transaction;
};