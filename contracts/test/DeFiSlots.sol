// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../src/DeFiSlots.sol";

contract DeFiSlotsTest is Test {
    DeFiSlots public slots;
    address public user = address(1);
    address public liquidityProvider = address(2);

    function setUp() public {
        slots = new DeFiSlots();
        vm.deal(user, 10 ether);
        vm.deal(liquidityProvider, 100 ether);
    }

    function testInitialState() public {
        assertEq(slots.totalShares(), 0);
        assertEq(slots.accumulatedFees(), 0);
    }

    function testDepositHouse() public {
        vm.prank(liquidityProvider);
        slots.depositHouse{value: 10 ether}();

        // FIX: The function getHouseStats returns 3 values.
        // We add the 3rd variable (fees) to match the return signature.
        (uint256 poolBalance, uint256 totalShares, uint256 fees) = slots.getHouseStats();

        assertEq(poolBalance, 10 ether);
        assertEq(totalShares, 10 ether); // 1:1 ratio for first depositor
        assertEq(fees, 0);
    }

    function testSpinMechanics() public {
        // 1. Setup liquidity
        vm.prank(liquidityProvider);
        slots.depositHouse{value: 50 ether}();

        // 2. User plays
        vm.prank(user);
        slots.spin{value: 1 ether}();

        // 3. Check stats (expect fees to increase)
        // FIX: Handle 3 return values here as well
        (uint256 poolBalance, uint256 totalShares, uint256 fees) = slots.getHouseStats();
        
        // Pool balance changes based on win/loss, but fees should definitely be 5% of wager
        assertEq(fees, 0.05 ether); // 5% of 1 ether
        assertGt(totalShares, 0);
        
        // Pool balance should match contract balance minus fees
        assertEq(poolBalance, address(slots).balance - fees);
    }

    function testRevertLowBet() public {
        vm.prank(user);
        vm.expectRevert(DeFiSlots.BetTooLow.selector);
        slots.spin{value: 0.0001 ether}();
    }
}
