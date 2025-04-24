import jwt, { JwtPayload } from "jsonwebtoken";

const JWT_SECRET = process.env.SECRET!;

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET);
}
