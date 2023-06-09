import hre from "hardhat";
import { ethers } from 'hardhat';

import FrogLottery_json from "../artifacts/contracts/frogs/FrogLottery.sol/FrogLottery.json";
import Pool_json from "../artifacts/contracts/v3-core/PancakeV3Pool.sol/PancakeV3Pool.json"
import ERC20_json from "../artifacts/@openzeppelin/contracts/token/ERC20/ERC20.sol/ERC20.json"
import PancakeFactory_json from '../artifacts/contracts/v3-core/PancakeV3Factory.sol/PancakeV3Factory.json'
import Manager_json from '../artifacts/contracts/v3-periphery/NonfungiblePositionManager.sol/NonfungiblePositionManager.json'
import Router_json from '../artifacts/contracts/v3-periphery/SwapRouter.sol/SwapRouter.json'

import { ERC20, FrogFactory, FrogLottery, FrogReferal, TBnb } from "../typechain-types";
const utils = require("./main");
import constants from "./json/constants.json";
import { NonfungiblePositionManager, SwapRouter, PancakeV3Factory, PancakeV3Pool } from "../v3/typechain-types";
import { BigNumber } from "ethers";
import bn from 'bignumber.js'
import secret from "../secrets.json"



export class Tokens {
    usdt = '0x55d398326f99059ff775485246999027b3197955'
    usdc = '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d'
    busd = '0xe9e7cea3dedca5984780bafc599bd69add087d56'
    wbnb = '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c'
    cake = '0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82'
    constructor(_usdt?: string, _usdc?: string, _busd?: string, _wbnb?: string, _cake?: string) {
        this.usdt = _usdt == undefined ? this.usdt : _usdt
        this.usdc = _usdc == undefined ? this.usdc : _usdc
        this.busd = _busd == undefined ? this.busd : _busd
        this.wbnb = _wbnb == undefined ? this.wbnb : _wbnb
        this.cake = _cake == undefined ? this.cake : _cake
    }
}

export class PancakeAddresses {
    factory = '0x0BFbCF9fa4f9C56B0F40a671Ad40E0805A091865'
    router = '0x13f4EA83D0bd40E75C8222255bc855a974568Dd4'
    manager = '0x46A15B0b27311cedF172AB29E4f4766fbE7F4364'
    mc = '0x556B9306565093C855AEA9AE92A594704c2Cd59e'
    constructor(_factory?: string, _router?: string, _manager?: string, _mc?: string) {
        this.factory = _factory == undefined ? this.factory : _factory
        this.router = _router == undefined ? this.router : _router
        this.manager = _manager == undefined ? this.manager : _manager
        this.mc = _mc == undefined ? this.mc : _mc
    }
}

export async function deploy(tokens: Tokens, pancakeAddresses: PancakeAddresses, fee: number, prefix: string) {
    console.log('deploy mainnet')
    // const acct1 = new ethers.Wallet(secret.PRIVATE_KEY_1, new ethers.providers.InfuraProvider('sepolia', 'e896ad4f86a749038fe8e1de62a9b540'))
    const [acct1] = await ethers.getSigners();


    const usdc = new ethers.Contract(tokens.usdc, ERC20_json.abi, acct1) as ERC20;
    const usdt = new ethers.Contract(tokens.usdt, ERC20_json.abi, acct1) as ERC20;
    const busd = new ethers.Contract(tokens.busd, ERC20_json.abi, acct1) as ERC20;
    const cake = new ethers.Contract(tokens.cake, ERC20_json.abi, acct1) as ERC20;
    const wbnb = new ethers.Contract(tokens.wbnb, ERC20_json.abi, acct1) as ERC20;

    // ==================
    //     FrogReferal
    const Referal = await hre.ethers.getContractFactory('FrogReferal');
    const referal = await Referal.deploy(acct1.address, constants.mainnet_addressOfPrivateKey, cake.address) as FrogReferal;
    await referal.deployed();
    // ==================
    const pancakeFactory = new ethers.Contract(pancakeAddresses.factory, PancakeFactory_json.abi, acct1) as PancakeV3Factory;


    const pool_busd_usdt = new ethers.Contract(await pancakeFactory.getPool(busd.address, usdt.address, fee), Pool_json.abi, acct1) as PancakeV3Pool
    const pool_busd_usdc = new ethers.Contract(await pancakeFactory.getPool(busd.address, usdc.address, fee), Pool_json.abi, acct1) as PancakeV3Pool
    const pool_usdt_usdc = new ethers.Contract(await pancakeFactory.getPool(usdt.address, usdc.address, fee), Pool_json.abi, acct1) as PancakeV3Pool


    const nonfungiblePositionManager = new ethers.Contract(pancakeAddresses.manager, Manager_json.abi, acct1) as NonfungiblePositionManager;
    const router = new ethers.Contract(pancakeAddresses.router, Router_json.abi, acct1) as SwapRouter

    // ==================
    //       FrogFactory
    const FrogFactory = await hre.ethers.getContractFactory('FrogFactory');
    const factory = await FrogFactory.deploy(referal.address, wbnb.address, pancakeFactory.address, acct1.address, router.address, pancakeAddresses.mc, cake.address) as FrogFactory;
    await factory.deployed();
    // ==================

    await executeFunc(referal.setFactoryAddress(factory.address))

    await executeFunc(factory.createNewLottery(busd.address, usdt.address, fee, pool_busd_usdt.address, nonfungiblePositionManager.address, usdc.address))

    const lottery_busd_usdt = new ethers.Contract(await factory.lotteries(busd.address, usdt.address, fee), FrogLottery_json.abi, acct1) as FrogLottery

    await executeFunc(busd.approve(lottery_busd_usdt.address, ethers.constants.MaxUint256))
    await executeFunc(usdt.approve(lottery_busd_usdt.address, ethers.constants.MaxUint256))

    const positionData = await pool_busd_usdt.slot0()
    const tickSpacing = await pool_busd_usdt.tickSpacing()

    const tickLower = positionData.tick - positionData.tick % tickSpacing - tickSpacing * 100
    const tickUpper = positionData.tick - positionData.tick % tickSpacing + tickSpacing * 100


    await executeFunc(lottery_busd_usdt.createPosition(tickLower, tickUpper))

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
    await utils.saveAddress(prefix + "MC", pancakeAddresses.mc)
    await utils.saveAddress(prefix + "SwapRouter", router.address)
    await utils.saveAddress(prefix + "FrogFactory", factory.address)
    await utils.saveAddress(prefix + "Lottery_busd_usdt", lottery_busd_usdt.address)

}

const executeFunc = async (func: any) => {
    const tx = await func
    await tx.wait()
    return tx
}