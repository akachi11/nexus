import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { User, Wallet, Token, RefreshToken } from "@/lib/models";
import { signAccessToken, signRefreshToken, hashToken } from "@/lib/auth";
import { registerSchema } from "@/lib/validators/auth";
import { generateTokenKeys, generateWalletAddress } from "@/lib/token-keys";
import { validateBody, successResponse, handleApiError, applyRateLimit } from "@/lib/api-utils";
import { RATE_LIMITS } from "@/lib/middleware/rate-limit";
import { cookies } from "next/headers";

const DEFAULT_TOKENS = [
  { name: "Bitcoin", symbol: "BTC", icon: "bitcoin", price: 97500, change24h: 2.4, color: "orange" },
  { name: "Ethereum", symbol: "ETH", icon: "ethereum", price: 3450, change24h: -1.2, color: "blue" },
  { name: "Tether", symbol: "USDT", icon: "dollar-sign", price: 1.0, change24h: 0.01, color: "green" },
];

export async function POST(req: NextRequest) {
  try {
    const rateLimited = applyRateLimit(req, RATE_LIMITS.auth);
    if (rateLimited) return rateLimited;

    const body = await validateBody(req, registerSchema);
    await connectDB();

    const existingUser = await User.findOne({ email: body.email });
    if (existingUser) {
      return Response.json(
        { success: false, error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(body.password, 12);

    const user = await User.create({
      email: body.email,
      password: hashedPassword,
      firstName: body.firstName,
      lastName: body.lastName,
      role: "user",
    });

    const wallet = await Wallet.create({
      userId: user._id,
      name: "Main Wallet",
      address: generateWalletAddress(),
      color: "blue",
    });

    const tokenDocs = DEFAULT_TOKENS.map((t) => {
      const keys = generateTokenKeys();
      return {
        walletId: wallet._id,
        userId: user._id,
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

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    await RefreshToken.create({
      userId: user._id,
      tokenHash: hashToken(refreshToken),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    const cookieStore = await cookies();
    cookieStore.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return successResponse({
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      accessToken,
    }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
