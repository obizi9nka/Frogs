const { expect } = require("chai");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const {ethers} = require("hardhat");

describe("Random contract", function () {
    it('1,1', async function(){
        const Random = await ethers.getContractFactory("Random");
        const random = await Random.deploy();

        for(let i=0;i<10;i++){
            console.log(await random.getRandomsWithRepeat(1,1));
        }
    })
})