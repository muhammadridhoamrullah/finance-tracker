import { GetDB } from "../config";
import { comparePassword, hashPassword } from "../helpers/bcrypt";
import { signToken } from "../helpers/jwt";
import { UserModel } from "../type/type";

type UserModelInput = Omit<UserModel, "_id" | "createdAt" | "updatedAt">;
type UserModelLogin = Pick<UserModel, "email" | "password">;
const COLLECTION_NAME = "users";

export async function createUser(user: UserModelInput) {
  const db = await GetDB();

  const checkUser = (await db.collection(COLLECTION_NAME).findOne({
    email: user.email,
  })) as UserModel | null;

  if (checkUser) {
    throw new Error("Email already exists");
  }

  const checkPhoneNumber = await db.collection(COLLECTION_NAME).findOne({
    phoneNumber: user.phoneNumber,
  });

  if (checkPhoneNumber) {
    throw new Error("Phone number already exists");
  }

  const newUser = {
    ...user,
    password: hashPassword(user.password),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const createNewUser = await db.collection(COLLECTION_NAME).insertOne(newUser);

  if (!createNewUser.acknowledged) {
    throw new Error("Failed to create user");
  }
  console.log(createNewUser, "ini model user create");

  return createNewUser;
}

export async function loginUser(user: UserModelLogin) {
  const db = await GetDB();

  const checkUser = (await db.collection(COLLECTION_NAME).findOne({
    email: user.email,
  })) as UserModel | null;

  if (!checkUser) {
    throw new Error("Email or Password is invalid");
  }

  const checkPassword = comparePassword(user.password, checkUser.password);

  if (!checkPassword) {
    throw new Error("Email or Password is invalid");
  }

  const access_token = signToken({
    _id: checkUser._id,
    email: checkUser.email,
  });

  return access_token;
}
