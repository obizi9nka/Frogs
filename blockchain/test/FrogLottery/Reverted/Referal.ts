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
                describe('Set functions from not Beneficiary or Owner', async () => {

                    it('setBeneficiary', async () => {
                        const [acct1, acct2] = await ethers.getSigners();
                        const tx = all.referal.connect(acct2).setBeneficiary(acct2.address)
                        await expect(tx).to.be.reverted
                    })
                    it('setFactoryAddress', async () => {
                        const [acct1, acct2] = await ethers.getSigners();
                        const tx = all.referal.connect(acct2).setFactoryAddress(acct2.address)
                        await expect(tx).to.be.revertedWith('Caller is not beneficiary or owner')
                    })
                    it('setPercent', async () => {
                        const [acct1, acct2] = await ethers.getSigners();
                        const tx = all.referal.connect(acct2).setPercent(acct2.address)
                        await expect(tx).to.be.revertedWith('Caller is not beneficiary or owner')
                    })
                    it('registerNewLottery', async () => {
                        const [acct1, acct2] = await ethers.getSigners();
                        const tx = all.referal.connect(acct2).registerNewLottery(acct2.address)
                        await expect(tx).to.be.revertedWith('registerNewLottery: you are not allowed to register new lotteries')
                    })
                    it('recieveRewardFromReferalVictory', async () => {
                        const [acct1, acct2] = await ethers.getSigners();
                        const tx = all.referal.connect(acct2).recieveRewardFromReferalVictory(all.cake.address, acct1.address, 0)
                        await expect(tx).to.be.revertedWith('recieveRewardFromReferalVictory: you are not a lottery')
                    })

                })

                describe('add', async () => {
                    it('Participant already exist!', async () => {
                        const [acct1, acct2] = await ethers.getSigners();
                        const tx = all.referal.connect(acct2).add(acct2.address)
                        await expect(tx).to.be.revertedWith('Participant already exist!')
                    })

                    it('Referer not found!', async () => {
                        const [acct1, acct2, acct3] = await ethers.getSigners();
                        const tx = all.referal.connect(acct3).add(all.cake.address)
                        await expect(tx).to.be.revertedWith('Referer not found!')
                    })
                })

                describe('registerNewLottery', async () => {


                    it('Referer not found!', async () => {
                        const [acct1, acct2, acct3] = await ethers.getSigners();
                        const tx = all.referal.connect(acct3).add(all.cake.address)
                        await expect(tx).to.be.revertedWith('Referer not found!')
                    })
                })
            })
        })
    })
});
