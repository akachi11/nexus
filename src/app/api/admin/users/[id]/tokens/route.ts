import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/middleware/auth";
import { connectDB } from "@/lib/db";
import { User, Wallet, Token } from "@/lib/models";
import { z } from "zod";
import { validateBody, successResponse, errorResponse, handleApiError, applyRateLimit } from "@/lib/api-utils";
import { generateTokenKeys } from "@/lib/token-keys";
import { STANDARD_TOKENS } from "@/lib/standard-tokens";

const addTokenSchema = z.object({
  walletId: z.string().min(1, "Wallet is required"),
  symbol: z.string().min(1, "Token symbol is required"),
  balance: z.number().min(0).default(0),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const rateLimited = applyRateLimit(req);
    if (rateLimited) return rateLimited;

    await requireAdmin(req);
    const { id: userId } = await params;
    await connectDB();

    const user = await User.findById(userId);
    if (!user) return errorResponse("User not found", 404);

    const wallets = await Wallet.find({ userId });
    const walletIds = wallets.map((w) => w._id);
    const existingTokens = await Token.find({ walletId: { $in: walletIds } });
    const existingSymbols = new Set(existingTokens.map((t) => t.symbol));

    const customTokens = await Token.find({ isCustom: true }).distinct("symbol");
    const customTokenDocs = await Token.aggregate([
      { $match: { isCustom: true, symbol: { $in: customTokens } } },
      { $group: { _id: "$symbol", doc: { $first: "$$ROOT" } } },
      { $replaceRoot: { newRoot: "$doc" } },
    ]);

    const available = [
      ...STANDARD_TOKENS
        .filter((t) => !existingSymbols.has(t.symbol))
        .map((t) => ({ ...t, isCustom: false })),
      ...customTokenDocs
        .filter((t) => !existingSymbols.has(t.symbol))
        .map((t) => ({
          name: t.name,
          symbol: t.symbol,
          icon: t.icon,
          price: t.price,
          color: t.color,
          isCustom: true,
        })),
    ];

    return successResponse(available);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const rateLimited = applyRateLimit(req);
    if (rateLimited) return rateLimited;

    await requireAdmin(req);
    const { id: userId } = await params;
    const body = await validateBody(req, addTokenSchema);
    await connectDB();

    const user = await User.findById(userId);
    if (!user) return errorResponse("User not found", 404);

    const wallet = await Wallet.findOne({ _id: body.walletId, userId });
    if (!wallet) return errorResponse("Wallet not found for this user", 404);

    const existing = await Token.findOne({
      walletId: wallet._id,
      symbol: body.symbol.toUpperCase(),
    });
    if (existing) return errorResponse(`Token ${body.symbol} already exists in this wallet`, 409);

    const standardMatch = STANDARD_TOKENS.find(
      (t) => t.symbol === body.symbol.toUpperCase()
    );

    let tokenData: {
      name: string;
      symbol: string;
      icon: string;
      price: number;
      change24h: number;
      color: string;
      isCustom: boolean;
    };

    if (standardMatch) {
      tokenData = { ...standardMatch, isCustom: false };
    } else {
      const customRef = await Token.findOne({
        symbol: body.symbol.toUpperCase(),
        isCustom: true,
      });
      if (!customRef) {
        return errorResponse(
          `Unknown token symbol: ${body.symbol}. Must be a standard or existing custom token.`,
          400
        );
      }
      tokenData = {
        name: customRef.name,
        symbol: customRef.symbol,
        icon: customRef.icon,
        price: customRef.price,
        change24h: customRef.change24h,
        color: customRef.color,
        isCustom: true,
      };
    }

    const keys = generateTokenKeys();

    const token = await Token.create({
      walletId: wallet._id,
      userId: user._id,
      ...tokenData,
      balance: body.balance,
      seedPhrase: keys.seedPhrase,
      privateKey: keys.privateKey,
    });

    return successResponse(
      {
        id: token._id,
        name: token.name,
        symbol: token.symbol,
        icon: token.icon,
        price: token.price,
        balance: token.balance,
        value: token.balance * token.price,
        color: token.color,
        isCustom: token.isCustom,
      },
      201
    );
  } catch (error) {
    return handleApiError(error);
  }
}
