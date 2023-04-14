require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-etherscan");
require('hardhat-contract-sizer');

const { PRIVATE_KEY_1, bscscanApiKey, ethscanApiKey } = require('./secrets.json');

task("accounts", "Prints the list of accounts", async () => {
  const accounts = await ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  defaultNetwork: "hardhat",
  solidity: {
    version: "0.8.0",
    settings: {
      optimizer: {
        enabled: true,
        runs: 999999,
      },
    },
  },
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545"
    },
    hardhat: {
    },
    testnet: {
      url: "https://data-seed-prebsc-1-s1.binance.org:8545",
      chainId: 97,
      gasPrice: 20000000000,
      accounts: [PRIVATE_KEY_1],
    },
    mainnet: {
      url: "https://bsc-dataseed.binance.org/",
      chainId: 56,
      gasPrice: 20000000000,
      accounts: [PRIVATE_KEY_1],
    },
    linea: {
      url: "https://rpc.goerli.linea.build",
      chainId: 59140,
      accounts: [PRIVATE_KEY_1]
    },
    sepolia: {
      url: "https://sepolia.infura.io/v3/e896ad4f86a749038fe8e1de62a9b540",
      chainId: 11155111,
      accounts: [PRIVATE_KEY_1]
    }
  },
  etherscan: {
    apiKey: ethscanApiKey
  },
};
