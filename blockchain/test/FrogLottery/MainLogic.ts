import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { ethers } from "hardhat";
import { deployAll } from "../fixtures/fixtures"
import { allContractsFromDeploy } from "../../@types";
import { FrogLottery } from "../../typechain-types";
import { sig } from "../../sdk";
// import { TickMath, FullMath } from "@uniswap/v3-sdk"

let mainLogic

describe("FrogLottery MainLogic", function () {
    mainLogic = async (isEthLottery: boolean) => {
        const decimals = BigInt(10 * 10 ** 18)
        // 1.300000000000000000
        // 0.649674999999155752
        // 102.474568424912758913
        // 522.620298966930423808
        // 1024.745684249127550976
        let all: allContractsFromDeploy;
        let lottery: FrogLottery;
        this.beforeAll(async () => {
            all = await loadFixture(deployAll)
            lottery = all.lottery_busd_usdt
        })
        it("deposit", async () => {
            console.log('==================')
            console.log('    MAIN LOGIC    ')
            console.log('==================')
            // const _all = all as any
            // for (const key in _all) {
            //     if (Object.prototype.hasOwnProperty.call(_all, key)) {
            //         const element = _all[key];
            //         console.log(key, element.address)
            //     }
            // }

            const [acct1, acct2] = await ethers.getSigners();
            const _all = all as any
            for (const key in _all) {
                console.log(key, _all[key].address)
            }
            await lottery.deposit(all.busd.address, BigInt(5 * 1e18));
            const { message, v, r, s } = await sig(['address'], [acct2.address], acct1)
            await lottery.connect(acct2).registerBeforeDeposit(message, v, r, s, all.usdt.address, decimals)
        });
        it("first empty draw", async () => {
            const [acct1, acct2] = await ethers.getSigners();
            await lottery.draw()
            expect(await lottery.drawNumber()).to.be.equal(0)
            const participants = await lottery.getParticipants()
            expect(participants.result[0]).to.be.equal(acct1.address)
            expect(participants.result[1]).to.be.equal(acct2.address)
        })
        it('withdraw', async () => {
            const [acct1, acct2] = await ethers.getSigners();
            const balance = await lottery.balanceOf(acct1.address)
            await lottery.withdraw(balance)
        })
        const generateFee = async (isToken0: boolean, isToken1: boolean) => {
            const [acct1, acct2] = await ethers.getSigners();

            let params = {
                tokenIn: all.busd.address,
                tokenOut: all.usdt.address,
                fee: all.fee,
                recipient: acct1.address,
                deadline: 1000000000000,
                amountIn: BigInt(10 ** 20),
                amountOutMinimum: BigInt(10 ** 19),
                sqrtPriceLimitX96: 0
            }

            if (isToken0) {
                await all.router.exactInputSingle(params)
            }

            if (isToken1) {
                params.tokenIn = all.usdt.address
                params.tokenOut = all.busd.address
                await all.router.exactInputSingle(params)
            }


        }
        it('swap to generate fee', async () => {
            await generateFee(true, false)
        })
        let isFirstWinner = false;
        it("second draw with participants", async () => {
            const [acct1, acct2] = await ethers.getSigners();
            await lottery.draw()
            expect(await lottery.drawNumber()).to.be.equal(1)
            const first = parseInt((await lottery.rewardOfToken0(acct1.address)).toString())
            if (first > 0)
                isFirstWinner = true
            const rewardNotZero = first + parseInt((await lottery.rewardOfToken0(acct2.address)).toString())
            expect(rewardNotZero).not.to.equal(0)

            const filter = lottery.filters.Victory()
            const data = await lottery.queryFilter(filter)
            const refererReward0 = data[0].args._amountToken0.div(100).mul(3)
            const refererReward1 = data[0].args._amountToken1.div(100).mul(3)
            const refererRewardCake = data[0].args._amountCake.div(100).mul(3)

            await lottery.afterDraw([{ wallet: isFirstWinner ? ethers.constants.AddressZero : acct1.address, reward0: refererReward0, reward1: refererReward1, rewardCake: refererRewardCake }], refererReward0, refererReward1, refererRewardCake)
        })
        it('claim reward', async () => {
            const [acct1, acct2] = await ethers.getSigners();
            let operator = acct2
            if (isFirstWinner)
                operator = acct1
            const rewardOfToken0 = await lottery.rewardOfToken0(operator.address)
            const rewardOfToken1 = await lottery.rewardOfToken1(operator.address)

            const balanceBeforeBusd = await all.busd.balanceOf(operator.address)
            const balanceBeforeUsdt = await all.usdt.balanceOf(operator.address)

            await lottery.connect(operator).claimReward()

            const balanceAfterBusd = await all.busd.balanceOf(operator.address)
            const balanceAfterUsdt = await all.usdt.balanceOf(operator.address)

            expect(rewardOfToken0).not.to.be.eq(0)
            expect(rewardOfToken1).to.be.eq(0)
            expect(balanceAfterBusd).to.be.equal(balanceBeforeBusd.add(rewardOfToken0))
            expect(balanceAfterUsdt).to.be.equal(balanceBeforeUsdt.add(rewardOfToken1))
        })
        it('swap to generate fee', async () => {
            await generateFee(true, true)
        })
        it("third draw for 100% referal system activate", async () => {
            const [acct1, acct2] = await ethers.getSigners();
            console.log('Draw started')
            await lottery.draw()
            console.log('Draw ended')
            const filter = lottery.filters.Victory()
            const data = await lottery.queryFilter(filter)
            const refererReward0 = data[1].args._amountToken0.div(100).mul(3)
            const refererReward1 = data[1].args._amountToken1.div(100).mul(3)
            const refererRewardCake = data[1].args._amountCake.div(100).mul(3)
            console.log('afterDraw started')
            await lottery.afterDraw([{ wallet: acct1.address, reward0: refererReward0, reward1: refererReward1, rewardCake: refererRewardCake }], refererReward0, refererReward1, refererRewardCake)
            console.log('afterDraw ended')

        })
        it('claim referal reward', async () => {
            const [acct1] = await ethers.getSigners();
            const rewardOfToken0 = await all.referal.balance(all.busd.address, acct1.address)
            const rewardOfToken1 = await all.referal.balance(all.usdt.address, acct1.address)

            const balanceBeforeBusd = await all.busd.balanceOf(acct1.address)
            const balanceBeforeUsdt = await all.usdt.balanceOf(acct1.address)

            await all.referal.connect(acct1).claimReward([all.busd.address, all.usdt.address, all.cake.address])

            const balanceAfterBusd = await all.busd.balanceOf(acct1.address)
            const balanceAfterUsdt = await all.usdt.balanceOf(acct1.address)

            expect(rewardOfToken0).not.to.be.eq(0)
            expect(rewardOfToken1).not.to.be.eq(0)
            expect(balanceAfterBusd).to.be.equal(balanceBeforeBusd.add(rewardOfToken0))
            expect(balanceAfterUsdt).to.be.equal(balanceBeforeUsdt.add(rewardOfToken1))
        })
        it("deposit in usdc", async () => {
            const [acct1, acct2, acct3] = await ethers.getSigners();
            const balanceBeforeUsdc = await all.usdc.balanceOf(acct1.address)
            await lottery.deposit(all.usdc.address, decimals);
            const balanceAfterUsdc = await all.usdc.balanceOf(acct1.address)
            expect(BigInt(balanceAfterUsdc.toString())).to.be.eq(BigInt(balanceBeforeUsdc.toString()) - decimals)
        });
        it('swap to generate fee', async () => {
            await generateFee(false, true)
        })
        it("fourth draw", async () => {
            const [acct1, acct2] = await ethers.getSigners();
            await lottery.connect(acct2).claimReward() // for next rewardOfTOken0 == 0
            await lottery.draw()
            const filter = lottery.filters.Victory()
            const data = await lottery.queryFilter(filter)
            const refererReward0 = data[2].args._amountToken0.div(100).mul(3)
            const refererReward1 = data[2].args._amountToken1.div(100).mul(3)
            const refererRewardCake = data[2].args._amountCake.div(100).mul(3)
            await lottery.afterDraw([{ wallet: acct1.address, reward0: refererReward0, reward1: refererReward1, rewardCake: refererRewardCake }], refererReward0, refererReward1, refererRewardCake)
        })
        it('claim reward', async () => {
            const [acct1, acct2] = await ethers.getSigners();
            let operator = acct2

            const rewardOfToken0 = await lottery.rewardOfToken0(operator.address)
            const rewardOfToken1 = await lottery.rewardOfToken1(operator.address)

            const balanceBeforeBusd = await all.busd.balanceOf(operator.address)
            const balanceBeforeUsdt = await all.usdt.balanceOf(operator.address)

            await lottery.connect(operator).claimReward()

            const balanceAfterBusd = await all.busd.balanceOf(operator.address)
            const balanceAfterUsdt = await all.usdt.balanceOf(operator.address)

            expect(rewardOfToken0).to.be.eq(0)
            expect(rewardOfToken1).not.to.be.eq(0)
            expect(balanceAfterBusd).to.be.equal(balanceBeforeBusd.add(rewardOfToken0))
            expect(balanceAfterUsdt).to.be.equal(balanceBeforeUsdt.add(rewardOfToken1))

            // console.log(await all.mc.poolInfo(1))
        })

    }
    mainLogic(true)
    // mainLogic(false)
});

export default mainLogic;
