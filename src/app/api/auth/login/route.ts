import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { User, RefreshToken } from "@/lib/models";
import { signAccessToken, signRefreshToken, hashToken } from "@/lib/auth";
import { loginSchema } from "@/lib/validators/auth";
import { validateBody, successResponse, errorResponse, handleApiError, applyRateLimit } from "@/lib/api-utils";
import { RATE_LIMITS } from "@/lib/middleware/rate-limit";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const rateLimited = applyRateLimit(req, RATE_LIMITS.auth);
    if (rateLimited) return rateLimited;

    const body = await validateBody(req, loginSchema);
    await connectDB();

    const user = await User.findOne({ email: body.email }).select("+password");
    if (!user) {
      return errorResponse("Invalid email or password", 401);
    }

    if (!user.isActive) {
      return errorResponse("Account has been deactivated", 403);
    }

    const isPasswordValid = await bcrypt.compare(body.password, user.password);
    if (!isPasswordValid) {
      return errorResponse("Invalid email or password", 401);
    }

    user.lastLogin = new Date();
    await user.save();

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    await RefreshToken.create({
      userId: user._id,
      tokenHash: hashToken(refreshToken),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    const cookieStore = await cookies();
    cookieStore.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return successResponse({
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      accessToken,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
