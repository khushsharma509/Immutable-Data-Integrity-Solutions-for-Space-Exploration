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


Add to `.env`:
Pinata Configuration
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_KEY=your_pinata_secret_key

ExSat Testnet
EXSAT_RPC_URL=https://evm-tst3.exsat.network
PRIVATE_KEY=your_metamask_private_key
CONTRACT_ADDRESS=0xD8ab45e342b310F3Ee9cD418e2fB33053fF076eE


### Running the Application
1. Start development server:
npm run dev


2. Access the application at:
http://localhost:3000


## 🌐 System Architecture
1. User Interface (Frontend)
Built with Next.js and Tailwind CSS

Provides a secure, user-friendly web interface for:

Uploading files

Encrypting files locally (AES-256)

Connecting a crypto wallet (MetaMask/exSat)

Viewing and verifying stored data

2. Client-Side Encryption
Files are encrypted in the browser using the Web Crypto API before leaving the user’s device.

Only the encrypted data is uploaded, ensuring zero-knowledge for the backend and storage layers.

3. Decentralized Storage Layer (IPFS via Pinata)
Encrypted files are uploaded to IPFS through Pinata’s API.

IPFS returns a Content Identifier (CID)-a unique hash representing the encrypted file.

Data is redundantly stored and distributed across the global IPFS network, ensuring high availability and censorship resistance.

4. Blockchain Anchoring Layer (ExSat Testnet)
The CID is anchored on the ExSat blockchain by calling a smart contract via Ethers.js.

The smart contract records:

The CID

Timestamp

User’s wallet address

Optionally, Bitcoin block hash (if using ExSat’s hybrid consensus features)

This provides immutable, tamper-proof, and time-stamped proof of data existence and integrity.

5. Verification & Retrieval
Anyone can:

Query the smart contract for a CID to verify its existence, timestamp, and owner

Retrieve the encrypted file from IPFS using the CID

Decrypt the file locally with the correct key and IV

6. Security Features
End-to-end encryption: Only users with the key can decrypt the data.

No single point of failure: Data and proof are distributed and decentralized.

Auditability: All anchoring and access events are publicly verifiable on-chain.


+-------------------+      +------------------+      +-----------------------+      +--------------------+
|   User Browser    |      |     Backend      |      |        IPFS           |      |    ExSat Blockchain|
| (Next.js, Tailwind|<---->| (API for Pinata) |<---->| (Pinata Gateway/API)  |<---->| (Smart Contract)   |
|   Ethers.js)      |      |                  |      |                       |      |                    |
+-------------------+      +------------------+      +-----------------------+      +--------------------+
        |                          |                          |                          |
        |--[1. Encrypt File]-------|                          |                          |
        |--[2. Upload to Pinata/IPFS]------------------------>|                          |
        |                          |<-----[3. Return CID]-----|                          |
        |--[4. Anchor CID on-chain]-------------------------->|------------------------->|
        |                          |                          |                          |
        |<--[5. Query/Verify CID]---------------------------->|<------------------------>|
        |--[6. Retrieve & Decrypt]--|                         |                          |



## 🔒 Smart Contract Interaction
Deploy your own contract to ExSat Testnet:
npx hardhat run scripts/deploy.js --network exsat



Verify contract:
npx hardhat verify --network exsat <CONTRACT_ADDRESS>


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
