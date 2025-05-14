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

### **Component Overview**
1. **Frontend (Next.js + Tailwind CSS)**
   - User file upload interface
   - Wallet connection (MetaMask/exSat)
   - Local file encryption via Web Crypto API
   - Transaction status display

2. **Backend Services**
   - Pinata IPFS API integration
   - CID management and retrieval
   - Smart contract interaction layer

3. **Decentralized Storage**
   - IPFS network via Pinata
   - Global content distribution
   - Encrypted data redundancy

4. **Blockchain Layer**
   - ExSat Testnet EVM
   - Smart contract for CID anchoring
   - Hybrid consensus verification

```
flowchart TD
    A[User Browser] --> B{Next.js Frontend}
    B -->|1. Encrypt File| C[Web Crypto API]
    B -->|2. Connect Wallet| D[MetaMask/exSat]
    C -->|3. Upload Encrypted Data| E[Pinata IPFS]
    E -->|4. Return CID| B
    B -->|5. Anchor CID| F[ExSat Smart Contract]
    F -->|6. Store CID + Timestamp| G[ExSat Blockchain]
    G -->|7. Verification Query| H[Block Explorer]
    E -->|8. Retrieve Encrypted File| I[Authorized User]
    I -->|9. Decrypt Locally| J[Original File]
```

### **Key Data Flow**
1. 🔒 **Client-Side Encryption**  
   Files encrypted before leaving browser using AES-256-GCM
2. 📦 **IPFS Storage**  
   Encrypted content stored across Pinata's global IPFS nodes
3. ⛓ **Blockchain Anchoring**  
   CID + metadata recorded on ExSat Testnet
4. 🔍 **Verification**  
   Publicly verifiable proof via blockchain explorer
5. 🔓 **Decentralized Retrieval**  
   Encrypted file fetched directly from IPFS network

### **Security Architecture**
```
graph LR
    A[User Data] --> B[Client Encryption]
    B --> C[IPFS Storage]
    C --> D[CID Anchoring]
    D --> E[Blockchain Proof]
    E --> F[Immutable Verification]
    style B fill:#f9f,stroke:#333
    style D fill:#bbf,stroke:#333
```


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
