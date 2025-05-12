'use client';

import { ethers } from 'ethers';

// Check if we're in a browser environment and ethereum is available
const isEthereumAvailable = () => {
  return typeof window !== 'undefined' && window.ethereum !== undefined;
};

// Connect wallet function with safety checks
export async function connectWallet() {
  if (!isEthereumAvailable()) {
    throw new Error("MetaMask is not installed. Please install MetaMask to connect wallet.");
  }
  
  try {
    // Request account access
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    
    // Create Web3Provider
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    
    // Try to switch to exSat network
    await switchToExSatNetwork(provider);
    
    // Get signer and address
    const signer = provider.getSigner();
    const address = await signer.getAddress();
    
    // Get current network
    const network = await provider.getNetwork();
    const networkName = network.name === 'unknown' ? `Chain ID: ${network.chainId}` : network.name;
    
    return {
      provider,
      signer,
      address,
      networkName
    };
  } catch (error) {
    console.error("Error connecting to wallet:", error);
    throw error;
  }
}

// "Disconnect" wallet (just in UI, as MetaMask doesn't support actual disconnection)
export function disconnectWallet() {
  // This doesn't actually disconnect MetaMask, just resets our app state
  console.log("Wallet disconnected from application state");
  return true;
}

// Check wallet connection without prompting
export async function checkWalletConnection() {
  if (!isEthereumAvailable()) {
    return {
      connected: false,
      address: '',
      networkName: ''
    };
  }
  
  try {
    const accounts = await window.ethereum.request({ method: 'eth_accounts' });
    
    if (accounts.length === 0) {
      return {
        connected: false,
        address: '',
        networkName: ''
      };
    }
    
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const network = await provider.getNetwork();
    
    return {
      connected: true,
      address: accounts[0],
      networkName: network.name === 'unknown' ? `Chain ID: ${network.chainId}` : network.name,
      chainId: network.chainId
    };
  } catch (error) {
    console.error("Error checking wallet connection:", error);
    return {
      connected: false,
      address: '',
      networkName: ''
    };
  }
}

// Switch to exSat network
async function switchToExSatNetwork(provider) {
  try {
    const network = await provider.getNetwork();
    
    if (network.chainId !== 7200) {
      try {
        // Try to switch to exSat network
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x1C20' }], // Hex for 7200
        });
      } catch (switchError) {
        // This error code indicates that the chain hasn't been added to MetaMask
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
    }
    
    return true;
  } catch (error) {
    console.error("Failed to switch network:", error);
    throw error;
  }
}
