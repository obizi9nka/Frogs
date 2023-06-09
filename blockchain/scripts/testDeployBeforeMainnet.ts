import constants from "../scripts/json/constants.json"
import hre from "hardhat";
import { ethers } from 'hardhat';
import secret from "../secrets.json"
import { PancakeAddresses, Tokens, deploy } from "./mainnet-script";
const addresses = constants.addresses as any
const fee = 100;
// const prefix = 'tbsc_'
// const prefix = 'sepolia_test_before_mainnet_'
const prefix = 'localhost_'
const _prefix = 'localhost_'

const factory = '0x0BFbCF9fa4f9C56B0F40a671Ad40E0805A091865'
const smartRouter = '0x9a489505a00cE272eAa5e07Dba6491314CaE3796'
const manager = '0x427bF5b37357632377eCbEC9de3626C71A5396c1'
const mc = '0x864ED564875BdDD6F421e226494a0E7c071C06f8'

const usdt = '0xFa60D973F7642B748046464e165A65B7323b0DEE' // cake1 // constants.addresses.tbsc_USDT
const usdc = '0xaB1a4d4f1D656d2450692D237fdD6C7f9146e814' // busd // constants.addresses.tbsc_USDC
const busd = '0x8d008B313C1d6C7fE2982F62d32Da7507cF43551' // cake2 // constants.addresses.tbsc_BUSD
const wbnb = '0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd' // wbnb constants.addresses.tbsc_WBNB
const cake = '0xFa60D973F7642B748046464e165A65B7323b0DEE' // cake1 // constants.addresses.tbsc_CAKE

const bscTestnetTokens = new Tokens(usdt, usdc, busd, wbnb, cake)
const bscTestnetPancakeAddresses = new PancakeAddresses(factory, smartRouter, manager, mc)
const utils = require("./main");

async function main() {

    // const acct1 = new ethers.Wallet(secret.PRIVATE_KEY_1, new ethers.providers.InfuraProvider('sepolia', 'e896ad4f86a749038fe8e1de62a9b540'))
    const [acct1] = await ethers.getSigners();

    const p = new Tokens(addresses[_prefix + "USDT"], addresses[_prefix + "USDC"], addresses[_prefix + "BUSD"], addresses[_prefix + "WBNB"], addresses[_prefix + "CAKE"])
    const fd = new PancakeAddresses(addresses[_prefix + 'PancakeFactory'], addresses[_prefix + 'SwapRouter'], addresses[_prefix + 'NonfungiblePositionManager'], addresses[_prefix + "MC"])

    const balanceBefore = (await acct1.getBalance())
    console.log(balanceBefore.toString())
    await deploy(
        p,
        fd,
        fee,
        prefix
    )
    const balanceAfter = (await acct1.getBalance())
    console.log(balanceAfter.toString())
    const delta = balanceBefore.sub(balanceAfter) // 0.0174202696055808
    console.log(delta.toString())
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