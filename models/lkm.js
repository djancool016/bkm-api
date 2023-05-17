'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Lkm extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
        }
    }
    Lkm.init({
        id_kelurahan: DataTypes.STRING,
        name: DataTypes.STRING,
        phone: DataTypes.STRING,
        address: DataTypes.STRING
    }, {
        sequelize,
        modelName: 'Lkm',
        underscored: true,
        freezeTableName: true
    });
    return Lkm;
};