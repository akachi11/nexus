import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/middleware/auth";
import { connectDB } from "@/lib/db";
import { Token } from "@/lib/models";
import { z } from "zod";
import { validateBody, successResponse, errorResponse, handleApiError, applyRateLimit } from "@/lib/api-utils";

const updateBalanceSchema = z.object({
  balance: z.number().min(0, "Balance cannot be negative"),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; tokenId: string }> }
) {
  try {
    const rateLimited = applyRateLimit(req);
    if (rateLimited) return rateLimited;

    await requireAdmin(req);
    const { id: userId, tokenId } = await params;
    const body = await validateBody(req, updateBalanceSchema);
    await connectDB();

    const token = await Token.findOne({ _id: tokenId, userId });
    if (!token) return errorResponse("Token not found for this user", 404);

    token.balance = body.balance;
    await token.save();

    return successResponse({
      id: token._id,
      name: token.name,
      symbol: token.symbol,
      balance: token.balance,
      value: token.balance * token.price,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
