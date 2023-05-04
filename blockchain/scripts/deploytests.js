const hre = require("hardhat");
const utils = require("./main");
const Ethers = require('ethers')
const json = require("../artifacts/contracts/FrogLottery.sol/FrogLottery.json")
const secret = require("../secrets.json")

const prefix = "testnet_sepolia2_"

async function main() {

  const acct1 = new Ethers.Wallet(secret.PRIVATE_KEY_1, new Ethers.providers.InfuraProvider('sepolia', 'e896ad4f86a749038fe8e1de62a9b540'))

  // ==================
  //       Factory
  // ==================

  console.log(1)
  const Factory = await hre.ethers.getContractFactory('Factory');
  const factory = await Factory.deploy(Ethers.ethers.constants.AddressZero, Ethers.ethers.constants.AddressZero, Ethers.ethers.constants.AddressZero, Ethers.ethers.constants.AddressZero);

  await factory.deployed();
  console.log(factory.address)
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
