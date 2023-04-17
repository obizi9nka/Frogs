import hre from "hardhat";
import { ethers } from 'hardhat';
import json from "../../artifacts/contracts/FrogLottery.sol/FrogLottery.json";
import { FrogLottery } from "../../typechain-types";

export async function deployAll() {
    const [acct1, acct2] = await ethers.getSigners();

    const USDT = await hre.ethers.getContractFactory('ERC20Token');
    const usdt = await USDT.deploy('USDT', "usdt");

    await usdt.deployed();
    // ==================
    //        CAKE
    // ==================
    const CAKE = await hre.ethers.getContractFactory('CakeToken');
    const cake = await CAKE.deploy();

    await cake.deployed();
    // ==================
    //         BNB
    // ==================
    const BNB = await hre.ethers.getContractFactory('TBnb');
    const bnb = await BNB.deploy();

    await bnb.deployed();
    // ==================
    //     FrogReferal
    // ==================
    const Referal = await hre.ethers.getContractFactory('FrogReferal');
    const referal = await Referal.deploy(acct1.address);

    await referal.deployed();
    // ==================
    //   PancakeFactory
    // ==================
    const PancakeFactory = await hre.ethers.getContractFactory('PancakeFactory');
    const pancakeFactory = await PancakeFactory.deploy(acct1.address);

    await pancakeFactory.deployed();

    await pancakeFactory.createPair(cake.address, bnb.address)
    // ==================
    //       Factory
    // ==================
    const Factory = await hre.ethers.getContractFactory('Factory');
    const factory = await Factory.deploy(referal.address, bnb.address, pancakeFactory.address, acct1.address);

    await factory.createNewLottery(cake.address, bnb.address)
    await referal.setFactoryAddress(factory.address)

    await factory.deployed();
    // ==================
    //     MasterChef
    // ==================
    const SyrupBar = await hre.ethers.getContractFactory('SyrupBar');
    const syrupBar = await SyrupBar.deploy(cake.address);

    await syrupBar.deployed();

    const MasterChef = await hre.ethers.getContractFactory('MasterChef');
    const masterChef = await MasterChef.deploy(cake.address, syrupBar.address, acct1.address, BigInt(40 * 10 ** 18), 0);

    await masterChef.deployed();
    // ==================
    //       Router
    // ==================
    const Router = await hre.ethers.getContractFactory('PancakeRouter');
    const router = await Router.deploy(pancakeFactory.address, bnb.address);


    const TOKENS_VALUE_20 = BigInt(10 ** 35)
    const lotteryAddress = await factory.lotteries(cake.address, bnb.address)

    await cake.connect(acct1).getTokens(TOKENS_VALUE_20);
    await cake.connect(acct2).getTokens(TOKENS_VALUE_20);

    await usdt.connect(acct1).getTokens(TOKENS_VALUE_20);
    await usdt.connect(acct2).getTokens(TOKENS_VALUE_20);

    const lottery = new ethers.Contract(lotteryAddress, json.abi, acct1) as FrogLottery

    await cake.approve(router.address, TOKENS_VALUE_20)
    await bnb.approve(router.address, TOKENS_VALUE_20)
    await usdt.approve(router.address, TOKENS_VALUE_20)
    await cake.approve(lotteryAddress, TOKENS_VALUE_20)

    await cake.connect(acct2).approve(router.address, TOKENS_VALUE_20)
    await bnb.connect(acct2).approve(router.address, TOKENS_VALUE_20)
    await usdt.connect(acct2).approve(router.address, TOKENS_VALUE_20)
    await cake.connect(acct2).approve(lotteryAddress, TOKENS_VALUE_20)

    const value = BigInt(10 ** 16);
    const power = 1000000 // 1 || 1000000

    await router.addLiquidityETH(cake.address, BigInt(power * 89 * 10 ** 18), 1, 1, acct1.address, Math.round(Date.now() / 1000) + 60 * 20, { value })

    await pancakeFactory.createPair(cake.address, usdt.address)
    await router.addLiquidity(cake.address, usdt.address, BigInt(power * 10 ** 18), BigInt(power * 3.64 * 10 ** 18), 1, 1, acct1.address, Math.round(Date.now() / 1000) + 60 * 20)

    await pancakeFactory.createPair(bnb.address, usdt.address)
    await bnb.deposit({ value })

    await router.addLiquidity(bnb.address, usdt.address, value, BigInt(power * 323 * 10 ** 18), 1, 1, acct1.address, Math.round(Date.now() / 1000) + 60 * 20)
    await lottery.setAll(cake.address, bnb.address, usdt.address, router.address, masterChef.address, await pancakeFactory.getPair(cake.address, bnb.address))
    await masterChef.add(1, await pancakeFactory.getPair(cake.address, bnb.address), false)

    await referal.connect(acct2).add(acct1.address)
    return { cake, bnb, usdt, router, lottery, masterChef, pancakeFactory, syrupBar, factory, referal }
}

export async function tokens() {
    const [acct1, acct2] = await ethers.getSigners();

    // ==================
    //        USDT
    // ==================

    const USDT = await hre.ethers.getContractFactory('ERC20Token');
    const usdt = await USDT.deploy('USDT', "usdt");

    await usdt.deployed();

    // ==================
    //        CAKE
    // ==================

    const CAKE = await hre.ethers.getContractFactory('CakeToken');
    const cake = await CAKE.deploy();

    await cake.deployed();

    // ==================
    //         BNB
    // ==================

    const BNB = await hre.ethers.getContractFactory('TBnb');
    const bnb = await BNB.deploy();

    await bnb.deployed();
    return { usdt, cake, bnb }
}