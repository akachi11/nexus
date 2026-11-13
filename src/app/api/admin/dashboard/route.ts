import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/middleware/auth";
import { connectDB } from "@/lib/db";
import { User, Wallet, Token, Transaction } from "@/lib/models";
import { successResponse, handleApiError, applyRateLimit } from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  try {
    const rateLimited = applyRateLimit(req);
    if (rateLimited) return rateLimited;

    await requireAdmin(req);
    await connectDB();

    const [
      pendingCount,
      completedCount,
      failedCount,
      totalUsers,
      totalWallets,
      totalTokens,
      customTokens,
      recentPending,
      completedTxs,
    ] = await Promise.all([
      Transaction.countDocuments({ status: "pending" }),
      Transaction.countDocuments({ status: "completed" }),
      Transaction.countDocuments({ status: "failed" }),
      User.countDocuments(),
      Wallet.countDocuments(),
      Token.countDocuments(),
      Token.countDocuments({ isCustom: true }),
      Transaction.find({ status: "pending" })
        .sort({ createdAt: -1 })
        .limit(10)
        .populate("userId", "firstName lastName email"),
      Transaction.find({ status: "completed" }),
    ]);

    const totalVolume = completedTxs.reduce((sum, tx) => sum + tx.value, 0);

    return successResponse({
      stats: {
        pending: pendingCount,
        approved: completedCount,
        rejected: failedCount,
        totalVolume,
      },
      counts: {
        users: totalUsers,
        wallets: totalWallets,
        tokens: totalTokens,
        customTokens,
      },
      recentPending: recentPending.map((tx) => ({
        id: tx._id,
        type: tx.type,
        token: tx.token,
        tokenSymbol: tx.tokenSymbol,
        amount: tx.amount,
        value: tx.value,
        isInternal: tx.isInternal,
        createdAt: tx.createdAt,
        user: tx.userId,
      })),
    });
  } catch (error) {
    return handleApiError(error);
  }
}
