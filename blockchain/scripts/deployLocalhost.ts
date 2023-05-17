import hre from "hardhat";
import { ethers } from 'hardhat';
import json from "../artifacts/contracts/frogs/FrogLottery.sol/FrogLottery.json";
import jsonPool from "../artifacts/contracts/core/UniswapV3Pool.sol/UniswapV3Pool.json"
import { ERC20Token, Factory, FrogLottery, FrogReferal, TBnb } from "../typechain-types";
const utils = require("./main");
import { allContractsFromDeploy } from "../@types";
import { NonfungiblePositionManager, SwapRouter, UniswapV3Factory, UniswapV3Pool } from "../v3/typechain-types";
import { BigNumber } from "ethers";
import bn from 'bignumber.js'
import { deployAll } from "../test/fixtures/fixtures";

const prefix = 'localhost_'
const fee = 500;

async function main() {
  const { usdc, usdt, busd, pool_busd_usdt, lottery_busd_usdt, pancakeFactory, router, nonfungiblePositionManager, factory, referal, fee } = await deployAll()

  await utils.saveAddress(prefix + "Pool_busd_usdt_fee", fee)
  // const [acct1, acct2, acct3, acct4] = await ethers.getSigners();
  // // ==================
  // //        USDC
  // // ==================
  // const USDC = await hre.ethers.getContractFactory('ERC20Token');
  // const usdc = await USDC.deploy('USDC', "usdc") as ERC20Token;

  // await usdc.deployed();
  await utils.saveAddress(prefix + "USDC", usdc.address)
  // // ==================
  // //        USDT
  // // ==================
  // const USDT = await hre.ethers.getContractFactory('ERC20Token');
  // const usdt = await USDT.deploy('USDT', "usdt") as ERC20Token;

  // await usdt.deployed();
  await utils.saveAddress(prefix + "USDT", usdt.address)
  // // ==================
  // //        BUSD
  // // ==================
  // const BUSD = await hre.ethers.getContractFactory('ERC20Token');
  // const busd = await BUSD.deploy('BUSD', "busd") as ERC20Token;

  // await busd.deployed();
  await utils.saveAddress(prefix + "BUSD", busd.address)


  // // ==================
  // //        BNB
  // // ==================
  // const BNB = await hre.ethers.getContractFactory('TBnb');
  // const bnb = await BNB.deploy() as TBnb;

  // await bnb.deployed();
  // await utils.saveAddress(prefix + "BNB", bnb.address)


  // // ==================
  // //     FrogReferal
  // // ==================
  // const Referal = await hre.ethers.getContractFactory('FrogReferal');
  // const referal = await Referal.deploy(acct1.address, acct1.address) as FrogReferal;

  // await referal.deployed();
  await utils.saveAddress(prefix + "FrogReferal", referal.address)



  // // ==================
  // //   PancakeFactory
  // // ==================
  // const PancakeFactory = await hre.ethers.getContractFactory('UniswapV3Factory');
  // const pancakeFactory = await PancakeFactory.deploy() as UniswapV3Factory;

  // await pancakeFactory.deployed();
  await utils.saveAddress(prefix + "PancakeFactory", pancakeFactory.address)



  // await pancakeFactory.createPool(busd.address, usdt.address, fee)

  // const pool_busd_usdt = new ethers.Contract(await pancakeFactory.getPool(busd.address, usdt.address, fee), jsonPool.abi, acct1) as UniswapV3Pool

  // function encodePriceSqrt(reserve1: any, reserve0: any): BigNumber {
  //   return BigNumber.from(
  //     new bn(reserve1)
  //       .div(reserve0)
  //       .sqrt()
  //       .multipliedBy(new bn(2).pow(96))
  //       .integerValue(3)
  //       .toString()
  //   )
  // }
  // const rrr = BigInt(79228162514264337593543950336) // encodePriceSqrt(1, 1)
  // const price = rrr

  // await pool_busd_usdt.initialize(price)
  // // console.log(await pool_busd_usdt.slot0())
  // // console.log(await pool_busd_usdt.liquidity())

  await utils.saveAddress(prefix + "Pool_busd_usdt", pool_busd_usdt.address)
  // // // console.log(pool_busd_usdt', pool_busd_usdt.address)

  // // ==================
  // //  NonfungiblePositionManager
  // // ==================
  // const NonfungiblePositionManager = await hre.ethers.getContractFactory('NonfungiblePositionManager');
  // const nonfungiblePositionManager = await NonfungiblePositionManager.deploy(pancakeFactory.address, ethers.constants.AddressZero, ethers.constants.AddressZero) as NonfungiblePositionManager;

  // await nonfungiblePositionManager.deployed();
  await utils.saveAddress(prefix + "NonfungiblePositionManager", nonfungiblePositionManager.address)

  // // ==================
  // //       Router
  // // ==================
  // const SwapRouter = await hre.ethers.getContractFactory('SwapRouter');
  // const router = await SwapRouter.deploy(pancakeFactory.address, bnb.address) as SwapRouter
  // await router.deployed();
  await utils.saveAddress(prefix + "SwapRouter", router.address)

  // // ==================
  // //       Factory
  // // ==================
  // const Factory = await hre.ethers.getContractFactory('Factory');
  // const factory = await Factory.deploy(referal.address, ethers.constants.AddressZero, pancakeFactory.address, acct1.address, router.address) as Factory;

  // await factory.deployed();
  await utils.saveAddress(prefix + "Factory", factory.address)

  // await referal.setFactoryAddress(factory.address)

  // const TOKENS_VALUE_20 = BigInt(10 ** 35)
  // await busd.connect(acct1).getTokens(TOKENS_VALUE_20);
  // await busd.connect(acct2).getTokens(TOKENS_VALUE_20);

  // await usdt.connect(acct1).getTokens(TOKENS_VALUE_20);
  // await usdt.connect(acct2).getTokens(TOKENS_VALUE_20);

  // await usdc.connect(acct1).getTokens(TOKENS_VALUE_20);
  // await usdc.connect(acct2).getTokens(TOKENS_VALUE_20);

  // await usdc.connect(acct2).approve(nonfungiblePositionManager.address, TOKENS_VALUE_20)
  // await usdt.connect(acct2).approve(nonfungiblePositionManager.address, TOKENS_VALUE_20)
  // await busd.connect(acct2).approve(nonfungiblePositionManager.address, TOKENS_VALUE_20)

  // await busd.approve(nonfungiblePositionManager.address, TOKENS_VALUE_20)
  // await usdc.approve(nonfungiblePositionManager.address, TOKENS_VALUE_20)
  // await usdt.approve(nonfungiblePositionManager.address, TOKENS_VALUE_20)


  // // const balanceBeforeBusd = await busd.balanceOf(acct1.address)
  // // const balanceBeforeUsdt = await usdt.balanceOf(acct1.address)

  // await nonfungiblePositionManager.mint({
  //   token0: busd.address,
  //   token1: usdt.address,
  //   fee,
  //   tickLower: -100,
  //   tickUpper: 100,
  //   amount0Desired: BigInt(10 ** 30),
  //   amount1Desired: BigInt(10 ** 30),
  //   amount0Min: 0,
  //   amount1Min: 0,
  //   recipient: acct1.address,
  //   deadline: 10000000000000
  // })

  // // console.log(await nonfungiblePositionManager.positions(1))
  // // console.log(await pool_busd_usdt.liquidity())
  // // console.log("balance0:", (await pool_busd_usdt.balance0()).toString())
  // // console.log((await pool_busd_usdt.balance1()).toString())

  // // const balanceAfterBusd = await busd.balanceOf(acct1.address)
  // // const balanceAfterUsdt = await usdt.balanceOf(acct1.address)
  // // console.log(balanceBeforeBusd.toString())
  // // console.log(balanceBeforeUsdt.toString())
  // // console.log(balanceAfterBusd.toString())
  // // console.log(balanceAfterUsdt.toString())


  // await factory.createNewLottery(busd.address, usdt.address, fee, 2, pool_busd_usdt.address, nonfungiblePositionManager.address)
  // const lottery_busd_usdt = new ethers.Contract(await factory.lotteries(busd.address, usdt.address, fee), json.abi, acct1) as FrogLottery
  await utils.saveAddress(prefix + "Lottery_busd_usdt", lottery_busd_usdt.address)
  // await busd.transfer(lottery_busd_usdt.address, BigInt(10 ** 20))
  // await usdt.transfer(lottery_busd_usdt.address, BigInt(10 ** 20))
  // await lottery_busd_usdt.createPosition(-1000, 1000)

  // // await busd.approve(lottery_busd_usdt.address, BigInt(10 ** 35))
  // // await usdt.approve(lottery_busd_usdt.address, BigInt(10 ** 35))
  console.log('DEPLOYED')
  // return ({ usdc, usdt, busd, pool_busd_usdt, lottery_busd_usdt, SwapRouter, pancakeFactory, router, nonfungiblePositionManager, factory, referal, fee })
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});