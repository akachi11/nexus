import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/middleware/auth";
import { connectDB } from "@/lib/db";
import { Wallet, Token } from "@/lib/models";
import { successResponse, handleApiError } from "@/lib/api-utils";

export async function GET(req: NextRequest) {
  try {
    const { dbUser } = await requireAuth(req);
    await connectDB();

    const wallets = await Wallet.find({ userId: dbUser._id });
    const walletIds = wallets.map((w) => w._id);
    const tokens = await Token.find({ walletId: { $in: walletIds } });

    const walletsWithTokens = wallets.map((w) => {
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

    return successResponse({
      user: {
        id: dbUser._id,
        email: dbUser.email,
        firstName: dbUser.firstName,
        lastName: dbUser.lastName,
        role: dbUser.role,
      },
      wallets: walletsWithTokens,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
