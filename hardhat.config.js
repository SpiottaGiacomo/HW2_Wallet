require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.20",
  networks: {
    hardhat: {
      forking: {
        url: `https://eth-mainnet.alchemyapi.io/v2/${process.env.SEPOLIA_URL}` // Replace with your Alchemy or Infura API key
        // blockNumber: 12345678 // Optional: Specify a block number to fork from
      }
    }
  }
};