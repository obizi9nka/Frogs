import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import json from "../../../artifacts/contracts/frogs/FrogLottery.sol/FrogLottery.json";
import { ethers } from "hardhat";
import { allContractsFromDeploy } from "../../../@types";
import hre from "hardhat";
import { FrogLottery } from "../../../typechain-types";
import { deployAll } from "../../fixtures/fixtures";

describe("FrogLottery1", function () {
    describe('Reverted', async () => {
        describe('Factory', async () => {
            const decimals = BigInt(10 ** 35)
            const TOKENS_VALUE_20 = BigInt(10 ** 18)
            let all: allContractsFromDeploy;
            let lottery: FrogLottery;
            this.beforeAll(async () => {
                all = await loadFixture(deployAll)
                lottery = all.lottery_busd_usdt
            })
            describe('Requires in createNewLottery', async () => {
                const TOKENS_VALUE_20 = BigInt(10 ** 18)
                it('Not a owner', async () => {
                    const [acct1, acct2] = await ethers.getSigners();
                    const tx = all.factory.connect(acct2).createNewLottery(all.usdt.address, all.usdc.address, all.fee, all.pool_busd_usdt.address, all.nonfungiblePositionManager.address, all.usdc.address)
                    await expect(tx).to.be.revertedWith("Ownable: caller is not the owner")
                })

                it('pool dont exist', async () => {
                    const [acct1, acct2] = await ethers.getSigners();
                    const tx = all.factory.createNewLottery(all.usdt.address, all.router.address, all.fee, all.pool_busd_usdt.address, all.nonfungiblePositionManager.address, all.usdc.address)
                    await expect(tx).to.be.revertedWith("pool dont exist")
                })

                it('lottery exist', async () => {
                    const [acct1, acct2] = await ethers.getSigners();
                    const tx = all.factory.createNewLottery(all.usdt.address, all.busd.address, all.fee, all.pool_busd_usdt.address, all.nonfungiblePositionManager.address, all.usdc.address)
                    await expect(tx).to.be.revertedWith("lottery exist")
                })

                // it('not enougth Token0 balance on msg.sender wallet', async () => {
                //     const [acct1, acct2] = await ethers.getSigners();
                //     const tx = all.factory.createNewLottery(all.bnb.address, all.usdc.address, 3)
                //     await expect(tx).to.be.revertedWith("lottery exist")
                // })

            })
        })
    })
});
