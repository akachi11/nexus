import { NextRequest } from "next/server";
import crypto from "crypto";
import { requireAuth } from "@/lib/middleware/auth";
import { connectDB } from "@/lib/db";
import { Wallet, Token, Transaction } from "@/lib/models";
import { createTransactionSchema } from "@/lib/validators/transaction";
import { validateBody, successResponse, errorResponse, handleApiError, applyRateLimit } from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  try {
    const rateLimited = applyRateLimit(req);
    if (rateLimited) return rateLimited;

    const { user } = await requireAuth(req);
    await connectDB();

    const url = req.nextUrl;
    const status = url.searchParams.get("status");
    const type = url.searchParams.get("type");
    const walletId = url.searchParams.get("walletId");
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "50"), 100);
    const page = Math.max(parseInt(url.searchParams.get("page") || "1"), 1);

    const filter: Record<string, unknown> = { userId: user.userId };
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (walletId) filter.walletId = walletId;

    const [transactions, total] = await Promise.all([
      Transaction.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
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
        createdAt: tx.createdAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const rateLimited = applyRateLimit(req);
    if (rateLimited) return rateLimited;

    const { user } = await requireAuth(req);
    const body = await validateBody(req, createTransactionSchema);
    await connectDB();

    const wallet = await Wallet.findOne({ _id: body.walletId, userId: user.userId });
    if (!wallet) return errorResponse("Wallet not found", 404);

    if (body.type === "send") {
      const token = await Token.findOne({ _id: body.tokenId, walletId: wallet._id });
      if (!token) return errorResponse("Token not found in wallet", 404);
      if (token.balance < body.amount) return errorResponse("Insufficient balance", 400);

      const recipientWallet = await Wallet.findOne({ address: body.toAddress });
      const isInternal = !!recipientWallet;

      if (isInternal) {
        const recipientToken = await Token.findOne({
          walletId: recipientWallet._id,
          symbol: token.symbol,
        });

        if (!recipientToken) {
          return errorResponse(
            `Recipient wallet does not hold ${token.symbol}. They need to add this token first.`,
            400
          );
        }

        const transferId = crypto.randomUUID();

        const [sendTx, receiveTx] = await Promise.all([
          Transaction.create({
            userId: user.userId,
            walletId: wallet._id,
            type: "send",
            status: "pending",
            token: token.name,
            tokenSymbol: token.symbol,
            amount: body.amount,
            value: body.amount * token.price,
            address: body.toAddress,
            tokenId: token._id,
            transferId,
            isInternal: true,
          }),
          Transaction.create({
            userId: recipientWallet.userId,
            walletId: recipientWallet._id,
            type: "receive",
            status: "pending",
            token: token.name,
            tokenSymbol: token.symbol,
            amount: body.amount,
            value: body.amount * token.price,
            address: wallet.address,
            tokenId: recipientToken._id,
            transferId,
            isInternal: true,
          }),
        ]);

        await Promise.all([
          Transaction.findByIdAndUpdate(sendTx._id, { counterpartTxId: receiveTx._id }),
          Transaction.findByIdAndUpdate(receiveTx._id, { counterpartTxId: sendTx._id }),
        ]);

        return successResponse({
          message: "Internal transfer submitted for approval",
          transactionId: sendTx._id,
          isInternal: true,
        }, 201);
      }

      const tx = await Transaction.create({
        userId: user.userId,
        walletId: wallet._id,
        type: "send",
        status: "pending",
        token: token.name,
        tokenSymbol: token.symbol,
        amount: body.amount,
        value: body.amount * token.price,
        address: body.toAddress,
        tokenId: token._id,
        isInternal: false,
      });

      return successResponse({
        message: "Send request submitted for approval",
        transactionId: tx._id,
        isInternal: false,
      }, 201);
    }

    if (body.type === "swap") {
      const fromToken = await Token.findOne({ _id: body.fromTokenId, walletId: wallet._id });
      const toToken = await Token.findOne({ _id: body.toTokenId, walletId: wallet._id });
      if (!fromToken) return errorResponse("Source token not found", 404);
      if (!toToken) return errorResponse("Destination token not found", 404);
      if (fromToken.balance < body.fromAmount) return errorResponse("Insufficient balance", 400);

      const tx = await Transaction.create({
        userId: user.userId,
        walletId: wallet._id,
        type: "swap",
        status: "pending",
        token: `${fromToken.symbol} → ${toToken.symbol}`,
        tokenSymbol: toToken.symbol,
        amount: body.toAmount,
        value: body.fromAmount * fromToken.price,
        address: "DEX",
        fromTokenId: fromToken._id,
        toTokenId: toToken._id,
        toAmount: body.toAmount,
      });

      return successResponse({ message: "Swap request submitted for approval", transactionId: tx._id }, 201);
    }

    if (body.type === "buy") {
      const token = await Token.findOne({ _id: body.tokenId, walletId: wallet._id });
      if (!token) return errorResponse("Token not found", 404);

      const tx = await Transaction.create({
        userId: user.userId,
        walletId: wallet._id,
        type: "receive",
        status: "pending",
        token: token.name,
        tokenSymbol: token.symbol,
        amount: body.amount,
        value: body.fiatAmount,
        address: "Purchase",
        tokenId: token._id,
        fiatAmount: body.fiatAmount,
      });

      return successResponse({ message: "Buy request submitted for approval", transactionId: tx._id }, 201);
    }

    if (body.type === "sell") {
      const token = await Token.findOne({ _id: body.tokenId, walletId: wallet._id });
      if (!token) return errorResponse("Token not found", 404);
      if (token.balance < body.amount) return errorResponse("Insufficient balance", 400);

      const tx = await Transaction.create({
        userId: user.userId,
        walletId: wallet._id,
        type: "sell",
        status: "pending",
        token: token.name,
        tokenSymbol: token.symbol,
        amount: body.amount,
        value: body.fiatAmount,
        address: "Sale",
        tokenId: token._id,
        fiatAmount: body.fiatAmount,
      });

      return successResponse({ message: "Sell request submitted for approval", transactionId: tx._id }, 201);
    }

    return errorResponse("Invalid transaction type", 400);
  } catch (error) {
    return handleApiError(error);
  }
}
