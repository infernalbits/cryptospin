// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "src/DeFiSlots.sol";

contract Deploy is Script {
    function run() external {
        // This looks for PRIVATE_KEY in .env, or uses the default Foundry sender if not present
        // For local anvil testing, we often pass the private key directly in the command line
        vm.startBroadcast();

        DeFiSlots slots = new DeFiSlots();
        
        console.log("DeFi Slots deployed to:", address(slots));

        vm.stopBroadcast();
    }
}
