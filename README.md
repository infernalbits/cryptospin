# DeFi Slots 🎰

A decentralized slot machine game where users can spin the reels using Ethereum (ETH) on a local Anvil testnet (or deployed to an EVM-compatible chain). The game features a verifiable on-chain randomness mechanism (pseudo-random for demo purposes) and allows liquidity providers to "Bankroll the House" and earn fees.

## 🚀 Tech Stack

* **Frontend:** React, TypeScript, Tailwind CSS, Shadcn UI
* **Smart Contracts:** Solidity, Foundry (Forge/Anvil)
* **Blockchain Interaction:** Ethers.js
* **Backend/Server:** Express (for serving the frontend in this repo structure)

## 📂 Project Structure

This repository contains both the web application and the smart contracts.

```text
defi-slots/
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
