import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { ethers } from "hardhat";
import { deployAll } from "../fixtures/fixtures";
import { allContractsFromDeploy } from "../../@types";
import { FrogLottery } from "../../typechain-types";

describe("FrogLottery Extra", function () {
    const decimals = BigInt(10 ** 18)
    let all: allContractsFromDeploy;
    let lottery: FrogLottery;
    this.beforeAll(async () => {
        all = await loadFixture(deployAll);
        lottery = all.lottery
    })
    it("set min and max usdt", async () => {
        const [acct1, acct2] = await ethers.getSigners();
        const min = await lottery.minUsd()
        const max = await lottery.maxUsd()
        await lottery.setMinUsd(min.sub(1))
        await lottery.setMaxUsd(max.add(1))
        expect(await lottery.minUsd()).to.be.equal(min.sub(1))
        expect(await lottery.maxUsd()).to.be.equal(max.add(1))

        const tx = lottery.connect(acct2).setMinUsd(1)
        await expect(tx).to.be.reverted
    });

    it('setFeePercent', async () => {
        const [acct1, acct2] = await ethers.getSigners();
        const fee = lottery.setFeePercent(2900) // 29%
        await expect(fee).to.be.not.reverted
    })

    it('isParticipant', async () => {
        const [acct1, acct2] = await ethers.getSigners();
        const value = BigInt(10 ** 18)
        await lottery.deposit(value, value, { value })
        expect(await lottery.isParticipant(acct1.address)).to.be.equal(true)
        expect(await lottery.isParticipant(acct2.address)).to.be.eq(false)
    })

    it('setAll', async () => {
        const [acct1, acct2] = await ethers.getSigners();
        const z = ethers.constants.AddressZero

        const tx = lottery.connect(acct2).setAll(z, z, z, z, z, z)
        await expect(tx).to.be.reverted
    })

    it('farmTotal', async () => {
        const [acct1, acct2] = await ethers.getSigners();
        const farm = await lottery.farmTotal()

        expect(farm).to.be.above(-1)
    })

    it('claimReward', async () => {
        const [acct1, acct2, acct3] = await ethers.getSigners();

        const tx = lottery.connect(acct3).claimReward()
        await expect(tx).to.be.revertedWith('Reward is empty')
    })

    it('rateLPTokens', async () => {
        const [token0, token1] = await lottery.rateLPTokens()
        expect(token0).to.be.above(-1)
        expect(token1).to.be.above(-1)
    })

    it('setBeneficiary lottery', async () => {
        const [acct1, acct2] = await ethers.getSigners();
        await all.referal.setBeneficiary(acct2.address)
        expect(await all.referal.beneficiary()).to.be.eq(acct2.address)
    })

    it('setBeneficiary referal', async () => {
        const [acct1, acct2] = await ethers.getSigners();
        await lottery.setBeneficiary(acct2.address)
        expect(await lottery.beneficiary()).to.be.eq(acct2.address)
    })
});
