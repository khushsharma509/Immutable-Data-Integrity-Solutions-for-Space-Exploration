/** @type import('hardhat/config').HardhatUserConfig */
require('@nomiclabs/hardhat-ethers');
require('dotenv').config();

module.exports = {
  solidity: "0.8.17",
  networks: {
    exsat: {
      url: process.env.EXSAT_RPC_URL ,
      accounts: [process.env.PRIVATE_KEY],
      chainId: 839999
    }
  }
};
