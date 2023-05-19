import { PancakeAddresses, Tokens, deploy } from "./mainnet-script";
import { ethers } from 'hardhat';
import secret from "../secrets.json"
const prefix = 'mainnet_'

const fee = 500;

async function main() {
    const acct1 = new ethers.Wallet(secret.PRIVATE_KEY_1, new ethers.providers.InfuraProvider('sepolia', 'e896ad4f86a749038fe8e1de62a9b540'))
    const balanceBefore = (await acct1.getBalance())
    console.log(balanceBefore.toString())
    await deploy(new Tokens(), new PancakeAddresses(), fee, prefix)

    const balanceAfter = (await acct1.getBalance())
    console.log(balanceAfter.toString())
    console.log(balanceBefore.sub(balanceAfter).div(BigInt(10 ** 18)))
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});