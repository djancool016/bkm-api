'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class typeTransaction extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            this.belongsTo(models.typeTransactionGroup, {
                foreignKey: 'id_group',
                as: 'group'
            })
        }
    }
    typeTransaction.init({
        id_group: DataTypes.INTEGER,
        description: DataTypes.STRING
    }, {
        sequelize,
        modelName: 'typeTransaction',
        underscored: true,
        freezeTableName: true
    });
    return typeTransaction;
};