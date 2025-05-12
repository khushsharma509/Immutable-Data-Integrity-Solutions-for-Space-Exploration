'use client';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

// Helper for robust base64 decoding
function safeBase64Decode(str) {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) base64 += '=';
  try {
    return decodeURIComponent(escape(window.atob(base64)));
  } catch (e) {
    throw new Error('Invalid base64 encoding');
  }
}

export default function DecryptPage() {
  const [inputMethod, setInputMethod] = useState('cid'); // 'cid' or 'file'
  const [txHash, setTxHash] = useState('');
  const [cid, setCid] = useState('');
  const [encFile, setEncFile] = useState(null);
  const [chunks, setChunks] = useState([]);
  const [key, setKey] = useState('');
  const [iv, setIv] = useState('');
  const [decrypted, setDecrypted] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [downloadExt, setDownloadExt] = useState('txt');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (decrypted && encFile) {
      const fileName = encFile.name || '';
      const extMatch = fileName.match(/\.(\w+)$/);
      setDownloadExt(extMatch ? extMatch[1] : 'txt');
      const blob = new Blob([decrypted], { type: encFile.type || 'text/plain' });
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [decrypted, encFile]);

  // Fetch CID from blockchain by transaction hash
  const handleFetchCidFromTx = async () => {
  if (!txHash) return alert('Enter transaction hash!');
  setLoading(true);
  try {
    // Use the new endpoint
    const res = await axios.get(`http://localhost:5000/tx-to-cid`, {
      params: { txHash }
    });
    
    if (res.data.success && res.data.cid) {
      setCid(res.data.cid);
      alert('CID fetched: ' + res.data.cid);
    } else {
      throw new Error(res.data.error || 'No CID found');
    }
  } catch (error) {
    console.error('Full error:', error);
    alert('Failed to fetch CID: ' + (error.response?.data?.details || error.message));
  } finally {
    setLoading(false);
  }
};


  // Fetch encrypted file from IPFS
  const handleFetchFromIPFS = async () => {
    if (!cid) return alert('Enter CID first!');
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:5000/fetch-ipfs', { cid });
      if (!response.data.data) throw new Error('No data received from IPFS');
      const decodedData = safeBase64Decode(response.data.data);
      const parsedChunks = JSON.parse(decodedData);
      if (!Array.isArray(parsedChunks)) throw new Error('Invalid data format from IPFS');
      setChunks(parsedChunks);
      setEncFile({ name: `ipfs-${cid}.json` }); // mock file object for extension
    } catch (error) {
      alert('IPFS fetch failed: ' + error.message);
    }
    setLoading(false);
  };

  // Handle file upload
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    setEncFile(file);
    const text = await file.text();
    try {
      setChunks(JSON.parse(text));
    } catch {
      alert('Invalid encrypted file format!');
    }
  };

  // Decrypt
  const handleDecrypt = async () => {
    if (!chunks.length || !key || !iv) return alert('Provide all inputs!');
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/reconstruct', { chunks, key, iv });
      if (!res.data.data) throw new Error('No data received from decryption');
      setDecrypted(res.data.data);
    } catch (error) {
      alert('Decryption failed: ' + error.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl bg-white/5 backdrop-blur-lg rounded-2xl shadow-xl p-8"
      >
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 mb-8 text-center">
          Data Decryption Portal
        </h1>

        <div className="space-y-6">
          {/* Input Method Toggle */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => setInputMethod('file')}
              className={`flex-1 py-2 rounded-lg ${
                inputMethod === 'file' 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-800 text-gray-400'
              }`}
            >
              File Upload
            </button>
            <button
              onClick={() => setInputMethod('cid')}
              className={`flex-1 py-2 rounded-lg ${
                inputMethod === 'cid' 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-800 text-gray-400'
              }`}
            >
              IPFS CID / Blockchain Tx
            </button>
          </div>

          {/* File Upload Section */}
          {inputMethod === 'file' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="border-2 border-dashed border-gray-700 rounded-xl p-6 text-center cursor-pointer"
            >
              <input 
                type="file" 
                onChange={handleFileChange} 
                className="hidden" 
                id="decryptFileInput"
              />
              <label 
                htmlFor="decryptFileInput" 
                className="cursor-pointer text-gray-300 hover:text-white transition-colors"
              >
                {encFile ? (
                  <span className="text-green-400">✓ {encFile.name}</span>
                ) : (
                  <>
                    <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                    </svg>
                    <p className="text-lg">Upload Encrypted File</p>
                    <p className="text-sm text-gray-500 mt-2">.json format required</p>
                  </>
                )}
              </label>
            </motion.div>
          )}

          {/* CID Input Section */}
          {inputMethod === 'cid' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <label className="text-gray-300">Blockchain Tx Hash (get CID)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={txHash}
                    onChange={(e) => setTxHash(e.target.value)}
                    className="w-full p-3 bg-gray-800 rounded-lg text-white focus:ring-2 focus:ring-purple-500 outline-none"
                    placeholder="Enter transaction hash"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleFetchCidFromTx}
                    disabled={!txHash || loading}
                    className={`px-6 py-3 bg-purple-600 text-white rounded-lg ${
                      !txHash || loading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {loading ? 'Fetching...' : 'Get CID'}
                  </motion.button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-gray-300">IPFS CID</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={cid}
                    onChange={(e) => setCid(e.target.value)}
                    className="w-full p-3 bg-gray-800 rounded-lg text-white focus:ring-2 focus:ring-purple-500 outline-none"
                    placeholder="Enter IPFS Content Identifier (CID)"
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleFetchFromIPFS}
                    disabled={!cid || loading}
                    className={`px-6 py-3 bg-purple-600 text-white rounded-lg ${
                      !cid || loading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {loading ? '🌐 Fetching...' : '🌐 Fetch'}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Key/IV Inputs */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-gray-300">Decryption Key</label>
              <input
                type="text"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                className="w-full p-3 bg-gray-800 rounded-lg text-white focus:ring-2 focus:ring-purple-500 outline-none"
                placeholder="Enter your encryption key (hex format)"
              />
            </div>
            <div className="space-y-2">
              <label className="text-gray-300">Initialization Vector (IV)</label>
              <input
                type="text"
                value={iv}
                onChange={(e) => setIv(e.target.value)}
                className="w-full p-3 bg-gray-800 rounded-lg text-white focus:ring-2 focus:ring-purple-500 outline-none"
                placeholder="Enter your IV (hex format)"
              />
            </div>
          </div>

          {/* Decrypt Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleDecrypt}
            disabled={!chunks.length || !key || !iv || loading}
            className={`w-full py-3 rounded-lg font-bold bg-gradient-to-r from-purple-500 to-pink-600 text-white ${
              (!chunks.length || !key || !iv || loading) ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg transition-all'
            }`}
          >
            {loading ? '🔓 Decrypting...' : '🔓 Decrypt File'}
          </motion.button>

          {/* Results Section */}
          <AnimatePresence>
            {decrypted && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mt-6 bg-gray-800/50 rounded-xl p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold text-green-400">Decrypted Content</h3>
                  <motion.a
                    whileHover={{ scale: 1.05 }}
                    href={downloadUrl}
                    download={`decrypted.${downloadExt}`}
                    className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm transition-all"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
                    </svg>
                    Download
                  </motion.a>
                </div>
                <pre className="whitespace-pre-wrap break-words bg-gray-900 rounded-lg p-4 max-h-96 overflow-auto">
                  {decrypted}
                </pre>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
