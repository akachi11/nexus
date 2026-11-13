import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/middleware/auth";
import { connectDB } from "@/lib/db";
import { Transaction } from "@/lib/models";
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

    tx.status = "failed";
    tx.reviewedBy = admin.userId as unknown as typeof tx.reviewedBy;
    tx.reviewedAt = new Date();
    await tx.save();

    if (tx.isInternal && tx.counterpartTxId) {
      await Transaction.findByIdAndUpdate(tx.counterpartTxId, {
        status: "failed",
        reviewedBy: admin.userId,
        reviewedAt: new Date(),
      });
    }

    return successResponse({ message: "Transaction rejected", transactionId: tx._id });
  } catch (error) {
    return handleApiError(error);
  }
}
