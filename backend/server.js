require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const bitcoin = require('bitcoinjs-lib');
const crypto = require('crypto');
const cors = require('cors');
const pinataSDK = require('@pinata/sdk');
const axios = require('axios');
const { ethers } = require('ethers');
const { Readable } = require('stream');

// Initialize Express app
const app = express();

// Initialize Pinata client
const pinata = new pinataSDK({
  pinataApiKey: process.env.PINATA_API_KEY,
  pinataSecretApiKey: process.env.PINATA_SECRET_KEY
});

// Setup middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));

// Configure blockchain connection
const contractABI = [
  {
    "inputs": [{"internalType": "string", "name": "_cid", "type": "string"}],
    "name": "storeCID",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "retrieveCID",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  }
];

// Configure exSat provider and wallet
const provider = new ethers.providers.JsonRpcProvider(process.env.EXSAT_RPC_URL || 'https://rpc.exsat.network');
const wallet = process.env.PRIVATE_KEY ? new ethers.Wallet(process.env.PRIVATE_KEY, provider) : null;
const contractAddress = process.env.CONTRACT_ADDRESS;

// Initialize contract instance
let contract = null;
if (wallet && contractAddress) {
  contract = new ethers.Contract(contractAddress, contractABI, wallet);
  console.log('Smart contract connection initialized');
} else {
  console.warn('Missing PRIVATE_KEY or CONTRACT_ADDRESS environment variables');
}

// Encrypt, chunk, hash
app.post('/encrypt', (req, res) => {
  try {
    const data = Buffer.from(req.body.data, 'utf8');
    const key = crypto.randomBytes(32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    
    let encrypted = cipher.update(data);
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    const chunkSize = 1024;
    const chunks = [];
    for (let i = 0; i < encrypted.length; i += chunkSize) {
      chunks.push(encrypted.slice(i, i + chunkSize).toString('base64'));
    }

    const hashes = chunks.map(chunk =>
      crypto.createHash('sha256').update(Buffer.from(chunk, 'base64')).digest('hex')
    );

    res.json({
      chunks,
      hashes,
      key: key.toString('hex'),
      iv: iv.toString('hex')
    });
  } catch (err) {
    console.error('Detailed encryption error:', err);
    res.status(500).json({ 
      error: 'Encryption failed', 
      details: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

// Anchor hash (mock OP_RETURN script)
app.post('/anchor', (req, res) => {
  try {
    const hash = req.body.hash;
    const data = Buffer.from(hash, 'hex');
    const embed = bitcoin.payments.embed({ data: [data] });
    res.json({ opReturnScript: embed.output.toString('hex') });
  } catch (err) {
    res.status(400).json({ 
      error: 'Invalid hash format',
      details: err.message
    });
  }
});

// Decrypt and reconstruct
app.post('/reconstruct', (req, res) => {
  try {
    const { chunks, key, iv } = req.body;
    const encrypted = Buffer.concat(chunks.map(chunk => Buffer.from(chunk, 'base64')));
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key, 'hex'), Buffer.from(iv, 'hex'));
    
    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    
    res.json({ data: decrypted.toString('utf8') });
  } catch (err) {
    res.status(400).json({ 
      error: 'Decryption failed', 
      details: 'Invalid key/IV or corrupted chunks',
      message: err.message
    });
  }
});

// Upload encrypted data to IPFS via Pinata
app.post('/upload-ipfs', async (req, res) => {
  try {
    const { encryptedData } = req.body;
    
    if (!encryptedData) {
      return res.status(400).json({ error: 'Encrypted data is required' });
    }
    
    // Convert Base64 to Buffer
    const buffer = Buffer.from(encryptedData, 'base64');
    
    // Create readable stream with filename
    const stream = Readable.from(buffer);
    stream.path = 'encrypted-data.json'; // Required by Pinata

    // Upload to IPFS
    const result = await pinata.pinFileToIPFS(stream, {
      pinataMetadata: { 
        name: 'encrypted-data',
        keyvalues: { type: 'encrypted-chunks' }
      }
    });

    res.json({ 
      cid: result.IpfsHash,
      url: `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`
    });

  } catch (err) {
    console.error('IPFS Upload Error:', err);
    res.status(500).json({ 
      error: 'IPFS upload failed',
      details: err.message 
    });
  }
});

// Fetch data from IPFS
app.post('/fetch-ipfs', async (req, res) => {
  try {
    const { cid } = req.body;
    
    if (!cid) {
      return res.status(400).json({ error: 'CID is required' });
    }

    const response = await axios.get(`https://gateway.pinata.cloud/ipfs/${cid}`, {
      responseType: 'arraybuffer'
    });

    // Convert buffer to base64 with proper encoding
    const base64Data = Buffer.from(response.data).toString('base64');
    
    res.json({ 
      success: true,
      data: base64Data
    });

  } catch (err) {
    res.status(500).json({ 
      error: 'IPFS fetch failed', 
      details: err.message 
    });
  }
});

// Endpoint to store IPFS CID on exSat blockchain
app.post('/store-on-chain', async (req, res) => {
  try {
    const { cid } = req.body;
    
    if (!cid) {
      return res.status(400).json({ error: 'CID is required' });
    }
    
    if (!contract) {
      return res.status(500).json({ error: 'Blockchain connection not configured' });
    }
    
    // Store CID on the blockchain
    const tx = await contract.storeCID(cid);
    const receipt = await tx.wait();
    
    res.json({
      success: true,
      transactionHash: receipt.transactionHash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
      cid
    });
    
  } catch (err) {
    console.error('Blockchain Error:', err);
    res.status(500).json({
      error: 'Failed to store CID on blockchain',
      details: err.message
    });
  }
});

// Endpoint to retrieve IPFS CID from exSat blockchain
app.get('/retrieve-from-chain', async (req, res) => {
  try {
    if (!contract) {
      return res.status(500).json({ error: 'Blockchain connection not configured' });
    }
    
    // Get CID from the blockchain
    const cid = await contract.retrieveCID();
    
    res.json({
      success: true,
      cid
    });
    
  } catch (err) {
    console.error('Blockchain Error:', err);
    res.status(500).json({
      error: 'Failed to retrieve CID from blockchain',
      details: err.message
    });
  }
});

// Combined workflow endpoint (encrypt + IPFS + blockchain)
app.post('/encrypt-store-anchor', async (req, res) => {
  try {
    // 1. Encrypt data
    const data = Buffer.from(req.body.data, 'utf8');
    const key = crypto.randomBytes(32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    
    let encrypted = cipher.update(data);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    
    // 2. Upload to IPFS
    const buffer = encrypted;
    const stream = Readable.from(buffer);
    stream.path = 'encrypted-data.bin';
    
    const ipfsResult = await pinata.pinFileToIPFS(stream, {
      pinataMetadata: { 
        name: 'encrypted-data',
        keyvalues: { type: 'encrypted-file' }
      }
    });
    
    const cid = ipfsResult.IpfsHash;
    
    // 3. Store CID on blockchain
    if (!contract) {
      throw new Error('Blockchain connection not configured');
    }
    
    const tx = await contract.storeCID(cid);
    const receipt = await tx.wait();
    
    res.json({
      success: true,
      encryption: {
        key: key.toString('hex'),
        iv: iv.toString('hex')
      },
      ipfs: {
        cid,
        url: `https://gateway.pinata.cloud/ipfs/${cid}`
      },
      blockchain: {
        transactionHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      }
    });
    
  } catch (err) {
    console.error('Workflow Error:', err);
    res.status(500).json({
      error: 'Workflow failed',
      details: err.message
    });
  }
});

app.post('/fetch-ipfs', async (req, res) => {
  try {
    const { cid } = req.body;
    
    if (!cid) {
      return res.status(400).json({ error: 'CID is required' });
    }

    const response = await axios.get(`https://gateway.pinata.cloud/ipfs/${cid}`, {
      responseType: 'arraybuffer'
    });

    // Convert buffer to base64
    const base64Data = Buffer.from(response.data).toString('base64');
    
    res.json({ 
      success: true,
      data: base64Data
    });
  } catch (err) {
    console.error('IPFS fetch failed:', err);
    res.status(500).json({ 
      error: 'IPFS fetch failed', 
      details: err.message 
    });
  }
});

// Add this to your server.js file
app.get('/tx-to-cid', async (req, res) => {
  try {
    const { txHash } = req.query;
    
    if (!txHash) {
      return res.status(400).json({ error: 'Transaction hash is required' });
    }
    
    if (!contract) {
      return res.status(500).json({ error: 'Blockchain connection not configured' });
    }
    
    // Connect to the blockchain and get transaction receipt
    const txReceipt = await provider.getTransactionReceipt(txHash);
    
    if (!txReceipt) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    // Extract CID from logs - this depends on your contract event structure
    // Assuming your contract emits an event with the CID
    const cidLog = txReceipt.logs.find(log => 
      log.topics[0] === ethers.utils.id("CIDStored(address,string)")
    );
    
    if (!cidLog) {
      return res.status(404).json({ error: 'No CID found in this transaction' });
    }
    
    // Alternative: If you store only one CID per user, just get the latest
    const cid = await contract.retrieveCID();
    
    res.json({ success: true, cid });
  } catch (err) {
    console.error('Error fetching CID from transaction:', err);
    res.status(500).json({ 
      error: 'Failed to fetch CID from transaction', 
      details: err.message 
    });
  }
});


// Server startup
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
