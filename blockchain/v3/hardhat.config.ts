require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-etherscan");
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const config: HardhatUserConfig = {
  defaultNetwork: "hardhat",
  solidity: {
    version: "0.7.6",
    settings: {
      optimizer: {
        enabled: true,
        runs: 2000,
      },
    },
  },
  paths: {
    artifacts: '../artifacts',
    cache: '../cache'
  }
}

export default config;
