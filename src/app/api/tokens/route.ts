import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/middleware/auth";
import { connectDB } from "@/lib/db";
import { Wallet, Token, Transaction } from "@/lib/models";
import { createTokenSchema } from "@/lib/validators/token";
import { generateTokenKeys } from "@/lib/token-keys";
import { validateBody, successResponse, errorResponse, handleApiError, applyRateLimit } from "@/lib/api-utils";

export async function POST(req: NextRequest) {
  try {
    const rateLimited = applyRateLimit(req);
    if (rateLimited) return rateLimited;

    const { user } = await requireAuth(req);
    const body = await validateBody(req, createTokenSchema);
    await connectDB();

    const wallet = await Wallet.findOne({ _id: body.walletId, userId: user.userId });
    if (!wallet) return errorResponse("Wallet not found", 404);

    const keys = generateTokenKeys();

    const tokenData = {
      walletId: wallet._id,
      userId: user.userId,
      name: body.name,
      symbol: body.symbol,
      icon: body.icon,
      color: body.color,
      totalSupply: body.totalSupply,
      description: body.description,
      balance: body.totalSupply,
      isCustom: true,
      seedPhrase: keys.seedPhrase,
      privateKey: keys.privateKey,
    };

    await Transaction.create({
      userId: user.userId,
      walletId: wallet._id,
      type: "create",
      status: "pending",
      token: body.name,
      tokenSymbol: body.symbol,
      amount: body.totalSupply,
      value: 0,
      address: "Contract",
      tokenData,
    });

    return successResponse({ message: "Token creation request submitted for approval" }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
