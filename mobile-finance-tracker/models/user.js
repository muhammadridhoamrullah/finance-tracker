const { hashPassword, comparePassword } = require("../helpers/bcrypt");
const { signToken } = require("../helpers/jwt");

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

  static async loginUser(input, db) {
    const { email, password } = input;

    const users = db.collection("users");

    // Cari user berdasarkan email
    const findUser = await users.findOne({
      email,
    });

    if (!findUser) {
      throw new Error("Invalid email or password");
    }

    // Verifikasi password
    const comparingPassword = await comparePassword(
      password,
      findUser.password
    );

    if (!comparingPassword) {
      throw new Error("Invalid email or password");
    }

    // Membuat token JWT
    const access_token = await signToken({
      id: findUser._id,
    });

    return {
      access_token,
    };
  }

  static async getUser(db) {
    const users = db.collection("users");

    const findAllUsers = await users
      .find({}, { projection: { password: 0 } })
      .toArray();

    if (findAllUsers.length === 0) {
      throw new Error("No users found");
    }

    return findAllUsers;
  }
}

module.exports = {
  User,
};

// {
//   "data": {
//     "getUser": [
//       {
//         "_id": "6860e133cb89577eb18063b6",
//         "firstName": "Kim",
//         "lastName": "Minji",
//         "email": "kimminji@gmail.com",
//         "phoneNumber": "085363508582",
//         "address": "Jalan Swarna Bumi",
//         "role": "User",
//         "isVerified": false,
//         "createdAt": "1751179571464",
//         "updatedAt": "1751179571464"
//       },
//       {
//         "_id": "6860efabd4b84596988a8cd6",
//         "firstName": "Kang",
//         "lastName": "Harin",
//         "email": "kanghaerin@gmail.com",
//         "phoneNumber": "085363508583",
//         "address": "Jalan Kembang",
//         "role": "User",
//         "isVerified": false,
//         "createdAt": "1751183275988",
//         "updatedAt": "1751183275988"
//       }
//     ]
//   }
// }

// {
//   "data": {
//     "getUser": [
//       {
//         "_id": "6860e133cb89577eb18063b6",
//         "firstName": "Kim",
//         "lastName": "Minji",
//         "email": "kimminji@gmail.com",
//         "phoneNumber": "085363508582",
//         "address": "Jalan Swarna Bumi",
//         "role": "User",
//         "isVerified": false,
//         "createdAt": "2025-06-29T06:46:11.464Z",
//         "updatedAt": "2025-06-29T06:46:11.464Z"
//       },
//       {
//         "_id": "6860efabd4b84596988a8cd6",
//         "firstName": "Kang",
//         "lastName": "Harin",
//         "email": "kanghaerin@gmail.com",
//         "phoneNumber": "085363508583",
//         "address": "Jalan Kembang",
//         "role": "User",
//         "isVerified": false,
//         "createdAt": "2025-06-29T07:47:55.988Z",
//         "updatedAt": "2025-06-29T07:47:55.988Z"
//       }
//     ]
//   }
// }
