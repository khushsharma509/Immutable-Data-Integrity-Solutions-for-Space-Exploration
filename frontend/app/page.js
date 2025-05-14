// pages/index.js
'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import NumberTypewriter from './components/NumberTypewriter';

import Image from 'next/image';


export default function SpaceBlockchainExplorer() {
  const [walletAddress, setWalletAddress] = useState('');
  const [isEncrypted, setIsEncrypted] = useState(false);

  // Mock blockchain connection
  const connectWallet = async () => {
    try {
      // Replace with actual wallet connection logic
      const mockAddress = '0x3f5...5eC';
      setWalletAddress(mockAddress);
      alert('Mock wallet connected! (Replace with actual connection)');
    } catch (error) {
      console.error('Wallet connection error:', error);
    }
  };



  return (
    <div className="cosmic-container">
      {/* Navigation */}


      {/* Hero Section */}
     <div className="hero-orbit mb-10 sm:mb-16 md:mb-24 lg:mb-32">
  <div className="stellar-overlay text-xl sm:text-2xl px-4 sm:px-8 md:px-16">
    <h1 className="text-4xl sm:text-5xl md:text-6xl mb-6 sm:mb-8 text-center">🌌 SpaceLedger-Anchored Space Data</h1>
    <h2 className="flex flex-col sm:flex-row items-center justify-center gap-2 mb-8 sm:mb-12 text-center text-2xl sm:text-3xl">
      Powered by
      <Image
        src="/assets/exsat-logo-removebg-preview.png"
        alt="exSat logo"
        width={35}
        height={35}
        className="object-contain"
      />
      exSat(Blockchain)
    </h2>
    <div className="encryption-controls flex flex-col sm:flex-row gap-4 justify-center mb-8">
      <Link
        href="/encrypt"
        className="px-6 py-3 sm:px-8 sm:py-4 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold shadow hover:scale-105 transition text-center"
      >
        🔒 Encrypt Transmission
      </Link>
      <Link
        href="/decrypt"
        className="px-6 py-3 sm:px-8 sm:py-4 rounded-2xl bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold shadow hover:scale-105 transition text-center"
      >
        🔓 Decrypt Archives
      </Link>
    </div>
    <div className="real-time-stats grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6 px-2 sm:px-4 max-w-full sm:max-w-4xl mx-auto">
      <div className="stat-card bg-slate-800/80 rounded-2xl p-4 sm:p-6 shadow-lg border border-slate-700/50 text-center">
        <h3 className="text-lg sm:text-xl font-semibold mb-2">🚀 Space Data Blocks</h3>
        <div className="text-2xl sm:text-3xl font-bold text-blue-400 h-10 sm:h-12 flex items-center justify-center">
          <NumberTypewriter number={1402921} />
        </div>
      </div>
      <div className="stat-card bg-slate-800/80 rounded-2xl p-4 sm:p-6 shadow-lg border border-slate-700/50 text-center">
        <h3 className="text-lg sm:text-xl font-semibold mb-2">🛰 Live Satellites</h3>
        <div className="text-2xl sm:text-3xl font-bold text-purple-400 h-10 sm:h-12 flex items-center justify-center">
          <NumberTypewriter number={2843} />
        </div>
      </div>
    </div>
  </div>
</div>


      {/* Website Facts Section */}
      <div className="max-w-6xl mx-auto my-16 px-4">
        <h2 className="text-4xl font-bold text-center mb-10 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent drop-shadow-lg">
          🚀 SpaceLedger Facts
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-slate-800/80 rounded-2xl p-6 flex flex-col items-center text-center shadow-lg border border-blue-700/30 hover:scale-105 hover:shadow-blue-500/30 transition-transform duration-300 space-y-4">
            <span className="text-4xl mb-2 animate-bounce">🔒</span>
            <h3 className="text-xl md:text-2xl font-semibold text-blue-300">Tamper-Proof Records</h3>
            <p className="text-blue-100 text-base md:text-lg leading-relaxed">Blockchain ensures space data cannot be altered or deleted, protecting against tampering.</p>
          </div>
          <div className="bg-slate-800/80 rounded-2xl p-6 flex flex-col items-center text-center shadow-lg border border-purple-700/30 hover:scale-105 hover:shadow-purple-500/30 transition-transform duration-300 space-y-4">
            <span className="text-4xl mb-2 animate-spin-slow">🛰️</span>
            <h3 className="text-xl md:text-2xl font-semibold text-purple-300">Enhanced Security</h3>
            <p className="text-purple-100 text-base md:text-lg leading-relaxed">Decentralized storage reduces risks of hacking, breaches, and system failures</p>
          </div>
          <div className="bg-slate-800/80 rounded-2xl p-6 flex flex-col items-center text-center shadow-lg border border-cyan-700/30 hover:scale-105 hover:shadow-cyan-500/30 transition-transform duration-300 space-y-4">
            <span className="text-4xl mb-2 animate-pulse">🌐</span>
            <h3 className="text-xl md:text-2xl font-semibold text-cyan-300">Decentralized Storage</h3>
            <p className="text-cyan-100 text-base md:text-lg leading-relaxed">Data is stored on IPFS and exSat, making it censorship-resistant and always available.</p>
          </div>
          <div className="bg-slate-800/80 rounded-2xl p-6 flex flex-col items-center text-center shadow-lg border border-pink-700/30 hover:scale-105 hover:shadow-pink-500/30 transition-transform duration-300 space-y-4">
            <span className="text-4xl mb-2 animate-float">✨</span>
            <h3 className="text-xl md:text-2xl font-semibold text-pink-300">Automated Integrity & Access</h3>
            <p className="text-pink-100 text-base md:text-lg leading-relaxed">Smart contracts automate data verification and restrict access to authorized users</p>
          </div>
        </div>
      </div>



      {/* Mission Grid */}
      <div className="mission-grid flex items-center justify-center gap-2 mb-18 text-center text-xl">
        <div className="mission-card blockchain-verified">
          <h3>🪐 Voyager Deep Space Data</h3>
          <div className="mission-meta">
            <span>🔗 Block #589432</span>
            <span>📡 24.5TB Secured</span>
          </div>
          <a href="https://scan-testnet.exsat.network/address/0xD8ab45e342b310F3Ee9cD418e2fB33053fF076eE">
            <button className="hologram-button">
              Access Quantum Stream 🌌
            </button>
          </a>
        </div>
      </div>

      <style jsx>{`
        :global(body) {
          margin: 0;
          background: linear-gradient(to bottom right, #0a0e2a, #1a1f4b);
          color: #e0e7ff;
          font-family: 'Space Mono', monospace;
        }

        .cosmic-container {
          min-height: 100vh;
          position: relative;
          overflow-x: hidden;
        }

        .space-nav {
          display: flex;
          justify-content: space-between;
          padding: 1.5rem;
          background: rgba(16, 24, 64, 0.8);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid #2563eb;
        }

        .nav-brand h1 {
          margin: 0;
          font-size: 1.8rem;
          background: linear-gradient(to right, #818cf8, #3b82f6);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .wallet-button {
          background: rgba(59, 130, 246, 0.2);
          border: 1px solid #3b82f6;
          color: #bfdbfe;
          padding: 0.8rem 1.5rem;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .wallet-button:hover {
          background: rgba(59, 130, 246, 0.4);
          transform: translateY(-2px);
        }

        .hero-orbit {
          position: relative;
          height: 70vh;
          overflow: hidden;
        }

        .stellar-overlay {
          position: relative;
          z-index: 2;
          padding: 4rem 2rem;
          text-align: center;
        }

        .encryption-controls {
          margin: 2rem 0;
          display: flex;
          gap: 1rem;
          justify-content: center;
        }

        .crypto-button {
          background: linear-gradient(45deg, #4f46e5, #6366f1);
          border: none;
          padding: 1rem 2rem;
          border-radius: 12px;
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
          border: 1px solid #818cf8;
        }

        .crypto-button.active {
          box-shadow: 0 0 15px #6366f1;
        }

        .crypto-button:hover {
          transform: scale(1.05);
          filter: brightness(1.1);
        }

        .real-time-stats {
          display: flex;
          justify-content: center;
          gap: 3rem;
          margin-top: 4rem;
        }

        .stat-card {
          background: rgba(30, 41, 59, 0.6);
          padding: 2rem;
          border-radius: 16px;
          border: 1px solid #334155;
          min-width: 250px;
        }

        .animated-number {
          font-size: 2.5rem;
          margin: 0.5rem 0;
          color: #38bdf8;
        }

        .mission-grid {
          display: grid;
          gap: 2rem;
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }

        .mission-card {
          background: rgba(15, 23, 42, 0.8);
          border: 1px solid #1e293b;
          border-radius: 16px;
          padding: 2rem;
          position: relative;
          overflow: hidden;
        }

        .mission-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(45deg, 
            transparent 0%,
            rgba(56, 189, 248, 0.1) 50%,
            transparent 100%
          );
          pointer-events: none;
        }

        .hologram-button {
          background: linear-gradient(45deg, #0ea5e9, #0d9488);
          border: none;
          padding: 1rem 2rem;
          border-radius: 8px;
          color: white;
          cursor: pointer;
          margin-top: 1rem;
          transition: all 0.3s ease;
        }

        .hologram-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 0 15px #0ea5e9;
        }

        @keyframes nebula-pulse {
          0% { opacity: 0.8; }
          50% { opacity: 1; }
          100% { opacity: 0.8; }
        }
      `}</style>
    </div>
  );
}
