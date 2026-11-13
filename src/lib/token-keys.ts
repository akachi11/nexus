import * as bip39 from "bip39";
import crypto from "crypto";
import { encrypt } from "./encryption";

export interface TokenKeyPair {
  seedPhrase: string;
  privateKey: string;
}

export function generateTokenKeys(): TokenKeyPair {
  const mnemonic = bip39.generateMnemonic(128);
  const seed = bip39.mnemonicToSeedSync(mnemonic);
  const privateKey = crypto
    .createHash("sha256")
    .update(seed)
    .digest("hex");

  return {
    seedPhrase: encrypt(mnemonic),
    privateKey: encrypt(privateKey),
  };
}

export function generateWalletAddress(): string {
  return `0x${crypto.randomBytes(20).toString("hex")}`;
}
