'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class Saving extends Model {
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
    Saving.init({
        id_ksm: DataTypes.INTEGER,
        balance: DataTypes.INTEGER,
        opening_date: DataTypes.DATE,
        is_valid: DataTypes.BOOLEAN
    }, {
        sequelize,
        modelName: 'Saving',
        underscored: true,
        freezeTableName: true,
        paranoid: true
    });
    return Saving;
};