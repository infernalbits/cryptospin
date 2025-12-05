DeFi Slots 🎰A decentralized slot machine game where users can spin the reels using Ethereum (ETH) on a local Anvil testnet (or deployed to an EVM-compatible chain). The game features a verifiable on-chain randomness mechanism (pseudo-random for demo purposes) and allows liquidity providers to "Bankroll the House" and earn fees.🚀 Tech StackFrontend: React, TypeScript, Tailwind CSS, Shadcn UISmart Contracts: Solidity, Foundry (Forge/Anvil)Blockchain Interaction: Ethers.jsBackend/Server: Express (for serving the frontend in this repo structure)📂 Project StructureThis repository contains both the web application and the smart contracts.defi-slots/
├── client/                 # React Frontend
│   └── src/
│       ├── components/     # UI Components (Slot Machine, Wallet, etc.)
│       ├── hooks/          # Custom Hooks (useWeb3, useGameState)
│       └── lib/            # Utilities & ABI
├── contracts/              # Smart Contract Environment (Foundry)
│   ├── src/                # Solidity Contracts (DeFiSlots.sol)
│   ├── test/               # Solidity Tests
│   └── script/             # Deployment Scripts
└── server/                 # Express Server (serves client)
🛠️ PrerequisitesNode.js (v18+)Foundry (Forge, Anvil, Cast) - Installation GuideMetaMask Browser Extension⚡ Quick Start1. Install DependenciesInstall the frontend/server dependencies:npm install
2. Start Local BlockchainOpen a terminal and start Anvil. This creates a local Ethereum node with pre-funded accounts.anvil
Keep this terminal running!3. Deploy Smart ContractOpen a new terminal window. Navigate to the contracts folder and deploy:cd contracts

# Replace <PRIVATE_KEY> with one of the private keys printed by Anvil (Account 0)
forge script script/Deploy.s.sol --rpc-url [http://127.0.0.1:8545](http://127.0.0.1:8545) --broadcast --private-key <PRIVATE_KEY>
Important:Copy the Contract Address from the output.Update client/src/lib/abi.ts:Paste the new address into CONTRACT_ADDRESS.(Optional) Update CONTRACT_ABI if you modified the Solidity code (copy from contracts/out/DeFiSlots.sol/DeFiSlots.json).4. Fund the House (Bankroll)The contract starts with 0 ETH, so it cannot pay out winners. You must deposit initial liquidity.# Still in contracts/ folder
# Replace <PRIVATE_KEY> and <CONTRACT_ADDRESS>
cast send <CONTRACT_ADDRESS> "depositHouse()" --value 100ether --private-key <PRIVATE_KEY> --rpc-url [http://127.0.0.1:8545](http://127.0.0.1:8545)
5. Start the FrontendReturn to the root directory and start the development server:cd ..
npm run dev
Open http://localhost:5000 (or the port shown in your terminal).🎮 How to PlayConnect Wallet: Click the "Connect Wallet" button.Network: Ensure MetaMask is connected to Localhost 8545.The app attempts to switch automatically.Chain ID: 31337Get Funds: Import one of the private keys from your Anvil terminal into MetaMask to access 10,000 test ETH.Spin: Select your bet amount and click SPIN!Confirm: Confirm the transaction in MetaMask.🧪 Running TestsTo run the Solidity smart contract tests:cd contracts
forge test
📜 LicenseMIT
