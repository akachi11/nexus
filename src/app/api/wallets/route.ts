import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/middleware/auth";
import { connectDB } from "@/lib/db";
import { Wallet, Token } from "@/lib/models";
import { createWalletSchema } from "@/lib/validators/wallet";
import { generateWalletAddress, generateTokenKeys } from "@/lib/token-keys";
import { validateBody, successResponse, handleApiError, applyRateLimit } from "@/lib/api-utils";
import { STANDARD_TOKENS } from "@/lib/standard-tokens";

const DEFAULT_TOKENS = STANDARD_TOKENS.slice(0, 3);

export async function GET(req: NextRequest) {
  try {
    const rateLimited = applyRateLimit(req);
    if (rateLimited) return rateLimited;

    const { user } = await requireAuth(req);
    await connectDB();

    const wallets = await Wallet.find({ userId: user.userId });
    const walletIds = wallets.map((w) => w._id);
    const tokens = await Token.find({ walletId: { $in: walletIds } });

    const result = wallets.map((w) => {
      const walletTokens = tokens.filter(
        (t) => t.walletId.toString() === w._id.toString()
      );
      const totalBalance = walletTokens.reduce(
        (sum, t) => sum + t.balance * t.price,
        0
      );
      return {
        id: w._id,
        name: w.name,
        address: w.address,
        color: w.color,
        totalBalance,
        tokens: walletTokens.map((t) => ({
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
      };
    });

    return successResponse(result);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const rateLimited = applyRateLimit(req);
    if (rateLimited) return rateLimited;

    const { user } = await requireAuth(req);
    const body = await validateBody(req, createWalletSchema);
    await connectDB();

    const wallet = await Wallet.create({
      userId: user.userId,
      name: body.name,
      address: generateWalletAddress(),
      color: body.color,
    });

    const tokenDocs = DEFAULT_TOKENS.map((t) => {
      const keys = generateTokenKeys();
      return {
        walletId: wallet._id,
        userId: user.userId,
        name: t.name,
        symbol: t.symbol,
        icon: t.icon,
        price: t.price,
        change24h: t.change24h,
        balance: 0,
        color: t.color,
        isCustom: false,
        seedPhrase: keys.seedPhrase,
        privateKey: keys.privateKey,
      };
    });

    await Token.insertMany(tokenDocs);

    return successResponse(
      { id: wallet._id, name: wallet.name, address: wallet.address, color: wallet.color },
      201
    );
  } catch (error) {
    return handleApiError(error);
  }
}
