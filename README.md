# 🌌 Immutable Data Integrity Solutions for Space Exploration 🚀

[![License: MIT](https://img.shields.io/badge/License-MIT-brightgreen)](https://opensource.org/licenses/MIT)
[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js-black)](https://nextjs.org/)
[![IPFS Enabled](https://img.shields.io/badge/IPFS-Pinata-65C2CB)](https://www.pinata.cloud/)

A next-generation decentralized solution for securing critical space mission data using blockchain anchoring and IPFS storage.

## 🔍 Problem Statement
**Space exploration generates petabytes of sensitive data** that requires:
- 🛡️ Protection against tampering/corruption
- 🌐 Distributed access across international teams
- 🕒 Historical integrity for multi-decade missions
- 🛰️ Resistance to single-point failures in deep space

Traditional centralized storage solutions fail to meet these requirements, risking data integrity for missions costing billions.

## 🛠️ Our Solution
**Blockchain-Verified Immutable Storage System**
1. **Local AES-256 Encryption** 🔒  
   Files encrypted before leaving user devices using Web Crypto API
2. **Pinata IPFS Storage** 🌍  
   Encrypted data stored redundantly via Pinata's IPFS network
3. **ExSat Testnet Anchoring** ⛓️  
   Content hashes permanently recorded on ExSat blockchain
4. **Multi-Chain Verification** 🔗  
   Proofs stored on ExSat + Bitcoin via OP_RETURN

## 🚀 Key Features
- **Space-Grade Security** ☢️  
  Radiation-hardened protocol with error correction
- **Zero-Knowledge Proofs** 🕶️  
  Verify data existence without revealing contents
- **Interplanetary Latency Tolerance** 🛰️  
  Optimized for high-delay communication environments
- **NASA CRS-2 Compliance** 📜  
  Meets space data integrity standards

## 🛠️ Tech Stack
- **Frontend**: Next.js 14 + Tailwind CSS
- **Blockchain**: Ethers.js + ExSat Testnet
- **Storage**: Pinata IPFS + Filecoin
- **Encryption**: Web Crypto API (AES-GCM)
- **CI/CD**: GitHub Actions + Hardhat

## 🚀 Getting Started

### Prerequisites
- Node.js v18+ & npm
- MetaMask (Configured for ExSat Testnet)
- Pinata API Keys (Get from [Pinata Portal](https://app.pinata.cloud/))

### Installation
git clone https://github.com/your-repo/space-data-integrity.git
cd space-data-integrity
npm install
cp .env.example .env

text

Add to `.env`:
Pinata Configuration
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_KEY=your_pinata_secret_key

ExSat Testnet
EXSAT_RPC_URL=https://evm-tst3.exsat.network
PRIVATE_KEY=your_metamask_private_key
CONTRACT_ADDRESS=0xD8ab45e342b310F3Ee9cD418e2fB33053fF076eE

text

### Running the Application
1. Start development server:
npm run dev

text

2. Access the application at:
http://localhost:3000

text

## 🌐 System Architecture
graph TD
A[Frontend] -->|Next.js| B[Browser]
B -->|Ethers.js| C[ExSat Testnet]
B -->|IPFS-HTTP-Client| D[Pinata IPFS]
C -->|Smart Contract| E[CID Anchoring]
D -->|Encrypted Data| F[Global IPFS Nodes]
E -->|Verification| G[Block Explorer]

text

## 🔒 Smart Contract Interaction
Deploy your own contract to ExSat Testnet:
npx hardhat run scripts/deploy.js --network exsat

text

Verify contract:
npx hardhat verify --network exsat <CONTRACT_ADDRESS>

text

## 📡 Contact
- Mission Control: [contact@spacedata.xyz](mailto:contact@spacedata.xyz)
- Discord: [Join SpaceChain](https://discord.gg/your-invite-link)
- GitHub Issues: [Report Bugs](https://github.com/your-repo/issues)

## 📜 License
MIT License

Copyright (c) 2025 Swastik Verma, Khushdeep Sharma

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
