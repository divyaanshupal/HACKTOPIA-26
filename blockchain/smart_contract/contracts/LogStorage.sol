// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract LogStorage {
    event LogSaved(bytes32 indexed logHash, uint256 timestamp);

    function addLog(bytes32 logHash) external {
        emit LogSaved(logHash, block.timestamp);
    }
}
