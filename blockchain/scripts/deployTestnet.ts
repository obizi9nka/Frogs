const utils = require("./main");
import secret from "../secrets.json"

import hre from "hardhat";
import { ethers } from 'hardhat';
import json from "../artifacts/contracts/frogs/FrogLottery.sol/FrogLottery.json";
import jsonPool from "../artifacts/contracts/v3-core/PancakeV3Pool.sol/PancakeV3Pool.json"
import { ERC20Token, FrogFactory, FrogLottery, FrogReferal, MasterChefV3, TBnb, TCake } from "../typechain-types";
import { NonfungiblePositionManager, SwapRouter, PancakeV3Factory, PancakeV3Pool, FrogSponsorFactory, SmartRouter, PancakeV3LmPoolDeployer, PancakeV3PoolDeployer } from "../v3/typechain-types";
import BN from 'bignumber.js'

import _config from "../scripts/json/constants.json"
const config = _config as any
const prefix = 'sepolia_'

const fee = 500;

export async function main() {
  console.log('deploy testnet')
  const acct1 = new ethers.Wallet(secret.PRIVATE_KEY_1, new ethers.providers.EtherscanProvider('sepolia', 'YQADQIC7H32XZ5KA99PDAJPXGBGAGCYWSQ'))
  // ==================
  //        USDC
  // ==================
  const USDC = await hre.ethers.getContractFactory('ERC20Token');
  const usdc = await USDC.deploy('USDC', "usdc") as ERC20Token;

  await usdc.deployed();
  console.log(1)
  // ==================
  //        USDT
  // ==================
  const USDT = await hre.ethers.getContractFactory('ERC20Token');
  const usdt = await USDT.deploy('USDT', "usdt") as ERC20Token;

  await usdt.deployed();
  console.log(1)
  // ==================
  //        BUSD
  // ==================
  const BUSD = await hre.ethers.getContractFactory('ERC20Token');
  const busd = await BUSD.deploy('BUSD', "busd") as ERC20Token;

  await busd.deployed();
  console.log(1)

  // ==================
  //        BNB
  // ==================
  const BNB = await hre.ethers.getContractFactory('TBnb');
  const wbnb = await BNB.deploy() as TBnb;

  await wbnb.deployed();
  console.log(1)

  // ==================
  //        CAKE
  // ==================
  const CAKE = await hre.ethers.getContractFactory('ERC20Token');
  const cake = await CAKE.deploy('CAKE', 'cake') as ERC20Token;

  await cake.deployed();

  // ==================
  //     FrogReferal
  // ==================
  const Referal = await hre.ethers.getContractFactory('FrogReferal');
  const referal = await Referal.deploy(acct1.address, config[prefix + 'addressOfPrivateKey'], cake.address) as FrogReferal;

  await referal.deployed();
  console.log(1)

  // ==================
  //   UniswapV3PoolDeployer
  // ==================
  const PancakeV3PoolDeployerr = await hre.ethers.getContractFactory('PancakeV3PoolDeployer');
  const pancakeV3PoolDeployer = await PancakeV3PoolDeployerr.deploy() as PancakeV3PoolDeployer;
  await pancakeV3PoolDeployer.deployed();


  // ==================
  //   PancakeFactory
  // ==================
  const PancakeFactory = await hre.ethers.getContractFactory('PancakeV3Factory');
  const pancakeFactory = await PancakeFactory.deploy(pancakeV3PoolDeployer.address) as PancakeV3Factory;

  await pancakeFactory.deployed();
  console.log(1)
  await pancakeV3PoolDeployer.setFactoryAddress(pancakeFactory.address)

  // const tx = 
  // await tx.wait()
  await executeFunc(pancakeFactory.createPool(busd.address, usdt.address, fee))
  await executeFunc(pancakeFactory.createPool(busd.address, usdc.address, fee))
  await executeFunc(pancakeFactory.createPool(usdt.address, usdc.address, fee))

  const pool_busd_usdt = new ethers.Contract(await pancakeFactory.getPool(busd.address, usdt.address, fee), jsonPool.abi, acct1) as PancakeV3Pool
  const pool_busd_usdc = new ethers.Contract(await pancakeFactory.getPool(busd.address, usdc.address, fee), jsonPool.abi, acct1) as PancakeV3Pool
  const pool_usdt_usdc = new ethers.Contract(await pancakeFactory.getPool(usdt.address, usdc.address, fee), jsonPool.abi, acct1) as PancakeV3Pool

  function encodePriceSqrt(reserve1: any, reserve0: any): BN {
    const t = new BN(reserve1)
      .div(reserve0)
      .sqrt()
      .multipliedBy(new BN(2).pow(96))
      .integerValue(3)
    return t
  }

  const rates = {
    busd_usdt: {
      token0: 1,
      token1: 1
    },
    busd_usdc: {
      token0: 1,
      token1: 1
    },
    usdt_usdc: {
      token0: 1,
      token1: 1
    },
  }

  const price_busd_usdt = await pool_busd_usdt.token0() == busd.address ? BigInt(encodePriceSqrt(rates.busd_usdt.token0, rates.busd_usdt.token1).toNumber()) : BigInt(encodePriceSqrt(rates.busd_usdt.token1, rates.busd_usdt.token0).toNumber()) // 2x1
  const price_busd_stable = await pool_busd_usdc.token0() == busd.address ? BigInt(encodePriceSqrt(rates.busd_usdc.token0, rates.busd_usdc.token1).toNumber()) : BigInt(encodePriceSqrt(rates.busd_usdc.token1, rates.busd_usdc.token0).toNumber()) // 2x1
  const price_usdt_stable = await pool_usdt_usdc.token0() == usdt.address ? BigInt(encodePriceSqrt(rates.usdt_usdc.token0, rates.usdt_usdc.token1).toNumber()) : BigInt(encodePriceSqrt(rates.usdt_usdc.token1, rates.usdt_usdc.token0).toNumber()) // 2x1


  // await pool_busd_usdt.initialize(price))
  await executeFunc(pool_busd_usdt.initialize(price_busd_usdt))
  await executeFunc(pool_busd_usdc.initialize(price_busd_stable))
  await executeFunc(pool_usdt_usdc.initialize(price_usdt_stable))
  // ==================
  //  NonfungiblePositionManager
  // ==================
  const NonfungiblePositionManager = await hre.ethers.getContractFactory('NonfungiblePositionManager');
  const nonfungiblePositionManager = await NonfungiblePositionManager.deploy(pancakeV3PoolDeployer.address, pancakeFactory.address, wbnb.address, ethers.constants.AddressZero) as NonfungiblePositionManager;

  await nonfungiblePositionManager.deployed();
  console.log(1)



  // ==================
  //       Router
  // ==================
  const SmartRouterHelper = await ethers.getContractFactory("SmartRouterHelper");
  const smartRouterHelper = await SmartRouterHelper.deploy();
  await smartRouterHelper.deployed();

  const SmartRouter = await hre.ethers.getContractFactory('SmartRouter', {
    libraries: {
      SmartRouterHelper: smartRouterHelper.address,
    }
  });

  const router = await SmartRouter.deploy(ethers.constants.AddressZero, pancakeV3PoolDeployer.address, pancakeFactory.address, nonfungiblePositionManager.address, ethers.constants.AddressZero, ethers.constants.AddressZero, wbnb.address) as SmartRouter
  await router.deployed();
  // const SwapRouter = await hre.ethers.getContractFactory('SwapRouter');
  // const router = await SwapRouter.deploy(pancakeV3PoolDeployer.address, pancakeFactory.address, wbnb.address) as SwapRouter
  // await router.deployed();
  console.log(1)


  // ==================
  //     MasterChef
  // ==================
  const MasterChef = await hre.ethers.getContractFactory('MasterChefV3')
  const mc = await MasterChef.deploy(cake.address, nonfungiblePositionManager.address, wbnb.address) as MasterChefV3
  await mc.deployed();


  // ==================
  //   LMPoolDeployer
  // ==================
  const PancakeV3LmPoolDeployerr = await hre.ethers.getContractFactory('PancakeV3LmPoolDeployer')
  const LMPoolDeployer = await PancakeV3LmPoolDeployerr.deploy(mc.address) as PancakeV3LmPoolDeployer
  await LMPoolDeployer.deployed();

  await executeFunc(pancakeFactory.setLmPoolDeployer(LMPoolDeployer.address))
  await executeFunc(mc.setLMPoolDeployer(LMPoolDeployer.address))
  await executeFunc(mc.add(1780, pool_busd_usdt.address, false))

  const tokenCakeAmount = BigInt(1e23)

  await executeFunc(cake.getTokens(tokenCakeAmount))
  await executeFunc(cake.approve(mc.address, ethers.constants.MaxUint256))
  await executeFunc(mc.setReceiver(acct1.address))
  await executeFunc(mc.upkeep(tokenCakeAmount, 60 * 60 * 24 * 365, true))

  // ==================
  //    FrogFactory
  // ==================
  const FrogFactory = await hre.ethers.getContractFactory('FrogFactory');
  const factory = await FrogFactory.deploy(referal.address, ethers.constants.AddressZero, pancakeFactory.address, acct1.address, router.address, mc.address, cake.address) as FrogFactory;

  await factory.deployed();

  executeFunc(await referal.setFactoryAddress(factory.address))
  const TOKENS_VALUE_20 = BigInt(10 ** 35)


  await executeFunc(busd.getTokens(TOKENS_VALUE_20));
  await executeFunc(usdt.getTokens(TOKENS_VALUE_20));
  await executeFunc(usdc.getTokens(TOKENS_VALUE_20));


  await executeFunc(busd.approve(nonfungiblePositionManager.address, TOKENS_VALUE_20))
  await executeFunc(usdc.approve(nonfungiblePositionManager.address, TOKENS_VALUE_20))
  await executeFunc(usdt.approve(nonfungiblePositionManager.address, TOKENS_VALUE_20))

  const positionData = await pool_busd_usdt.slot0()
  const tickSpacing = await pool_busd_usdt.tickSpacing()

  const tickLower = positionData.tick - positionData.tick % tickSpacing - tickSpacing * 100
  const tickUpper = positionData.tick - positionData.tick % tickSpacing + tickSpacing * 100

  const _positionData = await pool_busd_usdc.slot0()
  const _tickSpacing = await pool_busd_usdc.tickSpacing()

  const _tickLower = _positionData.tick - _positionData.tick % _tickSpacing - _tickSpacing * 100
  const _tickUpper = _positionData.tick - _positionData.tick % _tickSpacing + _tickSpacing * 100

  const __positionData = await pool_usdt_usdc.slot0()
  const __tickSpacing = await pool_usdt_usdc.tickSpacing()

  const __tickLower = __positionData.tick - __positionData.tick % __tickSpacing - __tickSpacing * 100
  const __tickUpper = __positionData.tick - __positionData.tick % __tickSpacing + __tickSpacing * 100

  let params = {
    token0: busd.address,
    token1: usdt.address,
    fee,
    tickLower,
    tickUpper,
    amount0Desired: BigInt(1e30 - 1e29),
    amount1Desired: BigInt(1e30 - 1e29),
    amount0Min: 1,
    amount1Min: 1,
    recipient: acct1.address,
    deadline: 10000000000000
  }


  let _params = {
    token0: busd.address,
    token1: usdc.address,
    fee,
    tickLower: _tickLower,
    tickUpper: _tickUpper,
    amount0Desired: BigInt(1e30 - 1e29),
    amount1Desired: BigInt(1e30 - 1e29),
    amount0Min: 1,
    amount1Min: 1,
    recipient: acct1.address,
    deadline: 10000000000000
  }

  let paramsStable = {
    token0: usdt.address,
    token1: usdc.address,
    fee,
    tickLower: __tickLower,
    tickUpper: __tickUpper,
    amount0Desired: BigInt(1e30 - 1e29),
    amount1Desired: BigInt(1e30 - 1e29),
    amount0Min: 1,
    amount1Min: 1,
    recipient: acct1.address,
    deadline: 10000000000000
  }

  await executeFunc(nonfungiblePositionManager.mint(params))

  // params.token0 = usdt.address
  // params.token1 = usdc.address
  await executeFunc(nonfungiblePositionManager.mint(paramsStable))

  params.token0 = busd.address
  params.token1 = usdc.address
  await executeFunc(nonfungiblePositionManager.mint(_params))



  await executeFunc(factory.createNewLottery(busd.address, usdt.address, fee, pool_busd_usdt.address, nonfungiblePositionManager.address, usdc.address))
  const lottery_busd_usdt = new ethers.Contract(await factory.lotteries(busd.address, usdt.address, fee), json.abi, acct1) as FrogLottery
  await executeFunc(busd.approve(lottery_busd_usdt.address, 1))
  await executeFunc(usdt.approve(lottery_busd_usdt.address, 1))
  await executeFunc(lottery_busd_usdt.createPosition(tickLower, tickUpper))


  // await executeFunc(busd.approve(lottery_busd_usdt.address, BigInt(10 ** 35)))
  // await executeFunc(usdt.approve(lottery_busd_usdt.address, BigInt(10 ** 35)))


  await utils.saveAddress(prefix + "Pool_busd_usdt_fee", fee)
  await utils.saveAddress(prefix + "USDC", usdc.address)
  await utils.saveAddress(prefix + "USDT", usdt.address)
  await utils.saveAddress(prefix + "BUSD", busd.address)
  await utils.saveAddress(prefix + "CAKE", cake.address)
  await utils.saveAddress(prefix + "WBNB", wbnb.address)
  await utils.saveAddress(prefix + "FrogReferal", referal.address)
  await utils.saveAddress(prefix + "PancakeFactory", pancakeFactory.address)
  await utils.saveAddress(prefix + "Pool_busd_usdt", pool_busd_usdt.address)
  await utils.saveAddress(prefix + "Pool_busd_usdc", pool_busd_usdc.address)
  await utils.saveAddress(prefix + "Pool_usdt_usdc", pool_usdt_usdc.address)
  await utils.saveAddress(prefix + "NonfungiblePositionManager", nonfungiblePositionManager.address)
  await utils.saveAddress(prefix + "MC", mc.address)
  await utils.saveAddress(prefix + "SwapRouter", router.address)
  await utils.saveAddress(prefix + "FrogFactory", factory.address)
  await utils.saveAddress(prefix + "Lottery_busd_usdt", lottery_busd_usdt.address)

  return ({ usdc, usdt, busd, cake, wbnb, pool_busd_usdt, pool_busd_usdc, pool_usdt_usdc, lottery_busd_usdt, pancakeFactory, router, nonfungiblePositionManager, factory, pancakeV3PoolDeployer, referal, fee, mc })
}

const executeFunc = async (func: any) => {
  console.log(func.toString())
  const tx = await func
  await tx.wait()
  return tx
}


main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
