import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/middleware/auth";
import { connectDB } from "@/lib/db";
import { Transaction } from "@/lib/models";
import { successResponse, handleApiError, applyRateLimit } from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  try {
    const rateLimited = applyRateLimit(req);
    if (rateLimited) return rateLimited;

    await requireAdmin(req);
    await connectDB();

    const url = req.nextUrl;
    const status = url.searchParams.get("status");
    const type = url.searchParams.get("type");
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "50"), 100);
    const page = Math.max(parseInt(url.searchParams.get("page") || "1"), 1);

    const filter: Record<string, unknown> = {};
    if (status) filter.status = status;
    if (type) filter.type = type;

    const [transactions, total] = await Promise.all([
      Transaction.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("userId", "firstName lastName email")
        .populate("walletId", "name address"),
      Transaction.countDocuments(filter),
    ]);

    return successResponse({
      transactions: transactions.map((tx) => ({
        id: tx._id,
        type: tx.type,
        status: tx.status,
        token: tx.token,
        tokenSymbol: tx.tokenSymbol,
        amount: tx.amount,
        value: tx.value,
        address: tx.address,
        isInternal: tx.isInternal,
        transferId: tx.transferId,
        user: tx.userId,
        wallet: tx.walletId,
        reviewedBy: tx.reviewedBy,
        reviewedAt: tx.reviewedAt,
        createdAt: tx.createdAt,
      })),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
