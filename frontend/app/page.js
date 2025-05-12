'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { 
  connectWallet, 
  disconnectWallet,
  checkWalletConnection
} from './services/blockchainService';

export default function Home() {
  const [inputData, setInputData] = useState('');
  const [chunks, setChunks] = useState([]);
  const [hashes, setHashes] = useState([]);
  const [opReturns, setOpReturns] = useState([]);
  const [key, setKey] = useState('');
  const [iv, setIv] = useState('');
  const [userKey, setUserKey] = useState('');
  const [userIv, setUserIv] = useState('');
  const [reconData, setReconData] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Blockchain related states
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [networkName, setNetworkName] = useState('');
  const [ipfsCid, setIpfsCid] = useState('');
  const [txHash, setTxHash] = useState('');
  const [blockchainLoading, setBlockchainLoading] = useState(false);
  const [blockchainError, setBlockchainError] = useState('');

  // Check wallet connection on component mount
  useEffect(() => {
    const checkWallet = async () => {
      if (typeof window !== 'undefined') {
        try {
          const walletStatus = await checkWalletConnection();
          setWalletConnected(walletStatus.connected);
          setWalletAddress(walletStatus.address);
          setNetworkName(walletStatus.networkName);
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

  // Handle wallet connection
  const handleConnectWallet = async () => {
    setBlockchainLoading(true);
    setBlockchainError('');
    
    try {
      const walletInfo = await connectWallet();
      setWalletConnected(true);
      setWalletAddress(walletInfo.address);
      setNetworkName(walletInfo.networkName || 'exSat Network');
    } catch (error) {
      console.error("Error connecting wallet:", error);
      setBlockchainError(error.message || 'Failed to connect wallet');
    } finally {
      setBlockchainLoading(false);
    }
  };

  // Handle wallet disconnection
  const handleDisconnectWallet = () => {
    disconnectWallet();
    setWalletConnected(false);
    setWalletAddress('');
    setNetworkName('');
    setIpfsCid('');
    setTxHash('');
  };

  // Encrypt, chunk, hash
  const handleEncrypt = async () => {
    setLoading(true);
    setOpReturns([]);
    setReconData('');
    try {
      const res = await axios.post('http://localhost:5000/encrypt', { data: inputData });
      setChunks(res.data.chunks);
      setHashes(res.data.hashes);
      setKey(res.data.key);
      setIv(res.data.iv);
      setUserKey(res.data.key); // Pre-fill user fields
      setUserIv(res.data.iv);
    } catch (e) {
      console.error('Encryption error details:', e.response?.data || e.message);
      alert(`Encryption failed: ${e.response?.data?.details || e.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Anchor hashes
  const handleAnchor = async () => {
    setLoading(true);
    const scripts = [];
    for (const hash of hashes) {
      const res = await axios.post('http://localhost:5000/anchor', { hash });
      scripts.push(res.data.opReturnScript);
    }
    setOpReturns(scripts);
    setLoading(false);
  };

  // Store on blockchain
  const handleStoreOnChain = async () => {
    setBlockchainLoading(true);
    setBlockchainError('');
    
    try {
      if (!walletConnected) {
        await handleConnectWallet();
        if (!walletConnected) return;
      }
      
      if (!chunks.length) {
        throw new Error("Please encrypt some data first");
      }
      
      // Upload to IPFS via our backend
      const encryptedData = chunks.join('');
      const response = await axios.post('http://localhost:5000/upload-ipfs', { 
        encryptedData
      });
      
      if (!response.data.cid) {
        throw new Error("Failed to get CID from IPFS");
      }
      
      const cid = response.data.cid;
      setIpfsCid(cid);
      
      // Store CID on blockchain
      const storeResponse = await axios.post('http://localhost:5000/store-on-chain', {
        cid
      });
      
      if (storeResponse.data.success) {
        setTxHash(storeResponse.data.transactionHash);
        alert('Successfully stored on blockchain!');
      } else {
        throw new Error(storeResponse.data.error || "Transaction failed");
      }
    } catch (error) {
      console.error("Error storing on chain:", error);
      setBlockchainError(error.message || 'Failed to store on blockchain');
    } finally {
      setBlockchainLoading(false);
    }
  };

  // Retrieve from blockchain
  const handleRetrieveFromChain = async () => {
    setBlockchainLoading(true);
    setBlockchainError('');
    
    try {
      if (!walletConnected) {
        await handleConnectWallet();
        if (!walletConnected) return;
      }
      
      const response = await axios.get('http://localhost:5000/retrieve-from-chain');
      
      if (response.data.success) {
        setIpfsCid(response.data.cid);
        
        // Fetch data from IPFS
        const ipfsResponse = await axios.post('http://localhost:5000/fetch-ipfs', { 
          cid: response.data.cid
        });
        
        if (ipfsResponse.data.success) {
          alert(`Successfully retrieved data from IPFS with CID: ${response.data.cid}`);
        }
      } else {
        throw new Error(response.data.error || "Retrieval failed");
      }
    } catch (error) {
      console.error("Error retrieving from blockchain:", error);
      setBlockchainError(error.message || 'Failed to retrieve from blockchain');
    } finally {
      setBlockchainLoading(false);
    }
  };

  // Reconstruct (decrypt) data
  const handleReconstruct = async () => {
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/reconstruct', {
        chunks,
        key: userKey,
        iv: userIv
      });
      setReconData(res.data.data);
    } catch (e) {
      setReconData('Decryption failed. Check your key, IV, and chunks.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 flex flex-col items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl bg-white/10 rounded-2xl shadow-2xl p-8 backdrop-blur-md"
      >
        <div className="flex gap-4 mb-8">
          <Link href="/encrypt" passHref>
            <button className="px-15 py-7 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-bold transition">
              Go to Encrypt Page
            </button>
          </Link>
          <Link href="/decrypt" passHref>
            <button className="px-15 py-7 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-bold transition">
              Go to Decrypt Page
            </button>
          </Link>
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
              {ipfsCid && (
                <p className="mb-2">
                  <span className="text-gray-400">IPFS CID: </span>
                  <span className="font-mono text-blue-300">{ipfsCid}</span>
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
        
        <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-6 text-center drop-shadow-lg">
          <span className="text-blue-400">Bitcoin Satellite</span> Data Integrity Network
        </h1>
        <textarea
          className="w-full h-32 p-4 rounded-lg bg-gray-900 text-white border-2 border-blue-400 focus:ring-2 focus:ring-blue-400 outline-none transition"
          placeholder="Enter data to encrypt and anchor"
          value={inputData}
          onChange={e => setInputData(e.target.value)}
        />
        <div className="flex flex-col md:flex-row gap-4 mt-6">
          <button
            onClick={handleEncrypt}
            disabled={loading || !inputData}
            className={`flex-1 py-3 rounded-lg text-lg font-bold transition bg-blue-500 hover:bg-blue-600 text-white shadow-lg ${loading || !inputData ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Encrypting...' : 'Encrypt & Chunk Data'}
          </button>
          <button
            onClick={handleAnchor}
            disabled={loading || hashes.length === 0}
            className={`flex-1 py-3 rounded-lg text-lg font-bold transition bg-green-500 hover:bg-green-600 text-white shadow-lg ${loading || hashes.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Anchoring...' : 'Anchor Hashes on Bitcoin'}
          </button>
        </div>

        {/* Blockchain Actions */}
        {chunks.length > 0 && (
          <div className="flex flex-col md:flex-row gap-4 mt-4">
            <button
              onClick={handleStoreOnChain}
              disabled={blockchainLoading || !chunks.length}
              className={`flex-1 py-3 rounded-lg text-lg font-bold transition bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg ${blockchainLoading || !chunks.length ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {blockchainLoading ? 'Processing...' : 'Store on exSat Blockchain'}
            </button>
            <button
              onClick={handleRetrieveFromChain}
              disabled={blockchainLoading}
              className={`flex-1 py-3 rounded-lg text-lg font-bold transition bg-amber-500 hover:bg-amber-600 text-white shadow-lg ${blockchainLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {blockchainLoading ? 'Retrieving...' : 'Retrieve from Blockchain'}
            </button>
          </div>
        )}

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
                      onChange={e => {
                        const newHashes = [...hashes];
                        newHashes[idx] = e.target.value;
                        setHashes(newHashes);
                      }}
                      style={{ minWidth: 0 }}
                    />
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>

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
          {chunks.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="mt-8"
            >
              <h3 className="text-lg font-semibold text-yellow-300 mb-2">Decryption Key & IV:</h3>
              <div className="bg-gray-800 rounded-lg p-4 text-white text-xs break-all space-y-2">
                <div>
                  <label className="font-bold mr-2">Key:</label>
                  <input
                    type="text"
                    className="w-full bg-gray-900 border border-blue-400 rounded px-2 py-1 text-white"
                    value={userKey}
                    onChange={e => setUserKey(e.target.value)}
                    placeholder="Enter decryption key"
                  />
                </div>
                <div>
                  <label className="font-bold mr-2">IV:</label>
                  <input
                    type="text"
                    className="w-full bg-gray-900 border border-blue-400 rounded px-2 py-1 text-white"
                    value={userIv}
                    onChange={e => setUserIv(e.target.value)}
                    placeholder="Enter IV"
                  />
                </div>
              </div>
              <button
                onClick={handleReconstruct}
                className="mt-4 px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg text-white font-bold transition"
              >
                Reconstruct & Decrypt Data
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {reconData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="mt-8"
            >
              <h3 className="text-lg font-semibold text-purple-300 mb-2">Reconstructed Data:</h3>
              <div className="bg-gray-900 rounded-lg p-4 text-white text-sm break-all">
                {reconData}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      <footer className="mt-8 text-gray-400 text-sm text-center">
        &copy; {new Date().getFullYear()} Bitcoin Satellite Hackathon Project
      </footer>
    </div>
  );
}
