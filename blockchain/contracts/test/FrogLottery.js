const { expect } = require("chai");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { ethers } = require("hardhat");

// const {ethers} = require("hardhat");
// const {web3} = require("hardhat");


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

// describe("FrogLottery contract", function () {
//     async function deployTokenFixture() {
//         const TCake = await ethers.getContractFactory("TCake");
//         const hardhatTCake = await TCake.deploy();
//
//         const FrogLottery = await ethers.getContractFactory('FrogLottery');
//         const hardhatFrogLottery = await FrogLottery.deploy();
//
//         const [deployer, addr1, addr2] = await ethers.getSigners();
//
//         await hardhatTCake.deployed();
//         await hardhatFrogLottery.deployed();
//
//         return { hardhatTCake, hardhatFrogLottery, deployer, addr1, addr2 };
//     }
//
//     it("Deployer is owner", async function () {
//         const { hardhatFrogLottery, deployer } = await loadFixture(deployTokenFixture);
//         const ownerAddress = await hardhatFrogLottery.owner()
//         expect(ownerAddress).to.equal(deployer.address);
//     });
//
//     it("Deployer is beneficiary", async function () {
//         const { hardhatFrogLottery, deployer } = await loadFixture(deployTokenFixture);
//         const beneficiaryAddress = await hardhatFrogLottery.beneficiary()
//         expect(beneficiaryAddress).to.equal(deployer.address);
//     });
//
//     it("Should change beneficiary", async function () {
//         const { hardhatFrogLottery, deployer, addr1 } = await loadFixture(deployTokenFixture);
//         await hardhatFrogLottery.setBeneficiary(addr1.address);
//         const beneficiaryAddress = await hardhatFrogLottery.beneficiary()
//         expect(beneficiaryAddress).to.equal(addr1.address);
//     });
// });
//
// describe("TCake contract", function () {
//     async function deployTokenFixture() {
//         const TCake = await ethers.getContractFactory("TCake");
//         const hardhatTCake = await TCake.deploy();
//
//         const FrogLottery = await ethers.getContractFactory('FrogLottery');
//         const hardhatFrogLottery = await FrogLottery.deploy();
//
//         const [deployer, addr1, addr2] = await ethers.getSigners();
//
//         await hardhatTCake.deployed();
//         await hardhatFrogLottery.deployed();
//
//         return { hardhatTCake, hardhatFrogLottery, deployer, addr1, addr2 };
//     }
//
//     it("Deployer get all of TotalSupply", async function () {
//         const { hardhatTCake, deployer } = await loadFixture(deployTokenFixture);
//         const deployerBalance = await hardhatTCake.balanceOf(deployer.address)
//         expect(deployerBalance).to.equal(await hardhatTCake.totalSupply());
//     });
// });