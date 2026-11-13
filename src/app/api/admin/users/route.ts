import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/middleware/auth";
import { connectDB } from "@/lib/db";
import { User } from "@/lib/models";
import { successResponse, handleApiError, applyRateLimit } from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  try {
    const rateLimited = applyRateLimit(req);
    if (rateLimited) return rateLimited;

    await requireAdmin(req);
    await connectDB();

    const users = await User.find()
      .select("-password")
      .sort({ createdAt: -1 });

    return successResponse(
      users.map((u) => ({
        id: u._id,
        email: u.email,
        firstName: u.firstName,
        lastName: u.lastName,
        role: u.role,
        isActive: u.isActive,
        lastLogin: u.lastLogin,
        createdAt: u.createdAt,
      }))
    );
  } catch (error) {
    return handleApiError(error);
  }
}
