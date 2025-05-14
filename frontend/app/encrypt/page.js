'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ethers } from 'ethers'; // <-- Import ethers

export default function EncryptPage() {
  const [file, setFile] = useState(null);
  const [encryptedChunks, setEncryptedChunks] = useState([]);
  const [hashes, setHashes] = useState([]);
  const [opReturns, setOpReturns] = useState([]);
  const [key, setKey] = useState('');
  const [iv, setIv] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [cid, setCid] = useState('');
  const [loading, setLoading] = useState(false);

  // Blockchain related states
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [networkName, setNetworkName] = useState('');
  const [txHash, setTxHash] = useState('');
  const [blockchainLoading, setBlockchainLoading] = useState(false);
  const [blockchainError, setBlockchainError] = useState('');
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;



    const handleCopy = async (text) => {
    // Try Clipboard API
    if (typeof navigator !== "undefined" && navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        alert("Copied to clipboard!");
        return;
      } catch (err) {
        // Fallback below
      }
    }
    // Fallback for older browsers
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert("Copied to clipboard!");
    } catch (err) {
      alert("Copy to clipboard is not supported in this browser.");
    }
  };
  // Check wallet connection on component mount
  useEffect(() => {
    const checkWallet = async () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setWalletConnected(true);
            setWalletAddress(accounts[0]);
            // v6: Use BrowserProvider instead of providers.Web3Provider
            const provider = new ethers.BrowserProvider(window.ethereum);
            const network = await provider.getNetwork();
            setNetworkName(network.name === 'unknown' ? `Chain ID: ${network.chainId}` : network.name);
          }
        } catch (error) {
          console.error("Error checking wallet:", error);
        }
      }
    };

    checkWallet();

    // Set up event listeners for wallet/chain changes
    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.on('accountsChanged', checkWallet);
      window.ethereum.on('chainChanged', checkWallet);

      return () => {
        window.ethereum.removeListener('accountsChanged', checkWallet);
        window.ethereum.removeListener('chainChanged', checkWallet);
      };
    }
  }, []);

  const handleFileChange = (e) => setFile(e.target.files[0]);

  // Handle connect wallet
  const handleConnectWallet = async () => {
    setBlockchainLoading(true);
    setBlockchainError('');
    try {
      if (typeof window !== 'undefined' && window.ethereum) {
        await window.ethereum.request({ method: 'eth_requestAccounts' });

        // Try to switch to exSat network
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x1C20' }], // Hex for 7200
          });
        } catch (switchError) {
          // If chain hasn't been added, add it
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: '0x1C20',
                chainName: 'exSat Network',
                nativeCurrency: { name: 'XSAT', symbol: 'XSAT', decimals: 18 },
                rpcUrls: ['https://rpc.exsat.network'],
                blockExplorerUrls: ['https://scan.exsat.network']
              }]
            });
          } else {
            throw switchError;
          }
        }

        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        setWalletConnected(true);
        setWalletAddress(accounts[0]);

        // v6: Use BrowserProvider instead of providers.Web3Provider
        const provider = new ethers.BrowserProvider(window.ethereum);
        const network = await provider.getNetwork();
        setNetworkName(network.name === 'unknown' ? `Chain ID: ${network.chainId}` : network.name);
      } else {
        throw new Error("MetaMask is not installed");
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
      setBlockchainError(error.message || 'Failed to connect wallet');
    } finally {
      setBlockchainLoading(false);
    }
  };

  // Handle disconnect wallet
  const handleDisconnectWallet = () => {
    setWalletConnected(false);
    setWalletAddress('');
    setNetworkName('');
    setCid('');
    setTxHash('');
  };

  // Encrypt file
  const handleEncrypt = async () => {
    if (!file) return alert('Select a file first!');
    setLoading(true);
    try {
      const text = await file.text();
      const res = await axios.post(`${API_BASE_URL}/encrypt`, { data: text });
      setEncryptedChunks(res.data.chunks);
      setHashes(res.data.hashes || []);
      setKey(res.data.key);
      setIv(res.data.iv);

      const blob = new Blob([JSON.stringify(res.data.chunks)], { type: 'application/json' });
      setDownloadUrl(URL.createObjectURL(blob));
    } catch (error) {
      alert('Encryption failed: ' + (error.response?.data?.details || error.message));
    } finally {
      setLoading(false);
    }
  };

  // Upload to IPFS
  const handleIPFSUpload = async () => {
    setLoading(true);
    try {
      // Convert chunks to UTF-8 safe Base64
      const jsonData = JSON.stringify(encryptedChunks);
      const base64Data = btoa(unescape(encodeURIComponent(jsonData)));

      const res = await axios.post(`${API_BASE_URL}/upload-ipfs`, {
        encryptedData: base64Data
      });
      setCid(res.data.cid);
    } catch (error) {
      alert('IPFS upload failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Anchor hashes on Bitcoin
  const handleAnchor = async () => {
    setLoading(true);
    const scripts = [];
    try {
      for (const hash of hashes) {
        const res = await axios.post(`${API_BASE_URL}/anchor`, { hash });
        scripts.push(res.data.opReturnScript);
      }
      setOpReturns(scripts);
    } catch (error) {
      alert('Anchoring failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Store CID on blockchain
  const handleStoreOnChain = async () => {
    if (!cid) return alert('Upload to IPFS first!');

    setBlockchainLoading(true);
    setBlockchainError('');

    try {
      if (!walletConnected) {
        await handleConnectWallet();
        if (!walletConnected) return;
      }

      const response = await axios.post(`${API_BASE_URL}/store-on-chain`, {
        cid
      });

      if (response.data.success) {
        setTxHash(response.data.transactionHash);
        alert('Successfully stored on blockchain!');
      } else {
        throw new Error(response.data.error || "Transaction failed");
      }
    } catch (error) {
      console.error("Error storing on chain:", error);
      setBlockchainError(error.message || 'Failed to store on blockchain');
    } finally {
      setBlockchainLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Cosmic Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute w-full h-full bg-[url('/cosmic-pattern.svg')] opacity-10 animate-pan-infinite"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse-slow-delay"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl bg-white/5 backdrop-blur-xl rounded-2xl shadow-galaxy p-8 relative z-10"
      >
        {/* Header Section */}
        <div className="flex justify-center items-center mb-8">
          
          <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.7, type: "spring" }}
          className="text-4xl font-extrabold text-center mb-8 bg-gradient-to-r from-blue-400 to-blue-500 bg-clip-text text-transparent "
        >
          🪐 Data Encryption Portal
        </motion.h1>
        </div>

        {/* Wallet Connection Section */}
        <div className="mb-8 p-6 bg-gray-800/50 rounded-xl border border-gray-700/30">
          <h2 className="text-2xl font-bold text-blue-300 mb-4">🌌 Blockchain Connection</h2>
          {walletConnected ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></div>
                  <span className="font-mono text-blue-300">
                    {walletAddress.substring(0, 6)}...{walletAddress.substring(walletAddress.length - 4)}
                  </span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={handleDisconnectWallet}
                  className="py-1 px-3 bg-gradient-to-r from-red-500 to-pink-600 rounded-lg text-sm text-white font-bold transition-all"
                >
                  Disconnect
                </motion.button>
              </div>
              <div className="space-y-2">
                <p className="text-gray-400">
                  Network: <span className="text-purple-300">{networkName}</span>
                </p>
                {cid && (
                  <p className="text-gray-400">
                    IPFS CID: <span className="text-blue-300 font-mono">{cid}</span>
                  </p>
                )}
                {txHash && (
                  <p className="text-gray-400">
                    Transaction: {' '}
                    <a 
                      href={`https://scan.exsat.network/tx/${txHash}`}
                      className="text-green-300 hover:text-green-400 transition-colors"
                      target="_blank"
                      rel="noreferrer"
                    >
                      {txHash.substring(0, 10)}...
                    </a>
                  </p>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={handleConnectWallet}
              disabled={blockchainLoading}
              className={`w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-700 text-white font-bold
                ${blockchainLoading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-space'}`}
            >
              {blockchainLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Connecting...</span>
                </div>
              ) : 'Connect Galactic Wallet'}
            </motion.button>
          )}
        </div>

        {/* File Upload Section */}
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="mb-8 border-2 border-dashed border-blue-500/30 rounded-xl p-8 text-center cursor-pointer
            bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-sm"
        >
          <input 
            type="file" 
            onChange={handleFileChange} 
            className="hidden" 
            id="fileInput"
          />
          <label 
            htmlFor="fileInput" 
            className="cursor-pointer space-y-4"
          >
            {file ? (
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="text-green-400 flex items-center justify-center space-x-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                </svg>
                <span className="text-lg">{file.name}</span>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0.8 }}
                animate={{ opacity: 1 }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="space-y-4"
              >
                <div className="inline-block p-4 bg-blue-500/10 rounded-full">
                  <svg className="w-12 h-12 mx-auto text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                  </svg>
                </div>
                <p className="text-xl text-blue-300">Drag or click to upload file</p>
                <p className="text-sm text-blue-400/70">Supported formats: .txt, .json, .csv</p>
              </motion.div>
            )}
          </label>
        </motion.div>

        {/* Encryption Controls */}
        <motion.div className="space-y-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleEncrypt}
            disabled={!file || loading}
            className={`w-full py-4 rounded-xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 text-white
              shadow-space transform transition-all ${!file || loading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg'}`}
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Encrypting...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
                <span>{file ? 'Activate Quantum Encryption' : 'Select File First'}</span>
              </div>
            )}
          </motion.button>

          {key && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6 bg-gray-800/50 rounded-xl p-6 backdrop-blur-sm"
            >
              {/* Encryption Details */}
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-blue-300">🔑 Encryption Matrix</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-900/50 rounded-lg border border-blue-500/30">
                    <h4 className="text-sm text-blue-400 mb-2">Encryption Key</h4>
                    <div className="flex items-center justify-between">
                      <code className="text-sm text-blue-300 font-mono truncate">{key}</code>
                      <button 
                        onClick={() => handleCopy(key)}
                        className="p-1 hover:bg-blue-500/10 rounded-md transition-colors"
                      >
                        📋
                      </button>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-900/50 rounded-lg border border-purple-500/30">
                    <h4 className="text-sm text-purple-400 mb-2">Initialization Vector</h4>
                    <div className="flex items-center justify-between">
                      <code className="text-sm text-purple-300 font-mono truncate">{iv}</code>
                      <button 
                        onClick={() => handleCopy(iv)}
                        className="p-1 hover:bg-purple-500/10 rounded-md transition-colors"
                      >
                        📋
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={handleIPFSUpload}
                  disabled={!encryptedChunks.length || loading}
                  className={`p-4 rounded-xl bg-gradient-to-br from-blue-600/50 to-blue-800/30 backdrop-blur-sm
                    border border-blue-500/30 ${!encryptedChunks.length || loading ? 'opacity-50' : 'hover:border-blue-400'}`}
                >
                  <div className="flex items-center space-x-2 justify-center">
                    <span>🌌</span>
                    <span>IPFS Upload</span>
                  </div>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={handleAnchor}
                  disabled={!hashes.length || loading}
                  className={`p-4 rounded-xl bg-gradient-to-br from-purple-600/50 to-purple-800/30 backdrop-blur-sm
                    border border-purple-500/30 ${!hashes.length || loading ? 'opacity-50' : 'hover:border-purple-400'}`}
                >
                  <div className="flex items-center space-x-2 justify-center">
                    <span>⛓️</span>
                    <span>Bitcoin Anchor</span>
                  </div>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={handleStoreOnChain}
                  disabled={blockchainLoading}
                  className={`p-4 rounded-xl bg-gradient-to-br from-green-600/50 to-green-800/30 backdrop-blur-sm
                    border border-green-500/30 ${blockchainLoading ? 'opacity-50' : 'hover:border-green-400'}`}
                >
                  <div className="flex items-center space-x-2 justify-center">
                    <span>💎</span>
                    <span>Blockchain Store</span>
                  </div>
                </motion.button>
              </div>

              {/* CID Display */}
              {cid && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-6 p-4 bg-gray-900/50 rounded-lg border border-blue-500/30"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-blue-300">IPFS Content ID:</span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleCopy(cid)}
                        className="px-3 py-1 bg-blue-500/10 hover:bg-blue-500/20 rounded-md transition-colors"
                      >
                        📋 Copy
                      </button>
                      <a
                        href={`https://gateway.pinata.cloud/ipfs/${cid}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 bg-purple-500/10 hover:bg-purple-500/20 rounded-md transition-colors"
                      >
                        🔗 View
                      </a>
                    </div>
                  </div>
                  <code className="text-sm text-blue-300 font-mono break-all">{cid}</code>
                </motion.div>
              )}
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
