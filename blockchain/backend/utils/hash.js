const { ethers } = require("ethers");

function generateHash(data) {
  const json = JSON.stringify(data);
  return ethers.keccak256(
    ethers.toUtf8Bytes(json)
  );
}

module.exports = { generateHash };
