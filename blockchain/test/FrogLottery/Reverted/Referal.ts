import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import json from "../../../artifacts/contracts/frogs/FrogLottery.sol/FrogLottery.json";
import { ethers } from "hardhat";
import { allContractsFromDeploy } from "../../../@types";
import hre from "hardhat";
import { FrogLottery } from "../../../typechain-types";
import { deployAll } from "../../fixtures/fixtures";
import { sig } from "../../../sdk";

describe("FrogLottery3", function () {
    describe('Factory', async () => {
        describe('Reverted', async () => {
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
                    // it('setPercent', async () => {
                    //     const [acct1, acct2] = await ethers.getSigners();
                    //     const tx = all.referal.connect(acct2).setPercent(acct2.address)
                    //     await expect(tx).to.be.revertedWith('Caller is not beneficiary or owner')
                    // })
                    it('registerNewLottery', async () => {
                        const [acct1, acct2] = await ethers.getSigners();
                        const tx = all.referal.connect(acct2).registerNewLottery(acct2.address)
                        await expect(tx).to.be.revertedWith('registerNewLottery: you are not allowed to register new lotteries')
                    })
                    it('accrueRewardFromWinningReferral', async () => {
                        const [acct1, acct2] = await ethers.getSigners();
                        const tx = all.referal.connect(acct2).accrueRewardFromWinningReferral([{ reward0: 0, wallet: acct1.address, reward1: 0 }], acct1.address, acct1.address)
                        await expect(tx).to.be.reverted //With('recieveRewardFromReferalVictory: you are not a lottery')
                    })

                })

                describe('registerReferal', async () => {
                    it('registerReferal not from lottery', async () => {
                        const [acct1, acct2] = await ethers.getSigners();
                        const { message, v, r, s } = await sig(['address'], [acct1.address], acct1)
                        const tx = all.referal.registerReferal(message, v, r, s)
                        await expect(tx).to.be.rejectedWith('Caller is not a lottery')
                    })
                })
            })
        })
    })
});
