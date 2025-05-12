// frontend/app/components/WalletConnect.js
'use client';

import { useState, useEffect } from 'react';
import { connectWallet } from '../services/blockchainService';

export default function WalletConnect() {
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!window.ethereum) return;
    const handleAccountsChanged = (accounts) => {
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        fetchBalance(accounts[0]);
      } else {
        setAccount(null);
        setBalance(null);
      }
    };
    window.ethereum.on('accountsChanged', handleAccountsChanged);
    return () => {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
    };
  }, []);

  const fetchBalance = async (address) => {
    try {
      const balanceHex = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [address, 'latest'],
      });
      setBalance((parseInt(balanceHex, 16) / 1e18).toFixed(4));
    } catch {
      setBalance(null);
    }
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    setError(null);
    try {
      const { address, balance } = await connectWallet();
      setAccount(address);
      setBalance(balance);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    setAccount(null);
    setBalance(null);
    setError(null);
  };

  return (
    <div className="flex items-center space-x-4">
      {!account ? (
        <button
          onClick={handleConnect}
          disabled={isConnecting}
          className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg shadow hover:from-blue-600 hover:to-purple-700 transition disabled:opacity-60"
        >
          {isConnecting ? (
            <svg className="animate-spin h-5 w-5 mr-2 text-white" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
          ) : (
            <span className="mr-2">🔗</span>
          )}
          Connect Wallet
        </button>
      ) : (
        <div className="flex items-center space-x-2 bg-slate-800/80 px-3 py-2 rounded-lg">
          <span className="inline-block w-2 h-2 rounded-full bg-green-400 mr-2"></span>
          <span className="font-mono text-blue-300">
            {account.slice(0, 6)}...{account.slice(-4)}
          </span>
          <span className="text-purple-300 font-mono text-sm ml-2">
            {parseFloat(balance).toFixed(4)} XSAT
          </span>
          <button
            onClick={handleDisconnect}
            className="ml-3 px-3 py-1 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-md text-xs font-semibold hover:from-red-600 hover:to-pink-600 transition"
          >
            ⏏ Disconnect
          </button>
        </div>
      )}
      {error && (
        <span className="text-red-400 text-xs ml-2">{error}</span>
      )}
    </div>
  );
}
