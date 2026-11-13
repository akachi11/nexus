import jwt from "jsonwebtoken";
import crypto from "crypto";
import { IUser } from "./models/user";

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET environment variable is not defined");
  return secret;
}

function getRefreshSecret(): string {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) throw new Error("JWT_REFRESH_SECRET environment variable is not defined");
  return secret;
}

export interface JwtPayload {
  userId: string;
  email: string;
  role: "user" | "admin";
}

export function signAccessToken(user: IUser): string {
  return jwt.sign(
    { userId: user._id.toString(), email: user.email, role: user.role },
    getJwtSecret(),
    { expiresIn: "15m" }
  );
}

export function signRefreshToken(user: IUser): string {
  return jwt.sign(
    { userId: user._id.toString() },
    getRefreshSecret(),
    { expiresIn: "7d" }
  );
}

export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, getJwtSecret()) as JwtPayload;
}

export function verifyRefreshToken(token: string): { userId: string } {
  return jwt.verify(token, getRefreshSecret()) as { userId: string };
}

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}
