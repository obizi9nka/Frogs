import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { ethers } from "hardhat";
import { deployAll } from "../fixtures/fixtures"
import { allContractsFromDeploy } from "../../@types";
import { FrogLottery } from "../../typechain-types";
import { sig } from "../../sdk";

let mainLogic

describe("FrogLottery MainLogic", function () {
    mainLogic = async (isEthLottery: boolean) => {
        const decimals = BigInt(10 ** 18)
        let all: allContractsFromDeploy;
        let lottery: FrogLottery;
        this.beforeAll(async () => {
            all = await loadFixture(deployAll)
            lottery = all.lottery_busd_usdt
        })
        it("deposit", async () => {
            console.log('========================')
            console.log('       MAINLOGIC        ')
            console.log('========================')
            const [acct1, acct2] = await ethers.getSigners();

            await lottery.deposit(all.busd.address, decimals);

            // console.log(await all.pool_busd_usdt.slot0())
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
        it('swap to generate fee', async () => {
            const [acct1, acct2] = await ethers.getSigners();

            let params = {
                tokenIn: all.busd.address,
                tokenOut: all.usdt.address,
                fee: all.fee,
                recipient: acct1.address,
                deadline: 1000000000000,
                amountIn: BigInt(10 ** 30),
                amountOutMinimum: BigInt(10 ** 29),
                sqrtPriceLimitX96: 0
            }

            await all.router.exactInputSingle(params)
            params.tokenIn = all.usdt.address
            params.tokenOut = all.busd.address
            await all.router.exactInputSingle(params)

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

            await lottery.afterDraw([{ wallet: isFirstWinner ? ethers.constants.AddressZero : acct1.address, reward0: refererReward0, reward1: refererReward1 }], refererReward0, refererReward1)
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
            // console.log(balanceBeforeBusd.toString())
            // console.log(balanceBeforeUsdt.toString())
            // console.log(balanceAfterBusd.toString())
            // console.log(balanceAfterUsdt.toString())
            expect(rewardOfToken0).not.to.be.eq(0)
            expect(rewardOfToken1).not.to.be.eq(0)
            expect(balanceAfterBusd).to.be.equal(balanceBeforeBusd.add(rewardOfToken0))
            expect(balanceAfterUsdt).to.be.equal(balanceBeforeUsdt.add(rewardOfToken1))
        })

        it("third draw for 100% referal system activate", async () => {
            const [acct1, acct2] = await ethers.getSigners();
            await lottery.draw()
            const filter = lottery.filters.Victory()
            const data = await lottery.queryFilter(filter)
            const refererReward0 = data[1].args._amountToken0.div(100).mul(3)
            const refererReward1 = data[1].args._amountToken1.div(100).mul(3)
            await lottery.afterDraw([{ wallet: acct1.address, reward0: refererReward0, reward1: refererReward1 }], refererReward0, refererReward1)

        })
        it('claim referal reward', async () => {
            const [acct1] = await ethers.getSigners();
            const rewardOfToken0 = await all.referal.balance(all.busd.address, acct1.address)
            const rewardOfToken1 = await all.referal.balance(all.usdt.address, acct1.address)
            const balanceBeforeBusd = await all.busd.balanceOf(acct1.address)
            const balanceBeforeUsdt = await all.usdt.balanceOf(acct1.address)
            await all.referal.connect(acct1).claimReward(all.busd.address)
            await all.referal.connect(acct1).claimReward(all.usdt.address)
            const balanceAfterBusd = await all.busd.balanceOf(acct1.address)
            const balanceAfterUsdt = await all.usdt.balanceOf(acct1.address)

            expect(rewardOfToken0).not.to.be.eq(0)
            expect(rewardOfToken1).not.to.be.eq(0)
            expect(balanceAfterBusd).to.be.equal(balanceBeforeBusd.add(rewardOfToken0))
            expect(balanceAfterUsdt).to.be.equal(balanceBeforeUsdt.add(rewardOfToken1))
        })
        it("deposit", async () => {
            const [acct1, acct2, acct3] = await ethers.getSigners();

            await lottery.deposit(all.usdc.address, decimals);
        });
    }
    mainLogic(true)
    // mainLogic(false)
});

export default mainLogic;
