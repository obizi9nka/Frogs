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
        const min = await lottery.minUsdt()
        const max = await lottery.maxUsdt()
        await lottery.setMinUsdt(min.sub(1))
        await lottery.setMaxUsdt(max.add(1))
        expect(await lottery.minUsdt()).to.be.equal(min.sub(1))
        expect(await lottery.maxUsdt()).to.be.equal(max.add(1))

        const tx = lottery.connect(acct2).setMinUsdt(1)
        await expect(tx).to.be.reverted
    });

    it('set fee percent', async () => {
        const [acct1, acct2] = await ethers.getSigners();
        const fee = lottery.setFeePercent(2900) // 29%
        await expect(fee).to.be.not.reverted
    })
});
