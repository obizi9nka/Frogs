import constants from "../scripts/json/constants.json"
import hre from "hardhat";
import { ethers } from 'hardhat';
import secret from "../secrets.json"
import { PancakeAddresses, Tokens, deploy } from "./mainnet-script";
const addresses = constants.addresses as any
const fee = 500;
const prefix = 'mainnet_test_'
const _prefix = 'sepolia_'

async function main() {

    const acct1 = new ethers.Wallet(secret.PRIVATE_KEY_1, new ethers.providers.InfuraProvider('sepolia', 'e896ad4f86a749038fe8e1de62a9b540'))
    // const [acct1] = await ethers.getSigners();

    const balanceBefore = (await acct1.getBalance())
    console.log(balanceBefore.toString())
    await deploy(
        new Tokens(addresses[_prefix + "USDT"], addresses[_prefix + "USDC"], addresses[_prefix + "BUSD"], '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c'),
        new PancakeAddresses(addresses[_prefix + 'PancakeFactory'], addresses[_prefix + 'SwapRouter'], addresses[_prefix + 'NonfungiblePositionManager']),
        fee,
        prefix
    )
    const balanceAfter = (await acct1.getBalance())
    console.log(balanceAfter.toString())
    const delta = balanceBefore.sub(balanceAfter) // 0.0174202696055808
    console.log(delta.toString())
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});