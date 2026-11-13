import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/middleware/auth";
import { connectDB } from "@/lib/db";
import { Transaction } from "@/lib/models";
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

    const tx = await Transaction.findOne({ _id: id, userId: user.userId });
    if (!tx) return errorResponse("Transaction not found", 404);

    return successResponse({
      id: tx._id,
      type: tx.type,
      status: tx.status,
      token: tx.token,
      tokenSymbol: tx.tokenSymbol,
      amount: tx.amount,
      value: tx.value,
      address: tx.address,
      tokenId: tx.tokenId,
      fromTokenId: tx.fromTokenId,
      toTokenId: tx.toTokenId,
      toAmount: tx.toAmount,
      fiatAmount: tx.fiatAmount,
      isInternal: tx.isInternal,
      transferId: tx.transferId,
      createdAt: tx.createdAt,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
