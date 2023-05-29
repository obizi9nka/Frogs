
import hre, { ethers } from 'hardhat'
import abi from "../../artifacts/contracts/frogs/FrogLottery.sol/FrogLottery.json"
import secret from "../../secrets.json"
import { FrogLottery } from '../../typechain-types'

async function main() {
    const acct1 = new ethers.Wallet(secret.PRIVATE_KEY_1, new ethers.providers.InfuraProvider('sepolia', 'e896ad4f86a749038fe8e1de62a9b540'))

    const t = new ethers.Contract('0x9b0Fc724CA2fb6189D08eaa3863B0CE6DAe8355D', abi.abi, acct1) as FrogLottery
    await t.setMaxUsd(BigInt(15000 * 10 ** 18))
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});


// hre.run("verify:verify", {
//     address: '0x9b0Fc724CA2fb6189D08eaa3863B0CE6DAe8355D',
//     constructorArguments: [{
//         token0: "0x27D4321BD3Ece619D539bE7Fd7b6a68Ef5d46F36",
//         token1: "0x160f3eA6d18d37a5A47015642200D13a51697002",
//         poolFee: 500,
//         frogReferalAddress: "0x7A2418E168f6ad4975B03e2a95b80856d7Adc8C2",
//         isEthLottery: false,
//         beneficiary: "0x8eD69f5C2c6cdcC9Bb791B2Fe300a825537F2F54",
//         pool: "0xfc35ffaF9FF8D295Ea8477CdB1Cd24C84d75AF92",
//         nonfungiblePositionManager: "0xf30b9938Bd70adaDcA640Bf044fB8F2F46FD72ef",
//         swapRouter: "0x1CD2C7a870A714FA6ee03a3B1f0D0549FDc3Fa33",
//         pancakeFactory: "0x98A8ACBE1ffe2ff6659A00A3eE569bA808679D50",
//         stable: "0xA3C62acAbaA358F2D66560c79beFdFb9Bc606303",
//         isReversed: true
//     }]
// }).catch(e => {
//     console.log(e)
// })