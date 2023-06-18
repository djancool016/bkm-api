'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Coa extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            this.belongsTo(models.Account, {
                foreignKey: 'id_account',
                as: 'account'
            }),
            this.belongsTo(models.Unit, {
                foreignKey: 'id_unit',
                as: 'unit'
            })
        }
    }
    Coa.init({
        id_unit: DataTypes.STRING,
        id_account: DataTypes.INTEGER,
        description: DataTypes.STRING
    }, {
        sequelize,
        modelName: 'Coa',
        underscored: true,
        freezeTableName: true
    });
    return Coa;
};