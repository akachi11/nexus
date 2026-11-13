import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { User, RefreshToken } from "@/lib/models";
import {
  verifyRefreshToken,
  signAccessToken,
  signRefreshToken,
  hashToken,
} from "@/lib/auth";
import { successResponse, errorResponse, handleApiError } from "@/lib/api-utils";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const refreshTokenCookie = cookieStore.get("refreshToken");

    if (!refreshTokenCookie?.value) {
      return errorResponse("No refresh token provided", 401);
    }

    const oldToken = refreshTokenCookie.value;
    let payload: { userId: string };

    try {
      payload = verifyRefreshToken(oldToken);
    } catch {
      cookieStore.delete("refreshToken");
      return errorResponse("Invalid or expired refresh token", 401);
    }

    await connectDB();

    const oldTokenHash = hashToken(oldToken);
    const storedToken = await RefreshToken.findOne({ tokenHash: oldTokenHash });

    if (!storedToken) {
      await RefreshToken.deleteMany({ userId: payload.userId });
      cookieStore.delete("refreshToken");
      return errorResponse("Refresh token has been revoked", 401);
    }

    const user = await User.findById(payload.userId);
    if (!user || !user.isActive) {
      cookieStore.delete("refreshToken");
      return errorResponse("User not found or deactivated", 401);
    }

    await RefreshToken.deleteOne({ _id: storedToken._id });

    const newAccessToken = signAccessToken(user);
    const newRefreshToken = signRefreshToken(user);

    await RefreshToken.create({
      userId: user._id,
      tokenHash: hashToken(newRefreshToken),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    cookieStore.set("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return successResponse({ accessToken: newAccessToken });
  } catch (error) {
    return handleApiError(error);
  }
}
