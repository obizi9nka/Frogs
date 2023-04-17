import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { ethers } from "hardhat";
import { deployAll } from "../fixtures/fixtures";
import { allContractsFromDeploy } from "../../@types";
import { FrogLottery } from "../../typechain-types";

describe("FrogLottery MainLogic", function () {
    const decimals = BigInt(10 ** 18)
    let all: allContractsFromDeploy;
    let lottery: FrogLottery;
    this.beforeAll(async () => {
        all = await loadFixture(deployAll);
        lottery = all.lottery
    })
    it("deposit", async () => {
        const [acct1, acct2] = await ethers.getSigners();
        await lottery.deposit(decimals, decimals, { value: decimals })
        await lottery.connect(acct2).deposit(decimals, decimals, { value: decimals })
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
    let isFirstWinner = false;
    it("second draw with participants", async () => {
        const [acct1, acct2] = await ethers.getSigners();
        await lottery.draw()
        expect(await lottery.drawNumber()).to.be.equal(1)
        const first = parseInt((await lottery.rewardOf(acct1.address)).toString())
        if (first > 0)
            isFirstWinner = true
        const rewardNotZero = first + parseInt((await lottery.rewardOf(acct2.address)).toString())
        expect(rewardNotZero).not.to.equal(0)
    })
    it('claim reward', async () => {
        const [acct1, acct2] = await ethers.getSigners();
        let operator = acct2
        if (isFirstWinner)
            operator = acct1
        console.log(operator.address)
        const reward = await lottery.rewardOf(operator.address)
        const balanceBefore = await all.cake.balanceOf(operator.address)
        await lottery.connect(operator).claimReward()
        expect(await all.cake.balanceOf(operator.address)).to.be.equal(balanceBefore.add(reward))
    })
    it("third draw for 100% referal system activate", async () => {
        const [acct1, acct2] = await ethers.getSigners();
        await lottery.draw()
    })
    it('claim referal reward', async () => {
        const [acct1, acct2] = await ethers.getSigners();
        const reward = await all.referal.balance(all.cake.address, acct1.address)
        const balanceBefore = await all.cake.balanceOf(acct1.address)
        await all.referal.connect(acct1).claimReward(all.cake.address)
        expect(await all.cake.balanceOf(acct1.address)).to.be.equal(balanceBefore.add(reward))
        // console.log(await lottery.rewardOf(acct1.address))
        // console.log(await lottery.rewardOf(acct2.address))
        // console.log(await lottery.balanceOf(acct1.address))
        // console.log(await lottery.balanceOf(acct2.address))
        // console.log(await lottery.withdrawOf(acct1.address))
        // console.log(await lottery.withdrawOf(acct2.address))
    })
});
