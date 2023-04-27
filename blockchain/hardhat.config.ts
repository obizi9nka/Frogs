require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-etherscan");
require('hardhat-contract-sizer');
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import 'solidity-coverage';
import { PRIVATE_KEY_1, bscscanApiKey, ethscanApiKey } from './secrets.json';

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  solidity: {
    compilers: [
      {
        version: "0.8.1"
      }
      // {
      //   version: "=0.7.6"
      // }, {
      //   version: "0.5.0"
      // }, {
      //   version: "^0.7.0"
      // }, {
      //   version: ">=0.7.5"
      // }, {
      //   version: "0.6.0"
      // }, {
      //   version: "0.7.6"
      // },
    ],
    settings: {
      optimizer: {
        enabled: true,
        runs: 999,
      },
    }
  },
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
      // allowUnlimitedContractSize: true,
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
  }
};

export default config;
