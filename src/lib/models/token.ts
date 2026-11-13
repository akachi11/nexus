import mongoose, { Schema, Document, Model } from "mongoose";

export interface IToken extends Document {
  _id: mongoose.Types.ObjectId;
  walletId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  name: string;
  symbol: string;
  icon: string;
  price: number;
  change24h: number;
  balance: number;
  color: string;
  isCustom: boolean;
  totalSupply: number;
  description: string;
  seedPhrase: string;
  privateKey: string;
  createdAt: Date;
  updatedAt: Date;
}

const tokenSchema = new Schema<IToken>(
  {
    walletId: {
      type: Schema.Types.ObjectId,
      ref: "Wallet",
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    symbol: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    icon: {
      type: String,
      default: "circle",
    },
    price: {
      type: Number,
      default: 0,
      min: 0,
    },
    change24h: {
      type: Number,
      default: 0,
    },
    balance: {
      type: Number,
      default: 0,
      min: 0,
    },
    color: {
      type: String,
      default: "gray",
    },
    isCustom: {
      type: Boolean,
      default: false,
    },
    totalSupply: {
      type: Number,
      default: 0,
    },
    description: {
      type: String,
      default: "",
    },
    seedPhrase: {
      type: String,
      required: true,
      select: false,
    },
    privateKey: {
      type: String,
      required: true,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

export const Token: Model<IToken> =
  mongoose.models.Token || mongoose.model<IToken>("Token", tokenSchema);
