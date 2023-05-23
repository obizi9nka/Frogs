import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import json from "../../../artifacts/contracts/frogs/FrogLottery.sol/FrogLottery.json"
import { ethers } from "hardhat";
import { allContractsFromDeploy } from "../../../@types";
import hre from "hardhat";
import { FrogLottery } from "../../../typechain-types";
import { deployAll } from "../../fixtures/fixtures";
import { sig } from "../../../sdk";

describe("FrogLottery2", function () {
    describe('Reverted', async () => {
        describe('Lottery', async () => {
            const decimals = BigInt(10 ** 35)
            let all: allContractsFromDeploy;
            let lottery: FrogLottery;
            this.beforeAll(async () => {
                all = await loadFixture(deployAll)
                lottery = all.lottery_busd_usdt
            })
            describe('Functions from not Beneficiary or Owner', async () => {
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
                it('setStableCoinAddress', async () => {
                    const [acct1, acct2] = await ethers.getSigners();
                    const tx = lottery.connect(acct2).setStableCoinAddress(acct2.address)
                    await expect(tx).to.be.reverted
                })
                // it('setPancakeRouterAddress', async () => {
                //     const [acct1, acct2] = await ethers.getSigners();
                //     const tx = lottery.connect(acct2).setPancakeRouterAddress(acct2.address)
                //     await expect(tx).to.be.reverted
                // })
                it('afterDraw', async () => {
                    const [acct1, acct2] = await ethers.getSigners();
                    const tx = lottery.connect(acct2).afterDraw([{ wallet: ethers.constants.AddressZero, reward0: 0, reward1: 0 }], 0, 0)
                    await expect(tx).to.be.reverted
                })
                it('draw', async () => {
                    const [acct1, acct2] = await ethers.getSigners();
                    const tx = lottery.connect(acct2).draw()
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
                it('setFeePercent with fee above max fee', async () => {
                    const [acct1, acct2] = await ethers.getSigners();
                    const tx = lottery.setFeePercent(10000)
                    await expect(tx).to.be.revertedWith('feePercent can not be great than maxFeePercent')
                })
                it('set min and max usdt', async () => {
                    const [acct1, acct2] = await ethers.getSigners();
                    let tx = lottery.connect(acct2).setMinUsd(1)
                    await expect(tx).to.be.reverted
                    tx = lottery.connect(acct2).setMaxUsd(1)
                    await expect(tx).to.be.reverted
                })
                it('createPosition', async () => {
                    const [acct1, acct2] = await ethers.getSigners();
                    const tx = lottery.connect(acct2).createPosition(0, 0)
                    await expect(tx).to.be.revertedWith('Caller is not beneficiary or owner')
                })
                it('createPosition when position already created', async () => {
                    const [acct1, acct2] = await ethers.getSigners();
                    const tx = lottery.createPosition(-1000, 1000)
                    await expect(tx).to.be.revertedWith('nono')
                })

            })

            describe('Requires in deposit', async () => {
                describe('deposit', async () => {
                    // it('msg.value and tokenAmount1 mismatch', async () => {
                    //     const [acct1, acct2] = await ethers.getSigners();
                    //     const tx = lottery.deposit(1, 1, { value: 0 })
                    //     await expect(tx).to.be.revertedWith("msg.value and amount mismatch")
                    // })

                    it('not enougth Token balance on msg.sender wallet', async () => {
                        const [acct1, acct2, acct3] = await ethers.getSigners();
                        const tx = lottery.connect(acct3).deposit(all.usdt.address, 1)
                        await expect(tx).to.be.reverted // With("Not enought Token1")
                    })

                    it('not enougth Token allowance on msg.sender wallet', async () => {
                        const [acct1, acct2, acct3] = await ethers.getSigners();
                        await all.usdt.connect(acct3).getTokens(decimals)

                        const tx = lottery.connect(acct3).deposit(all.usdt.address, 1)
                        await expect(tx).to.be.reverted // With("Not enought allowance Token1")
                    })

                    // it('not enougth Token0 balance on msg.sender wallet', async () => {
                    //     const [acct1, acct2, acct3] = await ethers.getSigners();
                    //     await all.usdt.connect(acct3).approve(all.router.address, decimals)
                    //     await all.usdt.connect(acct3).approve(all.lottery_busd_usdt.address, decimals)
                    //     await all.usdt.connect(acct3).approve(lottery.address, decimals)


                    //     const tx = lottery.connect(acct3).deposit(all.usdt.address, 1)
                    //     await expect(tx).to.be.reverted // With("Not enought Token0")
                    // })

                    // it('not enougth Token0 allowance on msg.sender wallet', async () => {
                    //     const [acct1, acct2, acct3] = await ethers.getSigners();
                    //     await all.cake.connect(acct3).getTokens(decimals)

                    //     const tx = lottery.connect(acct3).deposit(1, 1)
                    //     await expect(tx).to.be.revertedWith("Not enought allowance Token0")
                    // })
                })

                describe('_deposit', async () => {
                    it('not a participant in referal program', async () => {
                        const [acct1, acct2, acct3] = await ethers.getSigners();
                        // await all.usdt.connect(acct3).approve(all.router.address, decimals)
                        // await all.usdt.connect(acct3).approve(all.lottery_busd_usdt.address, decimals)
                        await all.usdt.connect(acct3).approve(lottery.address, decimals)
                        const tx = lottery.connect(acct3).deposit(all.usdt.address, 1)
                        await expect(tx).to.be.revertedWith("Not a Participant")
                    })

                    it('Total balance less than minUSD', async () => {
                        const [acct1, acct2, acct3] = await ethers.getSigners();
                        const { message, v, r, s } = await sig(['address'], [acct3.address], acct1)
                        const tx = lottery.connect(acct3).registerBeforeDeposit(message, v, r, s, all.usdt.address, BigInt(5 * 10 * 18))
                        await expect(tx).to.be.revertedWith("Total balance less than minUSD")
                    })

                    it('Total balance great than maxUSD', async () => {
                        const [acct1, acct2, acct3] = await ethers.getSigners();
                        const amount = BigInt(10 ** 21)
                        const { message, v, r, s } = await sig(['address'], [acct3.address], acct1)
                        const tx = lottery.connect(acct3).registerBeforeDeposit(message, v, r, s, all.usdt.address, BigInt(500 * 10 ** 18))
                        await expect(tx).to.be.revertedWith("Total balance great than maxUSD")
                    })
                })
            })

            describe('Withdraw', async () => {
                const amount = BigInt(6 * 10 ** 18)
                this.beforeAll(async () => {
                    const [acct1, acct2, acct3] = await ethers.getSigners();
                    // const equivalent = (await all.router.getAmountsOut(amount, [all.cake.address, all.usdt.address]))[1]
                    console.log(await lottery.balanceOf(acct1.address))
                    console.log(await lottery.depositOf(acct1.address))
                    console.log(await lottery.withdrawOf(acct1.address))
                    await lottery.deposit(all.usdt.address, amount)

                    console.log(await lottery.balanceOf(acct1.address))
                    console.log(await lottery.depositOf(acct1.address))
                    console.log(await lottery.withdrawOf(acct1.address))
                    // 61484741054935671656
                    // await lottery.deposit(all.usdt.address, amount)
                })

                it('not enougth liquidity on user balance', async () => {
                    const [acct1, acct2] = await ethers.getSigners();
                    const tx = lottery.withdraw(decimals)
                    await expect(tx).to.be.revertedWith('Not enought liquidity')
                })

                it('total balance will be less then minUSD', async () => {
                    const [acct1, acct2, acct3] = await ethers.getSigners();
                    const tx = lottery.withdraw((await lottery.depositOf(acct1.address)).sub(10 ** 10))
                    await expect(tx).to.be.revertedWith('Total balance less than minUSD')
                })

                it('total balance will be great then minUSD', async () => {
                    const [acct1, acct2, acct3] = await ethers.getSigners();
                    await lottery.setMaxUsd(1);
                    const tx = lottery.withdraw((await lottery.depositOf(acct1.address)).sub(BigInt(56 * 10 ** 18)))
                    await expect(tx).to.be.revertedWith('Total balance great than maxUSD')
                    // await lottery.setMaxUsd(BigInt(100 * 10 ** 18)); 
                })
            })

            describe('registerBeforeDeposit', async () => {
                it('invalid signer', async () => {
                    const [acct1, acct2] = await ethers.getSigners();
                    const { message, v, r, s } = await sig(['address'], [acct1.address], acct2)
                    const tx = lottery.registerBeforeDeposit(message, v, r, s, all.busd.address, 1)
                    await expect(tx).to.be.revertedWith('invalid sig')
                })

                it('signed address mismatch with msg.sender', async () => {
                    const [acct1, acct2] = await ethers.getSigners();
                    const { message, v, r, s } = await sig(['address'], [acct1.address], acct1)
                    const tx = lottery.connect(acct2).registerBeforeDeposit(message, v, r, s, all.busd.address, 1)
                    await expect(tx).to.be.revertedWith('sender and signed user mismatch')
                })

            })
        })
    })
});
