import { NextRequest } from "next/server";
import { requireAdmin } from "@/lib/middleware/auth";
import { connectDB } from "@/lib/db";
import { User, Wallet, Token } from "@/lib/models";
import { successResponse, errorResponse, handleApiError, applyRateLimit } from "@/lib/api-utils";
import { z } from "zod";
import { validateBody } from "@/lib/api-utils";

const updateUserSchema = z.object({
  isActive: z.boolean().optional(),
  role: z.enum(["user", "admin"]).optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const rateLimited = applyRateLimit(req);
    if (rateLimited) return rateLimited;

    await requireAdmin(req);
    const { id } = await params;
    await connectDB();

    const user = await User.findById(id).select("-password");
    if (!user) return errorResponse("User not found", 404);

    const wallets = await Wallet.find({ userId: user._id });
    const walletIds = wallets.map((w) => w._id);
    const tokens = await Token.find({ walletId: { $in: walletIds } });

    return successResponse({
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
      },
      wallets: wallets.map((w) => {
        const walletTokens = tokens.filter(
          (t) => t.walletId.toString() === w._id.toString()
        );
        return {
          id: w._id,
          name: w.name,
          address: w.address,
          tokens: walletTokens.map((t) => ({
            id: t._id,
            name: t.name,
            symbol: t.symbol,
            balance: t.balance,
            value: t.balance * t.price,
          })),
        };
      }),
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

    const { user: admin } = await requireAdmin(req);
    const { id } = await params;
    const body = await validateBody(req, updateUserSchema);
    await connectDB();

    if (id === admin.userId) {
      return errorResponse("Cannot modify your own account via admin API", 400);
    }

    const user = await User.findByIdAndUpdate(id, { $set: body }, { new: true }).select("-password");
    if (!user) return errorResponse("User not found", 404);

    return successResponse({
      id: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      isActive: user.isActive,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
