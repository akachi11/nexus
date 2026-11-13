import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/middleware/auth";
import { connectDB } from "@/lib/db";
import { Token } from "@/lib/models";
import { successResponse, errorResponse, handleApiError, applyRateLimit } from "@/lib/api-utils";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const rateLimited = applyRateLimit(req);
    if (rateLimited) return rateLimited;

    const { user } = await requireAuth(req);
    const { id } = await params;
    await connectDB();

    const token = await Token.findOne({ _id: id, userId: user.userId });
    if (!token) return errorResponse("Token not found", 404);

    return successResponse({
      id: token._id,
      name: token.name,
      symbol: token.symbol,
      icon: token.icon,
      price: token.price,
      change24h: token.change24h,
      balance: token.balance,
      value: token.balance * token.price,
      color: token.color,
      isCustom: token.isCustom,
      totalSupply: token.totalSupply,
      description: token.description,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
