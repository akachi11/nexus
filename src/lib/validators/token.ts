import { z } from "zod";

export const createTokenSchema = z.object({
  walletId: z.string().min(1, "Wallet ID is required"),
  name: z.string().min(1, "Token name is required").max(50).trim(),
  symbol: z.string().min(1, "Token symbol is required").max(10).trim().toUpperCase(),
  icon: z.string().default("circle"),
  color: z.string().default("gray"),
  totalSupply: z.number().min(1, "Total supply must be at least 1"),
  description: z.string().max(500).default(""),
  paymentTokenId: z.string().min(1, "Payment token is required"),
});

export function calculateMintingFee(totalSupply: number): number {
  return Math.max(20, totalSupply * 0.0001);
}

export const updateTokenPriceSchema = z.object({
  price: z.number().min(0, "Price must be non-negative"),
});

export type CreateTokenInput = z.infer<typeof createTokenSchema>;
export type UpdateTokenPriceInput = z.infer<typeof updateTokenPriceSchema>;
