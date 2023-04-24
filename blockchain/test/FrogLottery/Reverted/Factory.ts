import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import json from "../../../artifacts/contracts/FrogLottery.sol/FrogLottery.json";
import { ethers } from "hardhat";
import { allContractsFromDeploy } from "../../../@types";
import hre from "hardhat";
import { FrogLottery } from "../../../typechain-types";
import { deployAll } from "../../fixtures/fixtures";

describe("FrogLottery", function () {
    describe('Factory', async () => {
        describe('Reverted', async () => {
            const decimals = BigInt(10 ** 35)
            const TOKENS_VALUE_20 = BigInt(10 ** 18)
            let all: allContractsFromDeploy;
            let lottery: FrogLottery;
            this.beforeAll(async () => {
                all = await loadFixture(deployAll)
                lottery = all.lottery
            })
            describe('Requires in createNewLottery', async () => {
                const TOKENS_VALUE_20 = BigInt(10 ** 18)
                it('Not a owner', async () => {
                    const [acct1, acct2] = await ethers.getSigners();
                    const tx = all.factory.connect(acct2).createNewLottery(all.usdt.address, all.usdc.address, 3)
                    await expect(tx).to.be.revertedWith("Ownable: caller is not the owner")
                })

                it('pair dont exist', async () => {
                    const [acct1, acct2] = await ethers.getSigners();
                    const tx = all.factory.createNewLottery(all.usdt.address, all.factory.address, 3)
                    await expect(tx).to.be.revertedWith("pair dont exist")
                })

                it('lottery exist', async () => {
                    const [acct1, acct2] = await ethers.getSigners();
                    const tx = all.factory.createNewLottery(all.cake.address, all.bnb.address, 3)
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
