const { ObjectId } = require("mongodb");
const { connect } = require("../config/mongo");
const { verifyToken } = require("../helpers/jwt");

async function authentication(req, db) {
  try {
    // await connect();
    console.log(req.headers, "req.headers");

    const { authorization } = req.headers;

    if (!authorization || !authorization.startsWith("Bearer ")) {
      throw new Error("Authorization header is missing or invalid");
    }

    const token = authorization.split(" ")[1];

    const payload = await verifyToken(token);
    console.log(payload, "payload");

    const findUser = await db.collection("users").findOne({
      _id: new ObjectId(payload.id),
    });

    if (!findUser) {
      throw new Error("User not found");
    }

    return {
      UserId: findUser._id,
      email: findUser.email,
      role: findUser.role,
      isVerified: findUser.isVerified,
    };
  } catch (error) {
    throw new Error(`Authentication failed: ${error.message}`);
  }
}

module.exports = {
  authentication,
};
