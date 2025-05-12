// frontend/app/components/WalletConnect.js
'use client';

import { useState, useEffect } from 'react';
import { connectWallet } from '../services/blockchainService';

export default function WalletConnect() {
  const [account, setAccount] = useState(null);
  const [balance, setBalance] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);

  // Listen for account changes
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        } else {
          setAccount(null);
          setBalance(null);
        }
      });
    }
    
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', () => {});
      }
    };
  }, []);

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

  return (
    <div className="wallet-connect-container">
      {!account ? (
        <button 
          className="connect-wallet-btn" 
          onClick={handleConnect}
          disabled={isConnecting}
        >
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </button>
      ) : (
        <div className="wallet-info">
          <span className="wallet-address">
            {account.substring(0, 6)}...{account.substring(account.length - 4)}
          </span>
          <span className="wallet-balance">
            {parseFloat(balance).toFixed(4)} XSAT
          </span>
        </div>
      )}
      
      {error && <div className="error-message">{error}</div>}
    </div>
  );
}
