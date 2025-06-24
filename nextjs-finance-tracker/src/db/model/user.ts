import { ObjectId } from "mongodb";
import { GetDB } from "../config";
import { comparePassword, hashPassword } from "../helpers/bcrypt";
import { signToken } from "../helpers/jwt";
import { UserModel } from "../type/type";
import { sendEmail } from "../utils/emailService";
import * as jose from "jose";
import { useServerInsertedHTML } from "next/navigation";

type UserModelInput = Omit<
  UserModel,
  "_id" | "createdAt" | "updatedAt" | "isDeleted" | "deletedAt"
>;
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
    role: "User",
    isVerified: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const createNewUser = await db.collection(COLLECTION_NAME).insertOne(newUser);

  if (!createNewUser.acknowledged) {
    throw new Error("Failed to create user");
  }

  const token = signToken({
    _id: createNewUser.insertedId.toString(),
  });

  const link = `${process.env.NEXT_PUBLIC_CLIENT_URL}/verify-email?token=${token}`;

  await sendEmail(
    user.email,
    "Verify your email",
    `Hi ${newUser.firstName},\n\nPlease verify your email by clicking the link below:\n${link}\n\nThank you!`
  );

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

  if (!checkUser.isVerified) {
    throw new Error("Email is not verified");
  }

  const checkPassword = comparePassword(user.password, checkUser.password);

  if (!checkPassword) {
    throw new Error("Email or Password is invalid");
  }

  const access_token = signToken({
    _id: checkUser._id,
    email: checkUser.email,
    role: checkUser.role,
  });

  return access_token;
}

export async function verifyEmail(token: string) {
  const db = await GetDB();

  const secret = new TextEncoder().encode(process.env.SECRET);

  const decoded = await jose.jwtVerify<{
    _id: string;
  }>(token, secret);

  const UserId = decoded.payload._id;
  console.log("UserId di model user verifyemail", UserId);

  const checkUser = await db.collection(COLLECTION_NAME).findOne({
    _id: new ObjectId(UserId),
  });

  if (!checkUser) {
    throw new Error("User not found");
  }

  if (checkUser.isVerified) {
    throw new Error("Email already verified");
  }

  const updateUser = await db.collection(COLLECTION_NAME).updateOne(
    {
      _id: new ObjectId(UserId),
    },
    {
      $set: {
        isVerified: true,
        updatedAt: new Date(),
      },
    }
  );

  console.log("updateUser di model user verify email", updateUser);

  return updateUser;
}
