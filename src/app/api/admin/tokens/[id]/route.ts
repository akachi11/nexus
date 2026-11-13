import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/middleware/auth";
import { connectDB } from "@/lib/db";
import { Token } from "@/lib/models";
import { updateTokenPriceSchema } from "@/lib/validators/token";
import { validateBody, successResponse, errorResponse, handleApiError, applyRateLimit } from "@/lib/api-utils";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const rateLimited = applyRateLimit(req);
    if (rateLimited) return rateLimited;

    await requireAdmin(req);
    const { id } = await params;
    const body = await validateBody(req, updateTokenPriceSchema);
    await connectDB();

    const token = await Token.findByIdAndUpdate(
      id,
      { $set: { price: body.price } },
      { new: true }
    );

    if (!token) return errorResponse("Token not found", 404);

    return successResponse({
      id: token._id,
      name: token.name,
      symbol: token.symbol,
      price: token.price,
      balance: token.balance,
      value: token.balance * token.price,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
