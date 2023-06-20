'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class typeTransactionGroup extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  typeTransactionGroup.init({
    description: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'typeTransactionGroup',
    underscored: true,
    freezeTableName: true
  });
  return typeTransactionGroup;
};