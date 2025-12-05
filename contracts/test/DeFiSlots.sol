// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../src/DeFiSlots.sol";

contract DeFiSlotsTest is Test {
    DeFiSlots slots;
    
    address owner = address(0x1);
    address player = address(0x2);
    address nonOwner = address(0x3);

    // Events to check against
    event Spin(address indexed player, uint256 bet, uint256[3] result, uint256 payout);
    event DepositLiquidity(address indexed provider, uint256 amount, uint256 sharesMinted);

    function setUp() public {
        // 1. Setup accounts with ETH
        vm.deal(owner, 100 ether);
        vm.deal(player, 10 ether);
        vm.deal(nonOwner, 10 ether);

        // 2. Deploy contract as owner
        vm.startPrank(owner);
        slots = new DeFiSlots();
        vm.stopPrank();
    }

    function testInitialState() public {
        assertEq(slots.owner(), owner);
        assertEq(slots.minBet(), 0.001 ether);
    }

    // --- Liquidity Tests ---

    function testDepositLiquidityAsOwner() public {
        vm.startPrank(owner);
        
        uint256 depositAmount = 10 ether;
        
        vm.expectEmit(true, false, false, true);
        emit DepositLiquidity(owner, depositAmount, depositAmount); // 1:1 shares for first deposit
        
        slots.depositLiquidity{value: depositAmount}();

        (uint256 poolBalance, uint256 totalShares) = slots.getHouseStats();
        
        assertEq(poolBalance, depositAmount);
        assertEq(totalShares, depositAmount);
        assertEq(slots.shares(owner), depositAmount);
        
        vm.stopPrank();
    }

    function testRevertDepositLiquidityAsNonOwner() public {
        vm.startPrank(nonOwner);
        // Should fail because of onlyOwner modifier
        vm.expectRevert("Not owner");
        slots.depositLiquidity{value: 1 ether}();
        vm.stopPrank();
    }

    function testWithdrawLiquidity() public {
        // 1. Setup: Deposit first
        vm.startPrank(owner);
        slots.depositLiquidity{value: 10 ether}();
        
        uint256 initialBalance = owner.balance;
        
        // 2. Withdraw half
        slots.withdrawLiquidity(5 ether); // Withdraw 5 shares
        
        // 3. Verify return
        assertEq(owner.balance, initialBalance + 5 ether);
        assertEq(slots.totalShares(), 5 ether);
        
        vm.stopPrank();
    }

    // --- Gameplay Tests ---

    function testSpinFailureNoLiquidity() public {
        vm.startPrank(player);
        // Should fail because House has 0 balance
        vm.expectRevert("Insufficient House Liquidity");
        slots.spin{value: 0.01 ether}();
        vm.stopPrank();
    }

    function testSpinMechanics() public {
        // 1. Fund the house first
        vm.prank(owner);
        slots.depositLiquidity{value: 50 ether}();

        // 2. Player spins
        vm.startPrank(player);
        uint256 bet = 0.01 ether;
        
        // We can't easily predict the random result in a unit test without mocking,
        // but we can ensure the state changes and events fire.
        
        // Record balance before
        uint256 balanceBefore = player.balance;
        
        // Helper to watch for the Spin event
        vm.recordLogs();
        slots.spin{value: bet}();
        
        // Check if event was emitted
        Vm.Log[] memory entries = vm.getRecordedLogs();
        assertEq(entries.length, 1);
        assertEq(entries[0].topics[0], keccak256("Spin(address,uint256,uint256[3],uint256)"));
        
        // Verify bet was deducted (at minimum)
        // Note: If they won, balance might be higher, if lost, lower.
        // But the contract interaction succeeded.
        assertTrue(player.balance != balanceBefore);
        
        vm.stopPrank();
    }
    
    // --- Fuzz Testing ---
    
    // Fuzz test to ensure the contract handles various bet sizes correctly
    function testFuzzSpin(uint96 betAmount) public {
        // Bound bet to allowed limits
        uint256 bet = uint256(betAmount);
        vm.assume(bet >= 0.001 ether && bet <= 0.1 ether);

        // Fund house
        vm.prank(owner);
        slots.depositLiquidity{value: 50 ether}();

        vm.startPrank(player);
        vm.deal(player, bet + 1 ether); // Ensure player has enough
        
        slots.spin{value: bet}();
        vm.stopPrank();
    }
}
