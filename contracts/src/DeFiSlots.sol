// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract DeFiSlots {
    uint256 public constant MIN_BET = 0.001 ether;
    uint256 public constant MAX_BET_PERCENTAGE = 5; // Max bet is 5% of pool
    uint256 public constant HOUSE_EDGE_PERCENT = 5; // 5% house edge

    uint256 public totalShares;
    uint256 public accumulatedFees;
    
    mapping(address => uint256) public shares;

    event Spin(address indexed player, uint256 bet, uint256 outcome, uint256 payout);
    event HouseDeposit(address indexed provider, uint256 amount, uint256 sharesMinted);
    event HouseWithdraw(address indexed provider, uint256 amount, uint256 sharesBurned);

    error InsufficientPoolBalance();
    error BetTooHigh();
    error BetTooLow();
    error TransferFailed();

    // Allows users to become the "House" by depositing ETH
    function depositHouse() external payable {
        require(msg.value > 0, "Must deposit ETH");

        uint256 currentPool = address(this).balance - msg.value - accumulatedFees;
        uint256 sharesToMint;

        if (totalShares == 0 || currentPool == 0) {
            sharesToMint = msg.value;
        } else {
            sharesToMint = (msg.value * totalShares) / currentPool;
        }

        shares[msg.sender] += sharesToMint;
        totalShares += sharesToMint;

        emit HouseDeposit(msg.sender, msg.value, sharesToMint);
    }

    // Play the slots
    function spin() external payable {
        if (msg.value < MIN_BET) revert BetTooLow();
        
        // Calculate max bet based on available pool (excluding fees)
        uint256 availablePool = address(this).balance - msg.value - accumulatedFees;
        uint256 maxBet = (availablePool * MAX_BET_PERCENTAGE) / 100;
        
        if (msg.value > maxBet) revert BetTooHigh();

        // 5% House Edge stays in the contract but is tracked separately as fees
        uint256 fee = (msg.value * HOUSE_EDGE_PERCENT) / 100;
        uint256 wager = msg.value - fee;
        accumulatedFees += fee;

        // Simple pseudo-randomness (Don't use in production with real money without Chainlink VRF)
        uint256 outcome = uint256(keccak256(abi.encodePacked(block.timestamp, msg.sender, block.prevrandao))) % 100;

        uint256 payout = 0;
        
        // Winning logic:
        // 0-45: Lose (46% chance)
        // 46-80: 1.5x (35% chance)
        // 81-95: 2x (15% chance)
        // 96-99: 5x (4% chance)
        
        if (outcome > 95) {
            payout = wager * 5;
        } else if (outcome > 80) {
            payout = wager * 2;
        } else if (outcome > 45) {
            payout = (wager * 150) / 100; // 1.5x
        }

        if (payout > 0) {
            // Check if we can pay
            if (payout > address(this).balance) {
                payout = address(this).balance;
            }
            (bool success, ) = payable(msg.sender).call{value: payout}("");
            if (!success) revert TransferFailed();
        }

        emit Spin(msg.sender, msg.value, outcome, payout);
    }

    // Helper to view stats
    // Returns 3 values: Pool Balance, Total Shares, Accumulated Fees
    function getHouseStats() external view returns (uint256, uint256, uint256) {
        uint256 poolBalance = address(this).balance > accumulatedFees ? address(this).balance - accumulatedFees : 0;
        return (poolBalance, totalShares, accumulatedFees);
    }
}
