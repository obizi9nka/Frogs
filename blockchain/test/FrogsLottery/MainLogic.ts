import { expect } from "chai";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { ethers } from "hardhat";

describe("FrogLottery contract", function () {
    async function deployTokenFixture() {
        const TCake = await ethers.getContractFactory("TCake");
        const hardhatTCake = await TCake.deploy();

        const FrogLottery = await ethers.getContractFactory('FrogLottery');
        const hardhatFrogLottery = await FrogLottery.deploy();

        const [deployer, addr1, addr2] = await ethers.getSigners();

        await hardhatTCake.deployed();
        await hardhatFrogLottery.deployed();

        return { hardhatTCake, hardhatFrogLottery, deployer, addr1, addr2 };
    }

    it("Deployer is owner", async function () {
        const { hardhatFrogLottery, deployer } = await loadFixture(deployTokenFixture);
        const ownerAddress = await hardhatFrogLottery.owner()
        expect(ownerAddress).to.equal(deployer.address);
    });
});
