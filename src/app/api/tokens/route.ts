import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/middleware/auth";
import { connectDB } from "@/lib/db";
import { Wallet, Token, Transaction } from "@/lib/models";
import { createTokenSchema, calculateMintingFee } from "@/lib/validators/token";
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

    const paymentToken = await Token.findOne({ _id: body.paymentTokenId, walletId: wallet._id });
    if (!paymentToken) return errorResponse("Payment token not found", 404);
    if (paymentToken.price <= 0) return errorResponse("Payment token has no market price", 400);

    const feeUsd = calculateMintingFee(body.totalSupply);
    const feeAmount = feeUsd / paymentToken.price;

    if (paymentToken.balance < feeAmount) {
      return errorResponse(
        `Insufficient ${paymentToken.symbol} balance. Need ${feeAmount.toFixed(6)} ($${feeUsd.toFixed(2)}) but have ${paymentToken.balance.toFixed(6)}`,
        400
      );
    }

    paymentToken.balance -= feeAmount;
    await paymentToken.save();

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
      value: feeUsd,
      address: "Contract",
      tokenId: paymentToken._id,
      fiatAmount: feeUsd,
      tokenData: {
        ...tokenData,
        fee: { tokenId: paymentToken._id.toString(), symbol: paymentToken.symbol, amount: feeAmount, usd: feeUsd },
      },
    });

    return successResponse({ message: "Token creation request submitted for approval", fee: { usd: feeUsd, amount: feeAmount, symbol: paymentToken.symbol } }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
