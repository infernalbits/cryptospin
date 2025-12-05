// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title DeFiSlots
 * @dev A decentralized slots game with a Liquidity Pool backend and House Edge.
 * WARNING: This contract uses block.prevrandao/timestamp for randomness.
 * For Mainnet production, replace the _random() function with Chainlink VRF.
 */
contract DeFiSlots {
    
    // --- State Variables ---

    address public owner;
    uint256 public minBet;
    uint256 public maxBet;
    uint256 private nonce;

    // House Edge Settings
    uint256 public houseEdgeBP = 500; // 500 Basis Points = 5% fee
    uint256 public accumulatedFees;   // Fees collected, ready for owner to claim

    // The House Liquidity Pool
    uint256 public totalShares;
    mapping(address => uint256) public shares;

    // Events
    event Spin(address indexed player, uint256 bet, uint256[3] result, uint256 payout, uint256 feeTaken);
    event DepositLiquidity(address indexed provider, uint256 amount, uint256 sharesMinted);
    event WithdrawLiquidity(address indexed provider, uint256 amount, uint256 sharesBurned);
    event FeesClaimed(address indexed owner, uint256 amount);

    // Reentrancy Guard
    bool private locked;

    modifier noReentrant() {
        require(!locked, "Reentrant call");
        locked = true;
        _;
        locked = false;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
        minBet = 0.001 ether;
        maxBet = 0.1 ether;
    }

    // --- Core Game Logic ---

    /**
     * @dev The main function to play the game.
     * Player sends ETH, contract spins 3 reels.
     */
    function spin() external payable noReentrant {
        require(msg.value >= minBet, "Bet below minimum");
        require(msg.value <= maxBet, "Bet exceeds maximum");
        
        // 1. Take the House Edge (Fee) immediately
        // This ensures the house makes money on every spin, regardless of outcome.
        uint256 fee = (msg.value * houseEdgeBP) / 10000;
        accumulatedFees += fee;

        // The "Game" only risks the Liquidity Pool funds, not the fees.
        // We check if the Pool (balance - fees) can cover a jackpot.
        uint256 poolBalance = address(this).balance - accumulatedFees;
        require(poolBalance >= msg.value * 50, "Insufficient House Liquidity");

        // 2. Generate Random Numbers
        uint256[3] memory result;
        uint256 seed = _random();
        
        result[0] = (seed % 10);
        result[1] = ((seed / 10) % 10);
        result[2] = ((seed / 100) % 10);

        // 3. Calculate Payout
        uint256 multiplier = _calculateMultiplier(result);
        uint256 payout = 0;

        // 4. Handle Win/Loss
        if (multiplier > 0) {
            payout = msg.value * multiplier;
            
            // Cap payout at 50% of the active pool (protecting the bankroll)
            uint256 maxPayout = poolBalance / 2; 
            if (payout > maxPayout) {
                payout = maxPayout;
            }

            // Pay the winner using .call (safer than transfer)
            (bool success, ) = payable(msg.sender).call{value: payout}("");
            require(success, "Payout transfer failed");
        }
        
        emit Spin(msg.sender, msg.value, result, payout, fee);
    }

    function _calculateMultiplier(uint256[3] memory reels) internal pure returns (uint256) {
        if (reels[0] == 7 && reels[1] == 7 && reels[2] == 7) return 50;
        if (reels[0] == reels[1] && reels[1] == reels[2]) return 20;
        if (reels[0] == 7 && reels[1] == 7) return 5;
        if (reels[0] == reels[1]) return 2;
        return 0;
    }

    function _random() internal returns (uint256) {
        nonce++;
        return uint256(keccak256(abi.encodePacked(
            block.timestamp, 
            block.prevrandao, 
            msg.sender, 
            nonce
        )));
    }

    // --- Liquidity Pool (The House) ---

    /**
     * @dev Be the House! Only Owner can deposit.
     * Note: We exclude 'accumulatedFees' from share calculation logic.
     */
    function depositLiquidity() external payable onlyOwner noReentrant {
        require(msg.value > 0, "Must deposit ETH");

        uint256 sharesToMint;
        
        // Balance available for LP shares = Total Balance - Fees - Incoming Deposit
        uint256 netPoolBalance = address(this).balance - msg.value - accumulatedFees;

        if (totalShares == 0 || netPoolBalance == 0) {
            sharesToMint = msg.value;
        } else {
            sharesToMint = (msg.value * totalShares) / netPoolBalance;
        }

        shares[msg.sender] += sharesToMint;
        totalShares += sharesToMint;

        emit DepositLiquidity(msg.sender, msg.value, sharesToMint);
    }

    /**
     * @dev Withdraw House funds. Only Owner can withdraw.
     */
    function withdrawLiquidity(uint256 _shares) external onlyOwner noReentrant {
        require(shares[msg.sender] >= _shares, "Insufficient shares");
        require(_shares > 0, "Invalid share amount");

        uint256 netPoolBalance = address(this).balance - accumulatedFees;
        uint256 amountToWithdraw = (_shares * netPoolBalance) / totalShares;

        shares[msg.sender] -= _shares;
        totalShares -= _shares;

        // Pay the owner using .call (safer than transfer)
        (bool success, ) = payable(msg.sender).call{value: amountToWithdraw}("");
        require(success, "Withdraw transfer failed");

        emit WithdrawLiquidity(msg.sender, amountToWithdraw, _shares);
    }

    // --- Admin Functions ---

    /**
     * @dev Extract the House Edge fees without touching the LP pool.
     */
    function claimFees() external onlyOwner noReentrant {
        require(accumulatedFees > 0, "No fees to claim");
        
        uint256 transferAmount = accumulatedFees;
        accumulatedFees = 0;

        (bool success, ) = payable(msg.sender).call{value: transferAmount}("");
        require(success, "Fee claim failed");

        emit FeesClaimed(msg.sender, transferAmount);
    }

    function setLimits(uint256 _min, uint256 _max, uint256 _houseEdgeBP) external onlyOwner {
        require(_houseEdgeBP <= 2000, "Fee too high (max 20%)");
        minBet = _min;
        maxBet = _max;
        houseEdgeBP = _houseEdgeBP;
    }

    function getHouseStats() external view returns (uint256 poolBalance, uint256 feesCollected, uint256 totalSharesSupply) {
        return (address(this).balance - accumulatedFees, accumulatedFees, totalShares);
    }
}
