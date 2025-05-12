'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

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

  // Check wallet connection on component mount
  useEffect(() => {
    const checkWallet = async () => {
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            setWalletConnected(true);
            setWalletAddress(accounts[0]);
            
            const provider = new ethers.providers.Web3Provider(window.ethereum);
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
                chainId: '0x1C20', // Hex for 7200
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
        
        const provider = new ethers.providers.Web3Provider(window.ethereum);
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
      const res = await axios.post('http://localhost:5000/encrypt', { data: text });
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
      
      const res = await axios.post('http://localhost:5000/upload-ipfs', {
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
        const res = await axios.post('http://localhost:5000/anchor', { hash });
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
      
      const response = await axios.post('http://localhost:5000/store-on-chain', {
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl bg-white/5 backdrop-blur-lg rounded-2xl shadow-xl p-8"
      >
        <div className="flex justify-between items-center mb-8">
          <Link href="/" passHref>
            <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition">
              ← Back to Home
            </button>
          </Link>
          <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 text-center">
            Data Encryption Portal
          </h1>
        </div>

        {/* Wallet Connection UI */}
        <div className="mb-6 p-4 bg-gray-800 rounded-lg">
          <h2 className="text-xl font-bold text-white mb-3">Blockchain Connection</h2>
          {walletConnected ? (
            <div className="text-white">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <span className="text-gray-400">Connected: </span>
                  <span className="font-mono">{walletAddress.substring(0, 6)}...{walletAddress.substring(walletAddress.length - 4)}</span>
                </div>
                <button
                  onClick={handleDisconnectWallet}
                  className="py-1 px-3 bg-red-500 hover:bg-red-600 rounded text-sm text-white font-bold transition"
                >
                  Disconnect
                </button>
              </div>
              <p className="mb-2">
                <span className="text-gray-400">Network: </span>
                <span className={networkName.includes('exSat') ? 'text-green-400' : 'text-yellow-400'}>
                  {networkName || 'Unknown'}
                </span>
              </p>
              {cid && (
                <p className="mb-2">
                  <span className="text-gray-400">IPFS CID: </span>
                  <span className="font-mono text-blue-300">{cid}</span>
                </p>
              )}
              {txHash && (
                <p className="mb-2">
                  <span className="text-gray-400">TX Hash: </span>
                  <a 
                    href={`https://scan.exsat.network/tx/${txHash}`} 
                    target="_blank" 
                    rel="noreferrer"
                    className="font-mono text-green-300 hover:underline"
                  >
                    {txHash.substring(0, 10)}...
                  </a>
                </p>
              )}
            </div>
          ) : (
            <button
              onClick={handleConnectWallet}
              disabled={blockchainLoading}
              className={`py-2 px-4 bg-blue-500 hover:bg-blue-600 rounded-lg text-white font-bold transition ${blockchainLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {blockchainLoading ? 'Connecting...' : 'Connect Wallet'}
            </button>
          )}
          {blockchainError && (
            <p className="mt-2 text-red-400 text-sm">{blockchainError}</p>
          )}
        </div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="mb-8 border-2 border-dashed border-gray-700 rounded-xl p-6 text-center cursor-pointer"
        >
          <input 
            type="file" 
            onChange={handleFileChange} 
            className="hidden" 
            id="fileInput"
          />
          <label 
            htmlFor="fileInput" 
            className="cursor-pointer text-gray-300 hover:text-white transition-colors"
          >
            {file ? (
              <span className="text-green-400">✓ {file.name}</span>
            ) : (
              <>
                <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                </svg>
                <p className="text-lg">Click to select file</p>
                <p className="text-sm text-gray-500 mt-2">Supports .txt, .json, .csv</p>
              </>
            )}
          </label>
        </motion.div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleEncrypt}
          disabled={!file || loading}
          className={`w-full py-3 rounded-lg font-bold bg-gradient-to-r from-blue-500 to-purple-600 text-white 
            ${!file || loading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg transition-all'}`}
        >
          {loading ? '🔐 Encrypting...' : file ? '🔒 Encrypt File' : 'Select File First'}
        </motion.button>

        {key && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 space-y-4 bg-gray-800/50 rounded-xl p-6"
          >
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-blue-400">Encryption Details</h3>
              <div className="flex flex-col space-y-1">
                <span className="text-sm text-gray-400">Encryption Key</span>
                <code className="p-2 bg-gray-900 rounded-md break-all">{key}</code>
              </div>
              <div className="flex flex-col space-y-1">
                <span className="text-sm text-gray-400">Initialization Vector (IV)</span>
                <code className="p-2 bg-gray-900 rounded-md break-all">{iv}</code>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {downloadUrl && (
                <motion.a
                  whileHover={{ scale: 1.02 }}
                  href={downloadUrl}
                  download="encrypted_chunks.json"
                  className="inline-flex items-center justify-center w-full py-2 px-4 bg-green-600 hover:bg-green-700 rounded-lg text-white transition-all"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                  </svg>
                  Download Encrypted File
                </motion.a>
              )}

              <div className="grid grid-cols-2 gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAnchor}
                  disabled={!hashes.length || loading}
                  className={`py-2 px-4 bg-green-600 hover:bg-green-700 rounded-lg text-white transition-all
                    ${!hashes.length || loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {loading ? 'Anchoring...' : '🔗 Anchor on Bitcoin'}
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleIPFSUpload}
                  disabled={!encryptedChunks.length || loading}
                  className={`py-2 px-4 bg-orange-600 hover:bg-orange-700 rounded-lg text-white transition-all
                    ${!encryptedChunks.length || loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {loading ? '⏫ Uploading...' : '🌐 Upload to IPFS'}
                </motion.button>
              </div>

              {/* Blockchain store button - only show after IPFS upload */}
              {cid && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleStoreOnChain}
                  disabled={blockchainLoading}
                  className={`py-2 px-4 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white transition-all
                    ${blockchainLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {blockchainLoading ? 'Processing...' : '💼 Store on exSat Blockchain'}
                </motion.button>
              )}

              {cid && (
                <div className="mt-4 p-4 bg-gray-900 rounded-lg">
                  <p className="text-green-400 mb-2">IPFS CID: {cid}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigator.clipboard.writeText(cid)}
                      className="px-3 py-1 bg-blue-600 rounded hover:bg-blue-700"
                    >
                      📋 Copy CID
                    </button>
                    <a
                      href={`https://gateway.pinata.cloud/ipfs/${cid}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1 bg-purple-600 rounded hover:bg-purple-700"
                    >
                      🔗 View on IPFS
                    </a>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        <AnimatePresence>
          {opReturns.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="mt-8"
            >
              <h3 className="text-xl font-semibold text-green-300 mb-2">OP_RETURN Scripts:</h3>
              <ul className="bg-gray-800 rounded-lg p-4 space-y-1 max-h-40 overflow-y-auto text-white text-sm">
                {opReturns.map((script, idx) => (
                  <motion.li
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    {script}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {hashes.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="mt-8"
            >
              <h3 className="text-xl font-semibold text-blue-300 mb-2">Chunk Hashes:</h3>
              <ul className="bg-gray-800 rounded-lg p-4 space-y-1 max-h-40 overflow-y-auto text-white text-sm">
                {hashes.map((hash, idx) => (
                  <motion.li
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-center space-x-2"
                  >
                    <span className="text-gray-400 mr-2">{idx + 1}.</span>
                    <input
                      type="text"
                      className="flex-1 bg-gray-900 border border-blue-400 rounded px-2 py-1 text-white"
                      value={hash}
                      readOnly
                      style={{ minWidth: 0 }}
                    />
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
