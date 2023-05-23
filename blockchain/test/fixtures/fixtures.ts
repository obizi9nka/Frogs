import hre from "hardhat";
import { ethers } from 'hardhat';
import json from "../../artifacts/contracts/frogs/FrogLottery.sol/FrogLottery.json";
import jsonPool from "../../artifacts/contracts/core/UniswapV3Pool.sol/UniswapV3Pool.json"
import { ERC20Token, FrogFactory, FrogLottery, FrogReferal, TBnb } from "../../typechain-types";
import { allContractsFromDeploy } from "../../@types";
import { NonfungiblePositionManager, SwapRouter, UniswapV3Factory, UniswapV3Pool } from "../../v3/typechain-types";
// import { BigNumber } from "ethers";
import BigNumber from 'bignumber.js'
import { TickMath } from "@uniswap/v3-sdk"



const fee = 500;

export async function deployAll() {
    const [acct1, acct2, acct3, acct4] = await ethers.getSigners();
    // ==================
    //        USDC
    // ==================
    const USDC = await hre.ethers.getContractFactory('ERC20Token');
    const usdc = await USDC.deploy('USDC', "usdc") as ERC20Token;

    await usdc.deployed();
    // console.log(usdc.address)
    // ==================
    //        USDT
    // ==================
    const USDT = await hre.ethers.getContractFactory('ERC20Token');
    const usdt = await USDT.deploy('USDT', "usdt") as ERC20Token;

    await usdt.deployed();
    // console.log(usdt.address)
    // ==================
    //        BUSD
    // ==================
    const BUSD = await hre.ethers.getContractFactory('ERC20Token');
    const busd = await BUSD.deploy('BUSD', "busd") as ERC20Token;

    await busd.deployed();
    // console.log(busd.address)

    // ==================
    //        BNB
    // ==================
    const BNB = await hre.ethers.getContractFactory('TBnb');
    const wbnb = await BNB.deploy() as TBnb;

    await wbnb.deployed();
    // console.log(wbnb.address)

    // ==================
    //     FrogReferal
    // ==================
    const Referal = await hre.ethers.getContractFactory('FrogReferal');
    const referal = await Referal.deploy(acct1.address, acct1.address) as FrogReferal;

    await referal.deployed();
    // console.log(referal.address)


    // ==================
    //   PancakeFactory
    // ==================
    const PancakeFactory = await hre.ethers.getContractFactory('UniswapV3Factory');
    const pancakeFactory = await PancakeFactory.deploy() as UniswapV3Factory;

    await pancakeFactory.deployed();
    // console.log(pancakeFactory.address)


    await pancakeFactory.createPool(busd.address, usdt.address, fee)
    await pancakeFactory.createPool(busd.address, usdc.address, fee)
    await pancakeFactory.createPool(usdt.address, usdc.address, fee)

    const pool_busd_usdt = new ethers.Contract(await pancakeFactory.getPool(busd.address, usdt.address, fee), jsonPool.abi, acct1) as UniswapV3Pool
    const pool_busd_usdc = new ethers.Contract(await pancakeFactory.getPool(busd.address, usdc.address, fee), jsonPool.abi, acct1) as UniswapV3Pool
    const pool_usdt_usdc = new ethers.Contract(await pancakeFactory.getPool(usdt.address, usdc.address, fee), jsonPool.abi, acct1) as UniswapV3Pool

    // 79204448054751562486699905150
    // 79192444239363564201206
    // 1771580069046490802230235074
    // 111111179192444239363564201206 // норм в ремиксе 1
    // 80000000000000000000000000000000000000 // не норм в ремиксе 10 ** 18
    // 211113179192444239363564201206 // норм в ремиксе 7
    // отдаешь х - получаешь y
    function encodePriceSqrt(reserve1: any, reserve0: any): BigNumber {
        const t = new BigNumber(reserve1)
            .div(reserve0)
            .sqrt()
            .multipliedBy(new BigNumber(2).pow(96))
            .integerValue(3)
        return t
    }
    // console.log(encodePriceSqrt(2, 1))
    // process.exit()
    // const price = BigInt(79228162514264337593543950336) // encodePriceSqrt(1, 1)
    console.log(BigNumber(encodePriceSqrt(1, 2).toNumber()).pow(2).div(2 ** 192).toString())
    console.log(BigNumber(encodePriceSqrt(1, 1).toNumber()).pow(2).div(2 ** 192).toString())
    console.log(BigNumber(encodePriceSqrt(2, 1).toNumber()).pow(2).div(2 ** 192).toString())
    const price_busd_usdt = BigInt(encodePriceSqrt(2, 1).toNumber())   // 21 // 1busd == 2usdt 
    const price_busd_stable = BigInt(encodePriceSqrt(2, 1).toNumber()) // 12
    const price_usdt_stable = BigInt(encodePriceSqrt(1, 1).toNumber()) // 11

    await pool_busd_usdt.initialize(price_busd_usdt)
    await pool_busd_usdc.initialize(price_busd_stable)
    await pool_usdt_usdc.initialize(price_usdt_stable)

    console.log(await pool_busd_usdc.token0() == busd.address)
    console.log(await pool_busd_usdt.token0() == busd.address)
    console.log(await pool_usdt_usdc.token0() == usdt.address)

    console.log('pool_busd_usdt', (await pool_busd_usdt.slot0()).sqrtPriceX96.pow(2).div(BigInt(2 ** 192)))
    console.log('pool_busd_usdc', (await pool_busd_usdc.slot0()).sqrtPriceX96.pow(2).div(BigInt(2 ** 192)))
    console.log('pool_usdt_usdc', (await pool_usdt_usdc.slot0()).sqrtPriceX96.pow(2).div(BigInt(2 ** 192)))

    // ==================
    //  NonfungiblePositionManager
    // ==================
    const NonfungiblePositionManager = await hre.ethers.getContractFactory('NonfungiblePositionManager');
    const nonfungiblePositionManager = await NonfungiblePositionManager.deploy(pancakeFactory.address, ethers.constants.AddressZero, ethers.constants.AddressZero) as NonfungiblePositionManager;

    await nonfungiblePositionManager.deployed();

    // ==================
    //       Router
    // ==================
    const SwapRouter = await hre.ethers.getContractFactory('SwapRouter');
    const router = await SwapRouter.deploy(pancakeFactory.address, wbnb.address) as SwapRouter
    await router.deployed();

    // ==================
    //       FrogFactory
    // ==================
    const FrogFactory = await hre.ethers.getContractFactory('FrogFactory');
    const factory = await FrogFactory.deploy(referal.address, ethers.constants.AddressZero, pancakeFactory.address, acct1.address, router.address) as FrogFactory;

    await factory.deployed();
    // console.log(factory', factory.address)

    await referal.setFactoryAddress(factory.address)

    const TOKENS_VALUE_20 = BigInt(10 ** 35)
    await busd.connect(acct1).getTokens(TOKENS_VALUE_20);
    await busd.connect(acct2).getTokens(TOKENS_VALUE_20);

    await usdt.connect(acct1).getTokens(TOKENS_VALUE_20);
    await usdt.connect(acct2).getTokens(TOKENS_VALUE_20);

    await usdc.connect(acct1).getTokens(TOKENS_VALUE_20);
    await usdc.connect(acct2).getTokens(TOKENS_VALUE_20);

    await usdc.connect(acct2).approve(nonfungiblePositionManager.address, TOKENS_VALUE_20)
    await usdt.connect(acct2).approve(nonfungiblePositionManager.address, TOKENS_VALUE_20)
    await busd.connect(acct2).approve(nonfungiblePositionManager.address, TOKENS_VALUE_20)

    await busd.approve(nonfungiblePositionManager.address, TOKENS_VALUE_20)
    await usdc.approve(nonfungiblePositionManager.address, TOKENS_VALUE_20)
    await usdt.approve(nonfungiblePositionManager.address, TOKENS_VALUE_20)

    const tickLower = -10000
    const tickUpper = 10000

    let params = {
        token0: busd.address,
        token1: usdt.address,
        fee,
        tickLower,
        tickUpper,
        amount0Desired: BigInt(10 ** 30),
        amount1Desired: BigInt(10 ** 30),
        amount0Min: 1,
        amount1Min: 1,
        recipient: acct1.address,
        deadline: 10000000000000
    }
    await nonfungiblePositionManager.mint(params)

    params.token0 = usdt.address
    params.token1 = usdc.address
    await nonfungiblePositionManager.mint(params)

    params.token0 = busd.address
    params.token1 = usdc.address
    await nonfungiblePositionManager.mint(params)

    // console.log(await nonfungiblePositionManager.positions(1))
    // console.log(await pool_busd_usdt.liquidity())
    // console.log("balance0:", (await pool_busd_usdt.balance0()).toString())
    // console.log((await pool_busd_usdt.balance1()).toString())

    const balanceAfterBusd = await busd.balanceOf(acct1.address)
    const balanceAfterUsdt = await usdt.balanceOf(acct1.address)
    // console.log(balanceBeforeBusd.toString())
    // console.log(balanceBeforeUsdt.toString())
    // console.log(balanceAfterBusd.toString())
    // console.log(balanceAfterUsdt.toString())


    await factory.createNewLottery(busd.address, usdt.address, fee, pool_busd_usdt.address, nonfungiblePositionManager.address, usdc.address)
    const lottery_busd_usdt = new ethers.Contract(await factory.lotteries(busd.address, usdt.address, fee), json.abi, acct1) as FrogLottery
    await busd.approve(lottery_busd_usdt.address, 1)
    await usdt.approve(lottery_busd_usdt.address, 1)
    await lottery_busd_usdt.createPosition(-10000, 10000)


    // console.log(lottery_busd_usdt', lottery_busd_usdt.address)


    await busd.approve(lottery_busd_usdt.address, BigInt(10 ** 35))
    await usdt.approve(lottery_busd_usdt.address, BigInt(10 ** 35))
    await usdc.approve(lottery_busd_usdt.address, BigInt(10 ** 35))
    await busd.connect(acct2).approve(lottery_busd_usdt.address, BigInt(10 ** 35))
    await usdt.connect(acct2).approve(lottery_busd_usdt.address, BigInt(10 ** 35))
    await usdc.connect(acct2).approve(lottery_busd_usdt.address, BigInt(10 ** 35))


    await busd.approve(router.address, BigInt(10 ** 36))
    await usdt.approve(router.address, BigInt(10 ** 36))
    await usdc.approve(router.address, BigInt(10 ** 36))

    return ({ usdc, usdt, busd, pool_busd_usdt, pool_busd_usdc, pool_usdt_usdc, lottery_busd_usdt, pancakeFactory, router, nonfungiblePositionManager, factory, referal, fee })
}
