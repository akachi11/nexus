import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITransaction extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  walletId: mongoose.Types.ObjectId;
  type: "send" | "receive" | "swap" | "create" | "sell";
  status: "pending" | "completed" | "failed";
  token: string;
  tokenSymbol: string;
  amount: number;
  value: number;
  address: string;
  tokenId: mongoose.Types.ObjectId | null;
  fromTokenId: mongoose.Types.ObjectId | null;
  toTokenId: mongoose.Types.ObjectId | null;
  toAmount: number | null;
  fiatAmount: number | null;
  tokenData: Record<string, unknown> | null;
  transferId: string | null;
  counterpartTxId: mongoose.Types.ObjectId | null;
  isInternal: boolean;
  reviewedBy: mongoose.Types.ObjectId | null;
  reviewedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new Schema<ITransaction>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    walletId: {
      type: Schema.Types.ObjectId,
      ref: "Wallet",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["send", "receive", "swap", "create", "sell"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
      index: true,
    },
    token: {
      type: String,
      required: true,
    },
    tokenSymbol: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    value: {
      type: Number,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    tokenId: {
      type: Schema.Types.ObjectId,
      ref: "Token",
      default: null,
    },
    fromTokenId: {
      type: Schema.Types.ObjectId,
      ref: "Token",
      default: null,
    },
    toTokenId: {
      type: Schema.Types.ObjectId,
      ref: "Token",
      default: null,
    },
    toAmount: {
      type: Number,
      default: null,
    },
    fiatAmount: {
      type: Number,
      default: null,
    },
    tokenData: {
      type: Schema.Types.Mixed,
      default: null,
    },
    transferId: {
      type: String,
      default: null,
      index: true,
    },
    counterpartTxId: {
      type: Schema.Types.ObjectId,
      ref: "Transaction",
      default: null,
    },
    isInternal: {
      type: Boolean,
      default: false,
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const Transaction: Model<ITransaction> =
  mongoose.models.Transaction ||
  mongoose.model<ITransaction>("Transaction", transactionSchema);
