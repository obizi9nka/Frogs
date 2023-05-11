import hre from "hardhat";
const utils = require("./main");
import { ethers } from 'ethers';
import json from "../artifacts/contracts/frogs/FrogLottery.sol/FrogLottery.json";
import constants from "./json/constants.json";
const prefix = "sepolia_"
import secret from "../secrets.json"

async function main() {
  const acct1 = new ethers.Wallet(secret.PRIVATE_KEY_1, new ethers.providers.InfuraProvider('sepolia', 'e896ad4f86a749038fe8e1de62a9b540'))

  // ==================
  //        USDT
  // ==================

  console.log(1)

  const USDT = await hre.ethers.getContractFactory('ERC20Token');
  const usdt = await USDT.deploy('USDT', "usdt");

  await usdt.deployed();
  await utils.saveAddress(prefix + "USDT", usdt.address)

  // ==================
  //        CAKE
  // ==================

  console.log(1)


  const CAKE = await hre.ethers.getContractFactory('CakeToken');
  const cake = await CAKE.deploy();

  await cake.deployed();
  await utils.saveAddress(prefix + "CAKE", cake.address)

  // ==================
  //         BNB
  // ==================
  console.log(1)

  const BNB = await hre.ethers.getContractFactory('TBnb');
  const bnb = await BNB.deploy();

  await bnb.deployed();
  await utils.saveAddress(prefix + "BNB", bnb.address)

  // ==================
  //     FrogReferal
  // ==================
  console.log(1)

  const Referal = await hre.ethers.getContractFactory('FrogReferal');
  const referal = await Referal.deploy(acct1.address, constants.addressOfPrivateKey);

  await referal.deployed();
  await utils.saveAddress(prefix + "FrogReferal", referal.address)


  console.log(1)

  // ==================
  //   PancakeFactory
  // ==================

  const PancakeFactory = await hre.ethers.getContractFactory('PancakeFactory');
  const pancakeFactory = await PancakeFactory.deploy(acct1.address);

  await pancakeFactory.deployed();
  await utils.saveAddress(prefix + "PancakeFactory", pancakeFactory.address)
  await pancakeFactory.createPair(cake.address, bnb.address, true)
  await pancakeFactory.createPair(cake.address, usdt.address, false)
  await pancakeFactory.createPair(bnb.address, usdt.address, true)

  // ==================
  //       Factory
  // ==================
  console.log(1)

  const Factory = await hre.ethers.getContractFactory('Factory');
  const factory = await Factory.deploy(referal.address, bnb.address, pancakeFactory.address, acct1.address);

  await referal.setFactoryAddress(factory.address)

  await factory.deployed();
  await utils.saveAddress(prefix + "Factory", factory.address)

  await factory.createNewLottery(cake.address, bnb.address, 1)

  console.log(1)

  // ==================
  //     MasterChef
  // ==================

  const SyrupBar = await hre.ethers.getContractFactory('SyrupBar');
  const syrupBar = await SyrupBar.deploy(cake.address);

  await syrupBar.deployed();
  await utils.saveAddress(prefix + "SyrupBar", syrupBar.address)

  const MasterChef = await hre.ethers.getContractFactory('MasterChef');
  const masterChef = await MasterChef.deploy(cake.address, syrupBar.address, acct1.address, BigInt(40 * 10 ** 18), 0);

  await masterChef.deployed();
  await utils.saveAddress(prefix + "MasterChef", masterChef.address)

  // ==================
  //       Router
  // ==================

  const Router = await hre.ethers.getContractFactory('PancakeRouter');
  const router = await Router.deploy(pancakeFactory.address, bnb.address);

  await router.deployed();
  await utils.saveAddress(prefix + "Router", router.address)

  console.log(1)

  // ==================
  //  Lottery CAKE-BNB
  // ==================

  const lotteryAddress = await factory.lotteries(cake.address, bnb.address)
  await utils.saveAddress(prefix + "Lottery_CAKE_BNB", lotteryAddress)



  const TOKENS_VALUE_20 = BigInt(10 ** 35)

  await cake.connect(acct1).getTokens(TOKENS_VALUE_20);

  await usdt.connect(acct1).getTokens(TOKENS_VALUE_20);

  const lottery = new ethers.Contract(lotteryAddress, json.abi, acct1)

  await cake.approve(router.address, TOKENS_VALUE_20)
  await bnb.approve(router.address, TOKENS_VALUE_20)
  await usdt.approve(router.address, TOKENS_VALUE_20)
  await cake.approve(lotteryAddress, TOKENS_VALUE_20)

  await utils.saveAddress(prefix + "LPToken_CAKE_BNB", await pancakeFactory.getPair(cake.address, bnb.address))
  await utils.saveAddress(prefix + "LPToken_CAKE_USDT", await pancakeFactory.getPair(cake.address, usdt.address))
  await utils.saveAddress(prefix + "LPToken_BNB_USDT", await pancakeFactory.getPair(bnb.address, usdt.address))

  setTimeout(async () => {
    const value = BigInt(10 ** 14);
    const power = 1000000

    await utils.saveAddress(prefix + "LPToken_CAKE_BNB", await pancakeFactory.getPair(cake.address, bnb.address))
    try {
      await router.addLiquidityETH(cake.address, BigInt(power * 89 * 10 ** 18), 1, 1, acct1.address, Math.round(Date.now() / 1000) + 60 * 20, { value })
    } catch (error) {
      console.log(error)
    }
    console.log("11")

    await utils.saveAddress(prefix + "LPToken_CAKE_USDT", await pancakeFactory.getPair(cake.address, usdt.address))
    try {
      await router.addLiquidity(cake.address, usdt.address, BigInt(power * 10 ** 18), BigInt(power * 3.64 * 10 ** 18), 1, 1, acct1.address, Math.round(Date.now() / 1000) + 60 * 20)
    } catch (error) {
      console.log(error)
    }
    console.log("11")

    await utils.saveAddress(prefix + "LPToken_BNB_USDT", await pancakeFactory.getPair(bnb.address, usdt.address))
    try {
      await router.addLiquidityETH(usdt.address, BigInt(power * 323 * 10 ** 18), 1, 1, acct1.address, Math.round(Date.now() / 1000) + 60 * 20, { value })
    } catch (error) {
      console.log(error)
    }
    console.log("11")

    try {
      await lottery.setAll(cake.address, bnb.address, usdt.address, router.address, masterChef.address, await pancakeFactory.getPair(cake.address, bnb.address))
    } catch (error) {
      console.log(error)
    }

    try {
      await masterChef.add(1, await pancakeFactory.getPair(cake.address, bnb.address), false)
    } catch (error) {
      console.log(error)
    }
  }, 300000);

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});