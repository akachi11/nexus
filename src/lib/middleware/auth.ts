import { NextRequest } from "next/server";
import { verifyAccessToken, JwtPayload } from "../auth";
import { connectDB } from "../db";
import { User, IUser } from "../models";

export interface AuthenticatedRequest {
  user: JwtPayload;
  dbUser: IUser;
}

export async function requireAuth(req: NextRequest): Promise<AuthenticatedRequest> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    throw new AuthError("Missing or invalid authorization header", 401);
  }

  const token = authHeader.substring(7);

  let payload: JwtPayload;
  try {
    payload = verifyAccessToken(token);
  } catch {
    throw new AuthError("Invalid or expired access token", 401);
  }

  await connectDB();
  const user = await User.findById(payload.userId);

  if (!user) {
    throw new AuthError("User not found", 401);
  }

  if (!user.isActive) {
    throw new AuthError("Account has been deactivated", 403);
  }

  return { user: payload, dbUser: user };
}

export async function requireAdmin(req: NextRequest): Promise<AuthenticatedRequest> {
  const auth = await requireAuth(req);

  if (auth.user.role !== "admin") {
    throw new AuthError("Admin access required", 403);
  }

  return auth;
}

export class AuthError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "AuthError";
    this.status = status;
  }
}
