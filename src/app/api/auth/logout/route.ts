import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { RefreshToken } from "@/lib/models";
import { hashToken } from "@/lib/auth";
import { successResponse, handleApiError } from "@/lib/api-utils";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const refreshTokenCookie = cookieStore.get("refreshToken");

    if (refreshTokenCookie?.value) {
      await connectDB();
      await RefreshToken.deleteOne({
        tokenHash: hashToken(refreshTokenCookie.value),
      });
    }

    cookieStore.delete("refreshToken");

    return successResponse({ message: "Logged out successfully" });
  } catch (error) {
    return handleApiError(error);
  }
}
