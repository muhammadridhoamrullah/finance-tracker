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
      UserId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: {
            msg: "UserId is required",
          },
          notEmpty: {
            msg: "UserId is required",
          },
        },
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Name is required",
          },
          notEmpty: {
            msg: "Name is required",
          },
        },
      },
      amount: {
        type: DataTypes.FLOAT,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Amount is required",
          },
          notEmpty: {
            msg: "Amount is required",
          },
        },
      },
      spent: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
      },
      income: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
      },
      startDate: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Start Date is required",
          },
          notEmpty: {
            msg: "Start Date is required",
          },
        },
      },
      endDate: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
          notNull: {
            msg: "End Date is required",
          },
          notEmpty: {
            msg: "End Date is required",
          },
        },
      },
      remaining: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
      },
    },
    {
      sequelize,
      modelName: "Budget",
      paranoid: true,
      deletedAt: "deletedAt",
    }
  );

  // Hook soft delete Transactions when Budget is deleted
  
  return Budget;
};
