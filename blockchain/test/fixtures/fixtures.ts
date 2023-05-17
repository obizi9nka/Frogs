import hre from "hardhat";
import { ethers } from 'hardhat';
import json from "../../artifacts/contracts/frogs/FrogLottery.sol/FrogLottery.json";
import jsonPool from "../../artifacts/contracts/core/UniswapV3Pool.sol/UniswapV3Pool.json"
import { ERC20Token, Factory, FrogLottery, FrogReferal, TBnb } from "../../typechain-types";
import { allContractsFromDeploy } from "../../@types";
import { NonfungiblePositionManager, SwapRouter, UniswapV3Factory, UniswapV3Pool } from "../../v3/typechain-types";
import { BigNumber } from "ethers";
import bn from 'bignumber.js'

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
    const bnb = await BNB.deploy() as TBnb;

    await bnb.deployed();
    // console.log(bnb.address)

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

    const fee = 500;

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
    function encodePriceSqrt(reserve1: any, reserve0: any): BigNumber {
        return BigNumber.from(
            new bn(reserve1)
                .div(reserve0)
                .sqrt()
                .multipliedBy(new bn(2).pow(96))
                .integerValue(3)
                .toString()
        )
    }
    // console.log(encodePriceSqrt(2, 1))
    // process.exit()
    const price = BigInt(79228162514264337593543950336) // encodePriceSqrt(1, 1)
    // const rrr = BigInt(112045541949572279837330081938) // encodePriceSqrt(2, 1)

    await pool_busd_usdt.initialize(price)
    await pool_busd_usdc.initialize(price)
    await pool_usdt_usdc.initialize(price)
    // console.log(await pool_busd_usdt.slot0())
    // console.log(await pool_busd_usdt.liquidity())
    // console.log(pool_busd_usdt', pool_busd_usdt.address)

    // ==================
    //  NonfungiblePositionManager
    // ==================
    const NonfungiblePositionManager = await hre.ethers.getContractFactory('NonfungiblePositionManager');
    const nonfungiblePositionManager = await NonfungiblePositionManager.deploy(pancakeFactory.address, ethers.constants.AddressZero, ethers.constants.AddressZero) as NonfungiblePositionManager;

    await nonfungiblePositionManager.deployed();
    // console.log(nonfungiblePositionManager', nonfungiblePositionManager.address)

    // ==================
    //       Router
    // ==================
    const SwapRouter = await hre.ethers.getContractFactory('SwapRouter');
    const router = await SwapRouter.deploy(pancakeFactory.address, bnb.address) as SwapRouter
    await router.deployed();
    // console.log(router', router.address)

    // ==================
    //       Factory
    // ==================
    const Factory = await hre.ethers.getContractFactory('Factory');
    const factory = await Factory.deploy(referal.address, ethers.constants.AddressZero, pancakeFactory.address, acct1.address, router.address) as Factory;

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


    const balanceBeforeBusd = await busd.balanceOf(acct1.address)
    const balanceBeforeUsdt = await usdt.balanceOf(acct1.address)

    let params = {
        token0: busd.address,
        token1: usdt.address,
        fee,
        tickLower: -100,
        tickUpper: 100,
        amount0Desired: BigInt(10 ** 30),
        amount1Desired: BigInt(10 ** 30),
        amount0Min: 0,
        amount1Min: 0,
        recipient: acct1.address,
        deadline: 10000000000000
    }

    await nonfungiblePositionManager.mint(params)

    params.token0 = usdt.address
    params.token1 = usdc.address
    await nonfungiblePositionManager.mint(params)

    // params.token0 = busd.address
    // params.token1 = usdc.address
    // await nonfungiblePositionManager.mint(params)

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


    await factory.createNewLottery(busd.address, usdt.address, fee, 2, pool_busd_usdt.address, nonfungiblePositionManager.address, usdc.address)
    const lottery_busd_usdt = new ethers.Contract(await factory.lotteries(busd.address, usdt.address, fee), json.abi, acct1) as FrogLottery
    await busd.transfer(lottery_busd_usdt.address, BigInt(10 ** 20))
    await usdt.transfer(lottery_busd_usdt.address, BigInt(10 ** 20))
    await lottery_busd_usdt.createPosition(-1000, 1000)


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

    // await pancakeFactory.createPair(cake.address, bnb.address, true)
    // await pancakeFactory.createPair(cake.address, usdt.address, false)
    // await pancakeFactory.createPair(cake.address, usdc.address, false)
    // await pancakeFactory.createPair(bnb.address, usdt.address, false)
    // await pancakeFactory.createPair(usdt.address, usdc.address, false)
    // // ==================
    // //       Factory
    // // ==================
    // const Factory = await hre.ethers.getContractFactory('Factory');
    // const factory = await Factory.deploy(referal.address, bnb.address, pancakeFactory.address, acct1.address);

    // await factory.deployed();
    // await referal.setBeneficiary(acct4.address) // for coverage
    // await referal.connect(acct4).setFactoryAddress(factory.address) // acct4 for coverage
    // await referal.connect(acct4).setBeneficiary(acct1.address) // for coverage

    // await factory.createNewLottery(cake.address, bnb.address, 1)
    // await factory.createNewLottery(cake.address, usdt.address, 2)
    // await factory.createNewLottery(bnb.address, usdt.address, 2) // just for coverage

    // // ==================
    // //     MasterChef
    // // ==================
    // const SyrupBar = await hre.ethers.getContractFactory('SyrupBar');
    // const syrupBar = await SyrupBar.deploy(cake.address);

    // await syrupBar.deployed();

    // const MasterChef = await hre.ethers.getContractFactory('MasterChef');
    // const masterChef = await MasterChef.deploy(cake.address, syrupBar.address, acct1.address, BigInt(40 * 10 ** 18), 0);

    // await masterChef.deployed();
    // // ==================
    // //       Router
    // // ==================
    // const Router = await hre.ethers.getContractFactory('PancakeRouter');
    // const router = await Router.deploy(pancakeFactory.address, bnb.address);
    // await router.deployed();


    // const lotteryAddress = await factory.lotteries(cake.address, bnb.address)
    // const lotteryAddressERC20 = await factory.lotteries(cake.address, usdt.address)

    // const TOKENS_VALUE_20 = BigInt(10 ** 35)
    // await cake.connect(acct1).getTokens(TOKENS_VALUE_20);
    // await cake.connect(acct2).getTokens(TOKENS_VALUE_20);

    // await usdt.connect(acct1).getTokens(TOKENS_VALUE_20);
    // await usdt.connect(acct2).getTokens(TOKENS_VALUE_20);

    // await usdc.connect(acct1).getTokens(TOKENS_VALUE_20);
    // await usdc.connect(acct2).getTokens(TOKENS_VALUE_20);

    // const lottery = new ethers.Contract(lotteryAddress, json.abi, acct1) as FrogLottery
    // const lotteryERC20 = new ethers.Contract(lotteryAddressERC20, json.abi, acct1) as FrogLottery

    // await cake.approve(router.address, TOKENS_VALUE_20)
    // await bnb.approve(router.address, TOKENS_VALUE_20)
    // await usdc.approve(router.address, TOKENS_VALUE_20)
    // await usdt.approve(router.address, TOKENS_VALUE_20)
    // await usdt.approve(lotteryAddress, TOKENS_VALUE_20)
    // await usdt.approve(lotteryAddressERC20, TOKENS_VALUE_20 - BigInt(100))
    // await cake.approve(lotteryAddress, TOKENS_VALUE_20)
    // await cake.approve(lotteryAddressERC20, TOKENS_VALUE_20)

    // await cake.connect(acct2).approve(router.address, TOKENS_VALUE_20)
    // await bnb.connect(acct2).approve(router.address, TOKENS_VALUE_20)
    // await usdc.connect(acct2).approve(router.address, TOKENS_VALUE_20)
    // await usdt.connect(acct2).approve(router.address, TOKENS_VALUE_20)
    // await usdt.connect(acct2).approve(lotteryAddress, TOKENS_VALUE_20)
    // await usdt.connect(acct2).approve(lotteryAddressERC20, TOKENS_VALUE_20)
    // await cake.connect(acct2).approve(lotteryAddress, TOKENS_VALUE_20)
    // await cake.connect(acct2).approve(lotteryAddressERC20, TOKENS_VALUE_20)

    // console.log("cake: ", cake.address, "\nbnb: ", bnb.address, "\nusdt: ", usdt.address, '\nusdc: ', usdc.address)

    // const value = BigInt(10 ** 16);
    // const power = 1000000 // 1 || 1000000

    // await router.addLiquidityETH(cake.address, BigInt(power * 89 * 10 ** 18), 1, 1, acct1.address, Math.round(Date.now() / 1000) + 60 * 20, { value })

    // await router.addLiquidity(cake.address, usdt.address, BigInt(power * 10 ** 18), BigInt(power * 3.64 * 10 ** 18), 1, 1, acct1.address, Math.round(Date.now() / 1000) + 60 * 20)
    // await router.addLiquidity(cake.address, usdc.address, BigInt(power * 10 ** 18), BigInt(power * 3.64 * 10 ** 18), 1, 1, acct1.address, Math.round(Date.now() / 1000) + 60 * 20)
    // await router.addLiquidity(usdt.address, usdc.address, BigInt(power * 10 ** 18), BigInt(power * 10 ** 18), 1, 1, acct1.address, Math.round(Date.now() / 1000) + 60 * 20)

    // // await bnb.deposit({ value })

    // await router.addLiquidityETH(usdt.address, BigInt(power * 323 * 10 ** 18), 1, 1, acct1.address, Math.round(Date.now() / 1000) + 60 * 20, { value })

    // await lottery.setAll(cake.address, bnb.address, usdt.address, router.address, masterChef.address, await pancakeFactory.getPair(cake.address, bnb.address));
    // await lotteryERC20.setAll(cake.address, usdt.address, usdc.address, router.address, masterChef.address, await pancakeFactory.getPair(cake.address, usdt.address))
    // await masterChef.add(1, await pancakeFactory.getPair(cake.address, bnb.address), false)
    // await masterChef.add(1, await pancakeFactory.getPair(cake.address, usdt.address), false)

    // return { cake, bnb, usdt, router, lottery, masterChef, pancakeFactory, syrupBar, factory, referal, lotteryERC20, usdc } as allContractsFromDeploy
    return ({ usdc, usdt, busd, pool_busd_usdt, lottery_busd_usdt, pancakeFactory, router, nonfungiblePositionManager, factory, referal, fee })
}
