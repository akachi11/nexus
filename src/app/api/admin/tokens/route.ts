import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/middleware/auth";
import { connectDB } from "@/lib/db";
import { Token } from "@/lib/models";
import { successResponse, handleApiError, applyRateLimit } from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  try {
    const rateLimited = applyRateLimit(req);
    if (rateLimited) return rateLimited;

    await requireAdmin(req);
    await connectDB();

    const url = req.nextUrl;
    const isCustom = url.searchParams.get("isCustom");

    const filter: Record<string, unknown> = {};
    if (isCustom === "true") filter.isCustom = true;
    if (isCustom === "false") filter.isCustom = false;

    const tokens = await Token.find(filter)
      .populate("walletId", "name address")
      .populate("userId", "firstName lastName email")
      .sort({ createdAt: -1 });

    return successResponse(
      tokens.map((t) => ({
        id: t._id,
        name: t.name,
        symbol: t.symbol,
        icon: t.icon,
        price: t.price,
        change24h: t.change24h,
        balance: t.balance,
        value: t.balance * t.price,
        color: t.color,
        isCustom: t.isCustom,
        totalSupply: t.totalSupply,
        wallet: t.walletId,
        user: t.userId,
        createdAt: t.createdAt,
      }))
    );
  } catch (error) {
    return handleApiError(error);
  }
}
