require('dotenv').config();
const { ethers } = require("ethers");

async function test() {
    console.log("Testing connection...");
    const provider = new ethers.JsonRpcProvider(process.env.POLYGON_AMOY_RPC);
    try {
        const block = await provider.getBlockNumber();
        console.log("Current block:", block);

        const ABI = [
            "event LogSaved(bytes32 indexed logHash, uint256 timestamp)"
        ];
        const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, ABI, provider);
        const hash = "0x0000000000000000000000000000000000000000000000000000000000000000";
        const filter = contract.filters.LogSaved(hash);
        console.log("Querying filter...");
        const events = await contract.queryFilter(filter);
        console.log("Events found:", events.length);
    } catch (err) {
        console.error("Error:", err);
    }
}

test();
