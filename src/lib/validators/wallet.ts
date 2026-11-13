import { z } from "zod";

export const createWalletSchema = z.object({
  name: z.string().min(1, "Wallet name is required").max(50).trim(),
  color: z.string().default("blue"),
});

export const updateWalletSchema = z.object({
  name: z.string().min(1).max(50).trim().optional(),
  color: z.string().optional(),
});

export type CreateWalletInput = z.infer<typeof createWalletSchema>;
export type UpdateWalletInput = z.infer<typeof updateWalletSchema>;
