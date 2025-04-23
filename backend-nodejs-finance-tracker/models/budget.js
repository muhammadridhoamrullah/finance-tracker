"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Budget extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Budget.belongsTo(models.User, {
        foreignKey: "UserId",
      });
      Budget.hasMany(models.Transaction, {
        foreignKey: "BudgetId",
      });
    }
  }
  Budget.init(
    {
      UserId: DataTypes.INTEGER,
      name: DataTypes.STRING,
      amount: DataTypes.INTEGER,
      spent: DataTypes.INTEGER,
      income: DataTypes.INTEGER,
      startDate: DataTypes.DATE,
      endDate: DataTypes.DATE,
      remaining: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Budget",
    }
  );
  return Budget;
};
