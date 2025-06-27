const { hashPassword } = require("../helpers/bcrypt");

class User {
  static async createUser(input, db) {
    const users = db.collection("users");
    const { firstName, lastName, email, password, phoneNumber, address } =
      input;
    const hashedPassword = hashPassword(password);

    const isValidEmail = (email) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    };

    if (!isValidEmail(email)) {
      throw new Error("Invalid email format");
    }

    const checkEmail = await users.findOne({
      email,
    });

    const checkPhoneNumber = await users.findOne({
      phoneNumber,
    });

    if (checkEmail) {
      throw new Error("Email already exists");
    }

    if (checkPhoneNumber) {
      throw new Error("Phone number already exists");
    }

    if (password.length < 8) {
      throw new Error("Password must be at least 8 characters long");
    }

    const newUser = {
      ...input,
      password: hashedPassword,
      role: "User",
      isVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const creating = await users.insertOne(newUser);

    if (!creating.acknowledged) {
      throw new Error("Failed to create user");
    }

    return {
      message: "User created successfully",
      _id: creating.insertedId,
    };
  }
}

module.exports = {
  User,
};
