import hre from "hardhat";
import { ethers } from 'hardhat';
import json from "../../artifacts/contracts/frogs/FrogLottery.sol/FrogLottery.json";
import jsonPool from "../../artifacts/contracts/v3-core/PancakeV3Pool.sol/PancakeV3Pool.json"
import { ERC20Token, FrogFactory, FrogLottery, FrogReferal, MasterChefV3, TBnb, TCake, PancakeV3PoolDeployer } from "../../typechain-types";
import { NonfungiblePositionManager, SwapRouter, PancakeV3Factory, PancakeV3Pool, FrogSponsorFactory, PancakeV3LmPoolDeployer } from "../../v3/typechain-types";
import { BigNumber } from "ethers";
import BN from 'bignumber.js'
import { TickMath } from "@uniswap/v3-sdk"

// after initialize funcs will change on values you can find in PancakeV3Pool.sol
let fee = 100;

export async function deployAll() {
    const [acct1, acct2, acct3, acct4] = await ethers.getSigners();
    // ==================
    //        USDC
    // ==================
    const USDC = await hre.ethers.getContractFactory('ERC20Token');
    const usdc = await USDC.deploy('USDC', "usdc") as ERC20Token;

    await usdc.deployed();
    // ==================
    //        USDT
    // ==================
    const USDT = await hre.ethers.getContractFactory('ERC20Token');
    const usdt = await USDT.deploy('USDT', "usdt") as ERC20Token;

    await usdt.deployed();
    // ==================
    //        BUSD
    // ==================
    const BUSD = await hre.ethers.getContractFactory('ERC20Token');
    const busd = await BUSD.deploy('BUSD', "busd") as ERC20Token;

    await busd.deployed();

    // ==================
    //        BNB
    // ==================
    const BNB = await hre.ethers.getContractFactory('TBnb');
    const wbnb = await BNB.deploy() as TBnb;

    await wbnb.deployed();

    // ==================
    //        BNB
    // ==================
    const CAKE = await hre.ethers.getContractFactory('TCake');
    const cake = await CAKE.deploy() as TCake;

    await cake.deployed();

    // ==================
    //     FrogReferal
    // ==================
    const Referal = await hre.ethers.getContractFactory('FrogReferal');
    const referal = await Referal.deploy(acct1.address, acct1.address) as FrogReferal;

    await referal.deployed();

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

    await pancakeV3PoolDeployer.setFactoryAddress(pancakeFactory.address)

    await pancakeFactory.createPool(busd.address, usdt.address, fee)
    await pancakeFactory.createPool(busd.address, usdc.address, fee)
    await pancakeFactory.createPool(usdt.address, usdc.address, fee)


    const pool_busd_usdt = new ethers.Contract(await pancakeFactory.getPool(busd.address, usdt.address, fee), jsonPool.abi, acct1) as PancakeV3Pool
    const pool_busd_usdc = new ethers.Contract(await pancakeFactory.getPool(busd.address, usdc.address, fee), jsonPool.abi, acct1) as PancakeV3Pool
    const pool_usdt_usdc = new ethers.Contract(await pancakeFactory.getPool(usdt.address, usdc.address, fee), jsonPool.abi, acct1) as PancakeV3Pool

    // отдаешь х - получаешь y
    function encodePriceSqrt(reserve1: any, reserve0: any): BN {
        const t = new BN(reserve1)
            .div(reserve0)
            .sqrt()
            .multipliedBy(new BN(2).pow(96))
            .integerValue(3)
        return t
    }
    // const price = BigInt(79228162514264337593543950336) // encodePriceSqrt(1, 1)
    const sqrtPrice_0dot5 = BigInt(encodePriceSqrt(2, 3).toNumber())
    const sqrtPrice_1 = BigInt(encodePriceSqrt(2, 1).toNumber())
    const sqrtPrice_2 = BigInt(encodePriceSqrt(3, 1).toNumber())
    // 1000000000000000000
    //     645593909830494435
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

    await pool_busd_usdt.initialize(price_busd_usdt)
    await pool_busd_usdc.initialize(price_busd_stable)
    await pool_usdt_usdc.initialize(price_usdt_stable)

    const isReversed_pool_busd_usdt = await pool_busd_usdt.token0() != busd.address
    const isReversed_pool_busd_usdc = await pool_busd_usdc.token0() != busd.address
    const isReversed_pool_usdt_usdc = await pool_usdt_usdc.token0() != usdt.address

    console.log(isReversed_pool_busd_usdt)
    console.log(isReversed_pool_busd_usdc)
    console.log(isReversed_pool_usdt_usdc)

    const sqrtPrice_pool_busd_usdt = (await pool_busd_usdt.slot0()).sqrtPriceX96
    const sqrtPrice_pool_busd_usdc = (await pool_busd_usdc.slot0()).sqrtPriceX96
    const sqrtPrice_pool_usdt_usdc = (await pool_usdt_usdc.slot0()).sqrtPriceX96

    const getPrice = (first: BN, secnd: BN | number, third: BN) => {
        return first.multipliedBy(secnd).div(third)
    }

    // console.log('pool_busd_usdt', isReversed_pool_busd_usdt ? getPrice(BN(BigInt(2 ** 192).toString()), 1, BN(sqrtPrice_pool_busd_usdt.pow(2).toString())).toString() : getPrice(BN(sqrtPrice_pool_busd_usdt.pow(2).toString()), 1, BN(BigInt(2 ** 192).toString())).toString())
    // console.log('pool_busd_usdc', isReversed_pool_busd_usdc ? getPrice(BN(BigInt(2 ** 192).toString()), 1, BN(sqrtPrice_pool_busd_usdc.pow(2).toString())).toString() : getPrice(BN(sqrtPrice_pool_busd_usdc.pow(2).toString()), 1, BN(BigInt(2 ** 192).toString())).toString())
    // console.log('pool_usdt_usdc', isReversed_pool_usdt_usdc ? getPrice(BN(BigInt(2 ** 192).toString()), 1, BN(sqrtPrice_pool_usdt_usdc.pow(2).toString())).toString() : getPrice(BN(sqrtPrice_pool_usdt_usdc.pow(2).toString()), 1, BN(BigInt(2 ** 192).toString())).toString())
    // console.log('pool_busd_usdt-tick', (await pool_busd_usdt.slot0()).tick)
    // console.log('pool_busd_usdc-tick', (await pool_busd_usdc.slot0()).tick)
    // console.log('pool_usdt_usdc-tick', (await pool_usdt_usdc.slot0()).tick)
    // ==================
    //  NonfungiblePositionManager
    // ==================
    const NonfungiblePositionManager = await hre.ethers.getContractFactory('NonfungiblePositionManager');
    const nonfungiblePositionManager = await NonfungiblePositionManager.deploy(pancakeV3PoolDeployer.address, pancakeFactory.address, wbnb.address, ethers.constants.AddressZero) as NonfungiblePositionManager;

    await nonfungiblePositionManager.deployed();

    // ==================
    //       Router
    // ==================
    const SwapRouter = await hre.ethers.getContractFactory('SwapRouter');
    const router = await SwapRouter.deploy(pancakeV3PoolDeployer.address, pancakeFactory.address, wbnb.address) as SwapRouter
    await router.deployed();

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

    await pancakeFactory.setLmPoolDeployer(LMPoolDeployer.address)
    await mc.setLMPoolDeployer(LMPoolDeployer.address);
    await mc.add(0, pool_busd_usdt.address, false);

    // ==================
    //    FrogFactory
    // ==================
    const FrogFactory = await hre.ethers.getContractFactory('FrogFactory');
    const factory = await FrogFactory.deploy(referal.address, ethers.constants.AddressZero, pancakeFactory.address, acct1.address, router.address, mc.address) as FrogFactory;

    await factory.deployed();

    // ==================
    //    FrogSponsorFactory
    // ==================
    const _FrogSponsorFactory = await hre.ethers.getContractFactory('FrogSponsorFactory');
    const frogSponsorfactory = await _FrogSponsorFactory.deploy(factory.address) as FrogSponsorFactory;

    // await frogSponsorfactory.deployed();

    // await factory.setSponsorFactoryAddress(frogSponsorfactory.address)

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

    // 2005104164790027959871634583966404
    // 191757530477355301479181766273477
    console.log(1)

    await nonfungiblePositionManager.mint(params)
    console.log(1)

    // params.token0 = usdt.address
    // params.token1 = usdc.address
    await nonfungiblePositionManager.mint(paramsStable)
    console.log(1)

    params.token0 = busd.address
    params.token1 = usdc.address
    await nonfungiblePositionManager.mint(_params)
    console.log(1)

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
    await lottery_busd_usdt.createPosition(tickLower, tickUpper)


    await busd.approve(lottery_busd_usdt.address, BigInt(10 ** 35))
    await usdt.approve(lottery_busd_usdt.address, BigInt(10 ** 35))
    await usdc.approve(lottery_busd_usdt.address, BigInt(10 ** 35))
    await busd.connect(acct2).approve(lottery_busd_usdt.address, BigInt(10 ** 35))
    await usdt.connect(acct2).approve(lottery_busd_usdt.address, BigInt(10 ** 35))
    await usdc.connect(acct2).approve(lottery_busd_usdt.address, BigInt(10 ** 35))

    await busd.approve(mc.address, BigInt(10 ** 35))
    await usdt.approve(mc.address, BigInt(10 ** 35))
    await usdc.approve(mc.address, BigInt(10 ** 35))
    await busd.connect(acct2).approve(mc.address, BigInt(10 ** 35))
    await usdt.connect(acct2).approve(mc.address, BigInt(10 ** 35))
    await usdc.connect(acct2).approve(mc.address, BigInt(10 ** 35))

    await busd.approve(router.address, BigInt(10 ** 36))
    await usdt.approve(router.address, BigInt(10 ** 36))
    await usdc.approve(router.address, BigInt(10 ** 36))

    return ({ usdc, usdt, busd, pool_busd_usdt, pool_busd_usdc, pool_usdt_usdc, lottery_busd_usdt, pancakeFactory, router, nonfungiblePositionManager, factory, pancakeV3PoolDeployer, referal, fee, frogSponsorfactory })
}
