import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import * as bip39 from "bip39";

const MONGODB_URI = process.env.MONGODB_URI;
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@nexuswallet.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin123!";

if (!MONGODB_URI) {
  console.error("MONGODB_URI is required");
  process.exit(1);
}
if (!ENCRYPTION_KEY) {
  console.error("ENCRYPTION_KEY is required");
  process.exit(1);
}

function encrypt(text: string): string {
  const key = Buffer.from(ENCRYPTION_KEY!, "hex");
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag();
  return `${iv.toString("hex")}:${authTag.toString("hex")}:${encrypted}`;
}

function generateKeys() {
  const mnemonic = bip39.generateMnemonic(128);
  const seed = bip39.mnemonicToSeedSync(mnemonic);
  const privateKey = crypto.createHash("sha256").update(seed).digest("hex");
  return { seedPhrase: encrypt(mnemonic), privateKey: encrypt(privateKey) };
}

function generateAddress(): string {
  return `0x${crypto.randomBytes(20).toString("hex")}`;
}

const PRESET_TOKENS = [
  { name: "Bitcoin", symbol: "BTC", icon: "bitcoin", price: 97500, change24h: 2.4, color: "orange" },
  { name: "Ethereum", symbol: "ETH", icon: "ethereum", price: 3450, change24h: -1.2, color: "blue" },
  { name: "Solana", symbol: "SOL", icon: "zap", price: 178, change24h: 5.1, color: "purple" },
  { name: "Tether", symbol: "USDT", icon: "dollar-sign", price: 1.0, change24h: 0.01, color: "green" },
  { name: "Avalanche", symbol: "AVAX", icon: "mountain", price: 35.5, change24h: -3.2, color: "red" },
  { name: "Chainlink", symbol: "LINK", icon: "link", price: 14.2, change24h: 1.8, color: "blue" },
  { name: "USD Coin", symbol: "USDC", icon: "circle-dollar-sign", price: 1.0, change24h: 0.0, color: "blue" },
  { name: "Dai", symbol: "DAI", icon: "hexagon", price: 1.0, change24h: -0.01, color: "yellow" },
];

async function seed() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(MONGODB_URI!);
  console.log("Connected.");

  const db = mongoose.connection.db!;

  console.log("Dropping existing collections...");
  const collections = await db.listCollections().toArray();
  for (const col of collections) {
    await db.dropCollection(col.name);
  }

  const User = mongoose.model(
    "User",
    new mongoose.Schema({
      email: String,
      password: String,
      role: String,
      firstName: String,
      lastName: String,
      isActive: Boolean,
      lastLogin: Date,
    }, { timestamps: true })
  );

  const Wallet = mongoose.model(
    "Wallet",
    new mongoose.Schema({
      userId: mongoose.Schema.Types.ObjectId,
      name: String,
      address: String,
      color: String,
    }, { timestamps: true })
  );

  const Token = mongoose.model(
    "Token",
    new mongoose.Schema({
      walletId: mongoose.Schema.Types.ObjectId,
      userId: mongoose.Schema.Types.ObjectId,
      name: String,
      symbol: String,
      icon: String,
      price: Number,
      change24h: Number,
      balance: Number,
      color: String,
      isCustom: Boolean,
      totalSupply: Number,
      description: String,
      seedPhrase: String,
      privateKey: String,
    }, { timestamps: true })
  );

  const Transaction = mongoose.model(
    "Transaction",
    new mongoose.Schema({
      userId: mongoose.Schema.Types.ObjectId,
      walletId: mongoose.Schema.Types.ObjectId,
      type: String,
      status: String,
      token: String,
      tokenSymbol: String,
      amount: Number,
      value: Number,
      address: String,
      tokenId: mongoose.Schema.Types.ObjectId,
      fromTokenId: mongoose.Schema.Types.ObjectId,
      toTokenId: mongoose.Schema.Types.ObjectId,
      toAmount: Number,
      fiatAmount: Number,
      tokenData: mongoose.Schema.Types.Mixed,
      transferId: String,
      counterpartTxId: mongoose.Schema.Types.ObjectId,
      isInternal: Boolean,
      reviewedBy: mongoose.Schema.Types.ObjectId,
      reviewedAt: Date,
    }, { timestamps: true })
  );

  const RefreshToken = mongoose.model(
    "RefreshToken",
    new mongoose.Schema({
      userId: mongoose.Schema.Types.ObjectId,
      tokenHash: String,
      expiresAt: Date,
    }, { timestamps: true })
  );

  console.log("Creating admin user...");
  const adminHash = await bcrypt.hash(ADMIN_PASSWORD, 12);
  const admin = await User.create({
    email: ADMIN_EMAIL,
    password: adminHash,
    role: "admin",
    firstName: "Admin",
    lastName: "User",
    isActive: true,
  });
  console.log(`  Admin: ${ADMIN_EMAIL}`);

  console.log("Creating demo user...");
  const demoHash = await bcrypt.hash("Demo1234!", 12);
  const demoUser = await User.create({
    email: "demo@nexuswallet.com",
    password: demoHash,
    role: "user",
    firstName: "Demo",
    lastName: "User",
    isActive: true,
  });

  const walletConfigs = [
    { name: "Main Wallet", color: "blue", balances: { BTC: 1.245, ETH: 12.5, SOL: 45.8, USDT: 5000 } },
    { name: "Trading", color: "green", balances: { BTC: 0.5, ETH: 8.2, AVAX: 150, LINK: 500 } },
    { name: "Savings", color: "purple", balances: { USDC: 10000, DAI: 5000, ETH: 3.0 } },
  ];

  const allTokenIds: Record<string, mongoose.Types.ObjectId> = {};

  for (const wc of walletConfigs) {
    console.log(`  Creating wallet: ${wc.name}`);
    const wallet = await Wallet.create({
      userId: demoUser._id,
      name: wc.name,
      address: generateAddress(),
      color: wc.color,
    });

    for (const preset of PRESET_TOKENS) {
      const keys = generateKeys();
      const balance = wc.balances[preset.symbol as keyof typeof wc.balances] || 0;
      const token = await Token.create({
        walletId: wallet._id,
        userId: demoUser._id,
        ...preset,
        balance,
        isCustom: false,
        totalSupply: 0,
        description: "",
        ...keys,
      });
      allTokenIds[`${wc.name}:${preset.symbol}`] = token._id as mongoose.Types.ObjectId;
    }
  }

  console.log("Creating sample transactions...");
  const mainBtcId = allTokenIds["Main Wallet:BTC"];
  const mainEthId = allTokenIds["Main Wallet:ETH"];
  const tradingBtcId = allTokenIds["Trading:BTC"];

  await Transaction.create([
    {
      userId: demoUser._id,
      walletId: (await Wallet.findOne({ name: "Main Wallet" }))!._id,
      type: "send",
      status: "completed",
      token: "Bitcoin",
      tokenSymbol: "BTC",
      amount: 0.05,
      value: 4875,
      address: "0x742d35Cc6634C0532925a3b844Bc9e7595f2bD28",
      tokenId: mainBtcId,
      isInternal: false,
      reviewedBy: admin._id,
      reviewedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      userId: demoUser._id,
      walletId: (await Wallet.findOne({ name: "Main Wallet" }))!._id,
      type: "receive",
      status: "completed",
      token: "Ethereum",
      tokenSymbol: "ETH",
      amount: 2.0,
      value: 6900,
      address: "Purchase",
      tokenId: mainEthId,
      fiatAmount: 6900,
      isInternal: false,
      reviewedBy: admin._id,
      reviewedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
    {
      userId: demoUser._id,
      walletId: (await Wallet.findOne({ name: "Main Wallet" }))!._id,
      type: "send",
      status: "pending",
      token: "Bitcoin",
      tokenSymbol: "BTC",
      amount: 0.1,
      value: 9750,
      address: "0xabc123def456789abc123def456789abc123def4",
      tokenId: mainBtcId,
      isInternal: false,
    },
    {
      userId: demoUser._id,
      walletId: (await Wallet.findOne({ name: "Trading" }))!._id,
      type: "sell",
      status: "pending",
      token: "Bitcoin",
      tokenSymbol: "BTC",
      amount: 0.25,
      value: 24375,
      address: "Sale",
      tokenId: tradingBtcId,
      fiatAmount: 24375,
      isInternal: false,
    },
  ]);

  console.log("\nSeed complete!");
  console.log("---");
  console.log(`Admin login: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  console.log("Demo login:  demo@nexuswallet.com / Demo1234!");
  console.log("---");

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
