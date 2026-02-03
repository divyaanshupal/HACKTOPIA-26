const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying LogStorage...");

  const LogStorage = await hre.ethers.getContractFactory("LogStorage");
  const logStorage = await LogStorage.deploy();

  await logStorage.waitForDeployment();

  console.log("✅ LogStorage deployed to:", await logStorage.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
