require("dotenv").config();
const { ethers } = require("ethers");

async function main() {
  const rpcUrl = process.env.ALCHEMY_RPC_URL;

  if (!rpcUrl) {
    throw new Error("❌ Missing ALCHEMY_RPC_URL in .env");
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl);

  // ✅ Step 1: Test normal connection
  const blockNumber = await provider.getBlockNumber();
  console.log("✅ Connected to Sepolia. Current block:", blockNumber);

  // ✅ Step 2: Test bundler (IMPORTANT)
  const entryPoints = await provider.send("eth_supportedEntryPoints", []);
  console.log("🔥 Supported EntryPoints:", entryPoints);
}

main().catch((err) => {
  console.error("❌ Error:", err);
});