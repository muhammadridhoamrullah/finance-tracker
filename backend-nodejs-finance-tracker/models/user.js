"use strict";
const { Model } = require("sequelize");
const { hashPassword } = require("../helpers/bcrypt");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.hasMany(models.Transaction, {
        foreignKey: "UserId",
      });
      User.hasMany(models.Budget, {
        foreignKey: "UserId",
      });
    }
  }
  User.init(
    {
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: "First Name is required",
          },
          notEmpty: {
            msg: "First Name is required",
          },
        },
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Last Name is required",
          },
          notEmpty: {
            msg: "Last Name is required",
          },
        },
      },
      role: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: {
          msg: "Email already exists",
        },
        validate: {
          notNull: {
            msg: "Email is required",
          },
          notEmpty: {
            msg: "Email is required",
          },
          isEmail: {
            msg: "Email format is invalid",
          },
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Password is required",
          },
          notEmpty: {
            msg: "Password is required",
          },
          len: {
            args: [6, 20],
            msg: "Password must be between 6 and 20 characters",
          },
        },
      },
      phoneNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: {
          msg: "Phone number already in use",
        },
        validate: {
          notNull: {
            msg: "Phone number is required",
          },
          notEmpty: {
            msg: "Phone number is required",
          },
          len: {
            args: [10, 15],
            msg: "Phone number must be between 10 and 15 digits",
          },
        },
      },
      address: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: {
            msg: "Address is required",
          },
          notEmpty: {
            msg: "Address is required",
          },
        },
      },
      isVerified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        validate: {
          notNull: {
            msg: "Verification status is required",
          },
          notEmpty: {
            msg: "Verification status is required",
          },
        },
      },
    },
    {
      sequelize,
      modelName: "User",
      paranoid: true,
      deletedAt: "deletedAt",
    }
  );
  User.beforeCreate((user) => {
    user.password = hashPassword(user.password);
  });

  // Hook untuk soft delete Budget and Transaction when User is deleted
  User.beforeDestroy(async (user, options) => {
    const { Budget, Transaction } = sequelize.models;

    // Soft delete all Budgets associated with the User
    await Budget.update(
      {
        deletedAt: new Date(),
      },
      {
        where: {
          UserId: user.id,
        },
        transaction: options.transaction,
      }
    );

    // Soft delete all Transactions associated with the User
    await Transaction.update(
      {
        deletedAt: new Date(),
      },
      {
        where: {
          UserId: user.id,
        },
        transaction: options.transaction,
      }
    );
  });

  return User;
};
