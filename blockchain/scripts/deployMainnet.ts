import { PancakeAddresses, Tokens, deploy } from "./mainnet-script";
import { ethers } from 'hardhat';
import secret from "../secrets.json"
const prefix = 'bsc_'

const fee = 100;

async function main() {
    const [acct1] = await ethers.getSigners();
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