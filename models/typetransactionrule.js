'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class typeTransactionRule extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            this.belongsTo(models.typeTransaction, {
                foreignKey: 'id_type',
                as: 'type'
            }),
            this.belongsTo(models.Coa, {
                foreignKey: 'id_coa',
                as: 'coa'
            }),
            this.belongsTo(models.Register, {
                foreignKey: 'id_register',
                as: 'register'
            })
        }
    }
    typeTransactionRule.init({
        id_type: DataTypes.INTEGER,
        id_coa: DataTypes.INTEGER,
        id_register: DataTypes.INTEGER
    }, {
        sequelize,
        modelName: 'typeTransactionRule',
        underscored: true,
        freezeTableName: true
    });
    return typeTransactionRule;
};