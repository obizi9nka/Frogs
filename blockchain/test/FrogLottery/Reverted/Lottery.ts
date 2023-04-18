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
            describe('Set functions from not Beneficiary or Owner', async () => {
                it('setToken0ContractAddress', async () => {
                    const [acct1, acct2] = await ethers.getSigners();
                    const tx = lottery.connect(acct2).setToken0ContractAddress(acct2.address)
                    await expect(tx).to.be.reverted
                })
                it('setToken1ContractAddress', async () => {
                    const [acct1, acct2] = await ethers.getSigners();
                    const tx = lottery.connect(acct2).setToken1ContractAddress(acct2.address)
                    await expect(tx).to.be.reverted
                })
                it('setUsdContractAddress', async () => {
                    const [acct1, acct2] = await ethers.getSigners();
                    const tx = lottery.connect(acct2).setUsdContractAddress(acct2.address)
                    await expect(tx).to.be.reverted
                })
                it('setPancakeRouterAddress', async () => {
                    const [acct1, acct2] = await ethers.getSigners();
                    const tx = lottery.connect(acct2).setPancakeRouterAddress(acct2.address)
                    await expect(tx).to.be.reverted
                })
                it('setPancakeMCAddress', async () => {
                    const [acct1, acct2] = await ethers.getSigners();
                    const tx = lottery.connect(acct2).setPancakeMCAddress(acct2.address)
                    await expect(tx).to.be.reverted
                })
                it('setPancakePairAddress', async () => {
                    const [acct1, acct2] = await ethers.getSigners();
                    const tx = lottery.connect(acct2).setPancakePairAddress(acct2.address)
                    await expect(tx).to.be.reverted
                })
                it('setFrogReferalAddress', async () => {
                    const [acct1, acct2] = await ethers.getSigners();
                    const tx = lottery.connect(acct2).setFrogReferalAddress(acct2.address)
                    await expect(tx).to.be.reverted
                })
                it('setBeneficiary', async () => {
                    const [acct1, acct2] = await ethers.getSigners();
                    const tx = lottery.connect(acct2).setBeneficiary(acct2.address)
                    await expect(tx).to.be.reverted
                })
                it('setFeePercent', async () => {
                    const [acct1, acct2] = await ethers.getSigners();
                    const tx = lottery.connect(acct2).setFeePercent(acct2.address)
                    await expect(tx).to.be.revertedWith('Caller is not beneficiary or owner')
                })
                it('set min and max usdt', async () => {
                    const [acct1, acct2] = await ethers.getSigners();
                    let tx = lottery.connect(acct2).setMinUsd(1)
                    await expect(tx).to.be.reverted
                    tx = lottery.connect(acct2).setMaxUsd(1)
                    await expect(tx).to.be.reverted
                })


            })

            describe('Requires in deposit', async () => {
                describe('setFeePercent', async () => {
                    it('setFeePercent with fee above max fee', async () => {
                        const [acct1, acct2] = await ethers.getSigners();
                        const tx = lottery.setFeePercent(10000)
                        await expect(tx).to.be.revertedWith('feePercent can not be great than maxFeePercent')
                    })
                })

                describe('deposit', async () => {
                    const TOKENS_VALUE_20 = BigInt(10 ** 18)
                    it('msg.value and tokenAmount1 mismatch', async () => {
                        const [acct1, acct2] = await ethers.getSigners();
                        const tx = lottery.deposit(1, 1, { value: 0 })
                        await expect(tx).to.be.revertedWith("msg.value and amount mismatch")
                    })

                    it('not enougth Token1 balance on msg.sender wallet', async () => {
                        const [acct1, acct2, acct3] = await ethers.getSigners();
                        const tx = all.lotteryERC20.connect(acct3).deposit(1, 1)
                        await expect(tx).to.be.revertedWith("Not enought Token1")
                    })

                    it('not enougth Token1 allowance on msg.sender wallet', async () => {
                        const [acct1, acct2, acct3] = await ethers.getSigners();
                        await all.usdt.connect(acct3).getTokens(decimals)

                        const tx = all.lotteryERC20.connect(acct3).deposit(1, 1)
                        await expect(tx).to.be.revertedWith("Not enought allowance Token1")
                    })

                    it('not enougth Token0 balance on msg.sender wallet', async () => {
                        const [acct1, acct2, acct3] = await ethers.getSigners();
                        await all.usdt.connect(acct3).approve(all.router.address, decimals)
                        await all.usdt.connect(acct3).approve(all.lottery.address, decimals)
                        await all.usdt.connect(acct3).approve(all.lotteryERC20.address, decimals)


                        const tx = all.lotteryERC20.connect(acct3).deposit(1, 1)
                        await expect(tx).to.be.revertedWith("Not enought Token0")
                    })

                    it('not enougth Token0 allowance on msg.sender wallet', async () => {
                        const [acct1, acct2, acct3] = await ethers.getSigners();
                        await all.cake.connect(acct3).getTokens(decimals)

                        const tx = all.lotteryERC20.connect(acct3).deposit(1, 1)
                        await expect(tx).to.be.revertedWith("Not enought allowance Token0")
                    })
                })

                describe('_deposit', async () => {
                    it('not a participant in referal program', async () => {
                        const [acct1, acct2, acct3] = await ethers.getSigners();
                        await all.cake.connect(acct3).approve(all.router.address, decimals)
                        await all.cake.connect(acct3).approve(all.lottery.address, decimals)
                        await all.cake.connect(acct3).approve(all.lotteryERC20.address, decimals)
                        const tx = all.lotteryERC20.connect(acct3).deposit(1, 1, { value: 0 })
                        await expect(tx).to.be.revertedWith("Not a Participant")
                    })

                    it('Total balance less than minUSD', async () => {
                        const [acct1, acct2, acct3] = await ethers.getSigners();
                        await all.referal.connect(acct3).add(acct1.address)
                        const tx = all.lotteryERC20.connect(acct3).deposit(10000000000, 10000000000, { value: 0 })
                        await expect(tx).to.be.revertedWith("Total balance less than minUSD")
                    })

                    it('Total balance great than maxUSD', async () => {
                        const [acct1, acct2, acct3] = await ethers.getSigners();
                        const amount = BigInt(10 ** 21)
                        const equivalent = (await all.router.getAmountsOut(amount, [all.cake.address, all.usdt.address]))[1]
                        const tx = all.lotteryERC20.connect(acct3).deposit(amount, equivalent, { value: 0 })
                        await expect(tx).to.be.revertedWith("Total balance great than maxUSD")
                    })
                })
            })

            describe('Withdraw', async () => {
                const amount = BigInt(10 ** 18)
                this.beforeAll(async () => {
                    const [acct1, acct2, acct3] = await ethers.getSigners();
                    const equivalent = (await all.router.getAmountsOut(amount, [all.cake.address, all.usdt.address]))[1]
                    await all.lotteryERC20.deposit(amount, equivalent)
                    await all.lotteryERC20.deposit(amount, equivalent)
                })

                it('not enougth liquidity on user balance', async () => {
                    const [acct1, acct2] = await ethers.getSigners();
                    const tx = all.lotteryERC20.withdraw(decimals)
                    await expect(tx).to.be.revertedWith('Not enought liquidity')
                })

                it('total balance will be less then minUSD', async () => {
                    const [acct1, acct2, acct3] = await ethers.getSigners();
                    const tx = all.lotteryERC20.withdraw(BigInt(`${await all.lotteryERC20.depositOf(acct1.address)}`) - BigInt(1))
                    await expect(tx).to.be.revertedWith('Total balance less than minUSD')
                })

                it('total balance will be great then minUSD', async () => {
                    const [acct1, acct2, acct3] = await ethers.getSigners();
                    await all.lotteryERC20.setMaxUsd(1);
                    const tx = all.lotteryERC20.withdraw(BigInt(1))
                    await expect(tx).to.be.revertedWith('Total balance great than maxUSD')
                    await all.lotteryERC20.setMaxUsd(BigInt(100 * 10 ** 18));
                })
            })
        })
    })
});
