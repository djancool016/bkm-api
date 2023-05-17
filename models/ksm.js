'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Ksm extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            this.belongsTo(models.Lkm, {
                foreignKey: 'id_lkm',
                as: 'lkm',
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE'
            })
        }
    }
    Ksm.init({
        id_lkm: DataTypes.INTEGER,
        name: DataTypes.STRING,
        rw: DataTypes.STRING
    }, {
        sequelize,
        modelName: 'Ksm',
        underscored: true,
        freezeTableName: true,
        paranoid: true
    });
    return Ksm;
};