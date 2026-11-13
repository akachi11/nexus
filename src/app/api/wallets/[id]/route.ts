import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/middleware/auth";
import { connectDB } from "@/lib/db";
import { Wallet, Token } from "@/lib/models";
import { updateWalletSchema } from "@/lib/validators/wallet";
import { validateBody, successResponse, errorResponse, handleApiError, applyRateLimit } from "@/lib/api-utils";

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

    const wallet = await Wallet.findOne({ _id: id, userId: user.userId });
    if (!wallet) return errorResponse("Wallet not found", 404);

    const tokens = await Token.find({ walletId: wallet._id });
    const totalBalance = tokens.reduce((sum, t) => sum + t.balance * t.price, 0);

    return successResponse({
      id: wallet._id,
      name: wallet.name,
      address: wallet.address,
      color: wallet.color,
      totalBalance,
      tokens: tokens.map((t) => ({
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
      })),
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const rateLimited = applyRateLimit(req);
    if (rateLimited) return rateLimited;

    const { user } = await requireAuth(req);
    const { id } = await params;
    const body = await validateBody(req, updateWalletSchema);
    await connectDB();

    const wallet = await Wallet.findOneAndUpdate(
      { _id: id, userId: user.userId },
      { $set: body },
      { new: true }
    );

    if (!wallet) return errorResponse("Wallet not found", 404);

    return successResponse({
      id: wallet._id,
      name: wallet.name,
      address: wallet.address,
      color: wallet.color,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
