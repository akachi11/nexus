import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/middleware/auth";
import { connectDB } from "@/lib/db";
import { Token } from "@/lib/models";
import { decrypt } from "@/lib/encryption";
import { successResponse, errorResponse, handleApiError, applyRateLimit } from "@/lib/api-utils";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const rateLimited = applyRateLimit(req);
    if (rateLimited) return rateLimited;

    await requireAdmin(req);
    const { id } = await params;
    await connectDB();

    const token = await Token.findById(id).select("+seedPhrase +privateKey");
    if (!token) return errorResponse("Token not found", 404);

    return successResponse({
      id: token._id,
      name: token.name,
      symbol: token.symbol,
      seedPhrase: decrypt(token.seedPhrase),
      privateKey: decrypt(token.privateKey),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
