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
            })
        }
    }
    Coa.init({
        id_account: DataTypes.INTEGER,
        id_unit: DataTypes.INTEGER,
        description: DataTypes.STRING
    }, {
        sequelize,
        modelName: 'Coa',
        underscored: true,
        freezeTableName: true
    });
    return Coa;
};