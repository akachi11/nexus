import { z } from "zod";

export const sendTransactionSchema = z.object({
  walletId: z.string().min(1),
  tokenId: z.string().min(1),
  amount: z.number().positive("Amount must be positive"),
  toAddress: z.string().min(1, "Recipient address is required"),
});

export const swapTransactionSchema = z.object({
  walletId: z.string().min(1),
  fromTokenId: z.string().min(1),
  toTokenId: z.string().min(1),
  fromAmount: z.number().positive("Amount must be positive"),
  toAmount: z.number().positive("Amount must be positive"),
});

export const buyTransactionSchema = z.object({
  walletId: z.string().min(1),
  tokenId: z.string().min(1),
  amount: z.number().positive("Amount must be positive"),
  fiatAmount: z.number().positive("Fiat amount must be positive"),
});

export const sellTransactionSchema = z.object({
  walletId: z.string().min(1),
  tokenId: z.string().min(1),
  amount: z.number().positive("Amount must be positive"),
  fiatAmount: z.number().positive("Fiat amount must be positive"),
});

export const createTransactionSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("send"), ...sendTransactionSchema.shape }),
  z.object({ type: z.literal("swap"), ...swapTransactionSchema.shape }),
  z.object({ type: z.literal("buy"), ...buyTransactionSchema.shape }),
  z.object({ type: z.literal("sell"), ...sellTransactionSchema.shape }),
]);

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
