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
            const [acct1, acct2] = await ethers.getSigners();
            await lottery.deposit(decimals, decimals);
            // const { message, v, r, s } = await sig(['address'], [acct2.address], acct1)
            // await lottery.connect(acct2).registerBeforeDeposit(message, v, r, s, decimals, isEthLottery ? decimals : equivalent, { value: isEthLottery ? decimals : equivalent })
        });
        // it("first empty draw", async () => {
        //     const [acct1, acct2] = await ethers.getSigners();
        //     await lottery.draw()
        //     expect(await lottery.drawNumber()).to.be.equal(0)
        //     const participants = await lottery.getParticipants()
        //     expect(participants.result[0]).to.be.equal(acct1.address)
        //     expect(participants.result[1]).to.be.equal(acct2.address)
        // })
        // it('withdraw', async () => {
        //     const [acct1, acct2] = await ethers.getSigners();
        //     const balance = await lottery.balanceOf(acct1.address)
        //     await lottery.withdraw(balance)
        // })
        // let isFirstWinner = false;
        // it("second draw with participants", async () => {
        //     const [acct1, acct2] = await ethers.getSigners();
        //     await lottery.draw()
        //     expect(await lottery.drawNumber()).to.be.equal(1)
        //     const first = parseInt((await lottery.rewardOf(acct1.address)).toString())
        //     if (first > 0)
        //         isFirstWinner = true
        //     const rewardNotZero = first + parseInt((await lottery.rewardOf(acct2.address)).toString())
        //     expect(rewardNotZero).not.to.equal(0)

        //     const filter = lottery.filters.Victory()
        //     const data = await lottery.queryFilter(filter)
        //     const refererReward = data[0].args._amount.div(100).mul(3)
        //     await lottery.afterDraw([{ wallet: isFirstWinner ? ethers.constants.AddressZero : acct1.address, reward: refererReward }], refererReward)
        // })
        // it('claim reward', async () => {
        //     const [acct1, acct2] = await ethers.getSigners();
        //     let operator = acct2
        //     if (isFirstWinner)
        //         operator = acct1
        //     const reward = await lottery.rewardOf(operator.address)
        //     const balanceBefore = await all.cake.balanceOf(operator.address)
        //     await lottery.connect(operator).claimReward()
        //     expect(reward).not.to.be.eq(0)
        //     expect(await all.cake.balanceOf(operator.address)).to.be.equal(balanceBefore.add(reward))
        // })

        // it("third draw for 100% referal system activate", async () => {
        //     const [acct1, acct2] = await ethers.getSigners();
        //     await lottery.draw()
        //     const filter = lottery.filters.Victory()
        //     const data = await lottery.queryFilter(filter)
        //     const refererReward = data[1].args._amount.div(100).mul(3)
        //     await lottery.afterDraw([{ wallet: acct1.address, reward: refererReward }], refererReward)

        // })
        // it('claim referal reward', async () => {
        //     const [acct1] = await ethers.getSigners();
        //     const reward = await all.referal.balance(all.cake.address, acct1.address)
        //     const balanceBefore = await all.cake.balanceOf(acct1.address)
        //     await all.referal.connect(acct1).claimReward(all.cake.address)
        //     expect(reward).not.to.be.eq(0)
        //     expect(await all.cake.balanceOf(acct1.address)).to.be.equal(balanceBefore.add(reward))
        // })
    }
    mainLogic(true)
    // mainLogic(false)
});

export default mainLogic;
