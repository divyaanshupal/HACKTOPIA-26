const { ethers } = require("ethers");
require("dotenv").config();

const ABI = [
  "function addLog(bytes32 logHash)",
  "event LogSaved(bytes32 indexed logHash, uint256 timestamp)"
];

const provider = new ethers.JsonRpcProvider(process.env.POLYGON_AMOY_RPC);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const contract = new ethers.Contract(
  process.env.CONTRACT_ADDRESS,
  ABI,
  wallet
);

async function saveLogOnChain(hash) {
  const tx = await contract.addLog(hash);
  await tx.wait();
  return tx.hash;
}

async function verifyLogOnChain(hash) {
  const filter = contract.filters.LogSaved(hash);
  const events = await contract.queryFilter(filter);
  return events.length > 0;
}

module.exports = { saveLogOnChain, verifyLogOnChain };
