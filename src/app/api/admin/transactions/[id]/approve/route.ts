import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/middleware/auth";
import { connectDB } from "@/lib/db";
import { Token, Transaction } from "@/lib/models";
import { successResponse, errorResponse, handleApiError, applyRateLimit } from "@/lib/api-utils";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const rateLimited = applyRateLimit(req);
    if (rateLimited) return rateLimited;

    const { user: admin } = await requireAdmin(req);
    const { id } = await params;
    await connectDB();

    const tx = await Transaction.findById(id);
    if (!tx) return errorResponse("Transaction not found", 404);
    if (tx.status !== "pending") return errorResponse("Transaction is not pending", 400);

    if (tx.type === "send" && tx.tokenId) {
      const token = await Token.findById(tx.tokenId);
      if (!token) return errorResponse("Token no longer exists", 400);
      if (token.balance < tx.amount) return errorResponse("Insufficient token balance", 400);

      token.balance -= tx.amount;
      await token.save();

      if (tx.isInternal && tx.counterpartTxId) {
        const receiveTx = await Transaction.findById(tx.counterpartTxId);
        if (receiveTx && receiveTx.status === "pending" && receiveTx.tokenId) {
          const receiveToken = await Token.findById(receiveTx.tokenId);
          if (receiveToken) {
            receiveToken.balance += tx.amount;
            await receiveToken.save();
          }
          receiveTx.status = "completed";
          receiveTx.reviewedBy = admin.userId as unknown as typeof receiveTx.reviewedBy;
          receiveTx.reviewedAt = new Date();
          await receiveTx.save();
        }
      }
    } else if (tx.type === "receive" && tx.tokenId) {
      const token = await Token.findById(tx.tokenId);
      if (!token) return errorResponse("Token no longer exists", 400);
      token.balance += tx.amount;
      await token.save();
    } else if (tx.type === "swap" && tx.fromTokenId && tx.toTokenId && tx.toAmount) {
      const fromToken = await Token.findById(tx.fromTokenId);
      const toToken = await Token.findById(tx.toTokenId);
      if (!fromToken || !toToken) return errorResponse("Swap tokens no longer exist", 400);

      const fromAmount = fromToken.price > 0 ? tx.value / fromToken.price : 0;
      if (fromToken.balance < fromAmount) return errorResponse("Insufficient balance for swap", 400);

      fromToken.balance -= fromAmount;
      toToken.balance += tx.toAmount;
      await Promise.all([fromToken.save(), toToken.save()]);
    } else if (tx.type === "sell" && tx.tokenId) {
      const token = await Token.findById(tx.tokenId);
      if (!token) return errorResponse("Token no longer exists", 400);
      if (token.balance < tx.amount) return errorResponse("Insufficient balance for sell", 400);

      token.balance -= tx.amount;
      await token.save();
    } else if (tx.type === "create" && tx.tokenData) {
      const data = tx.tokenData as Record<string, unknown>;
      await Token.create(data);
    }

    tx.status = "completed";
    tx.reviewedBy = admin.userId as unknown as typeof tx.reviewedBy;
    tx.reviewedAt = new Date();
    await tx.save();

    return successResponse({ message: "Transaction approved", transactionId: tx._id });
  } catch (error) {
    return handleApiError(error);
  }
}
