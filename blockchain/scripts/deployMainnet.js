const hre = require("hardhat");
const utils = require("./main");
const Ethers = require('ethers')
const json = require("../artifacts/contracts/FrogLottery.sol/FrogLottery.json")

async function main() {
    const [acct1, acct2] = await ethers.getSigners();

    // ==================
    //        USDT
    // ==================

    console.log(1)

    //   const USDT = await hre.ethers.getContractFactory('ERC20Token');
    //   const usdt = await USDT.deploy('USDT', "usdt");

    //   await usdt.deployed();
    //   await utils.saveAddress("USDT", usdt.address)

    //   // ==================
    //   //        CAKE
    //   // ==================

    //   console.log(1)


    //   const CAKE = await hre.ethers.getContractFactory('CakeToken');
    //   const cake = await CAKE.deploy();

    //   await cake.deployed();
    //   await utils.saveAddress("CAKE", cake.address)

    //   // ==================
    //   //         BNB
    //   // ==================
    //   console.log(1)

    //   const BNB = await hre.ethers.getContractFactory('TBnb');
    //   const bnb = await BNB.deploy();

    //   await bnb.deployed();
    //   await utils.saveAddress("BNB", bnb.address)

    // ==================
    //     FrogReferal
    // ==================
    console.log(1)

    const Referal = await hre.ethers.getContractFactory('FrogLottery');
    // const referal = await Referal.deploy(acct1.address);
    const referal = await Referal.deploy("0xB1C43021C7E9a99e63C912C9b9129bE2c0561D33");

    await referal.deployed();
    await utils.saveAddress("FrogLottery", referal.address)

    // ==================
    //       Factory
    // ==================
    console.log(1)

    // const Factory = await hre.ethers.getContractFactory('Factory');
    // const factory = await Factory.deploy(referal.address);

    // await referal.setFactoryAddress(factory.address)

    // await factory.deployed();
    // await utils.saveAddress("Factory", factory.address)
    console.log(1)

    //   // ==================
    //   //     MasterChef
    //   // ==================

    //   const SyrupBar = await hre.ethers.getContractFactory('SyrupBar');
    //   const syrupBar = await SyrupBar.deploy(cake.address);

    //   await syrupBar.deployed();
    //   await utils.saveAddress("SyrupBar", syrupBar.address)

    //   const MasterChef = await hre.ethers.getContractFactory('MasterChef');
    //   const masterChef = await MasterChef.deploy(cake.address, syrupBar.address, acct1.address, BigInt(10 ** 18), 0);

    //   await masterChef.deployed();
    //   await utils.saveAddress("MasterChef", masterChef.address)

    //   console.log(1)

    //   // ==================
    //   //   PancakeFactory
    //   // ==================

    //   const PancakeFactory = await hre.ethers.getContractFactory('PancakeFactory');
    //   const pancakeFactory = await PancakeFactory.deploy(acct1.address);

    //   await pancakeFactory.deployed();
    //   await utils.saveAddress("PancakeFactory", pancakeFactory.address)

    //   // ==================
    //   //       Router
    //   // ==================

    //   const Router = await hre.ethers.getContractFactory('PancakeRouter');
    //   const router = await Router.deploy(pancakeFactory.address, bnb.address);

    //   await router.deployed();
    //   await utils.saveAddress("Router", router.address)

    //   console.log(1)

    //   // ==================
    //   //  Lottery CAKE-BNB
    //   // ==================

    //   const lotteryAddress = await factory.cake_bnb()
    //   await utils.saveAddress("Lottery_CAKE_BNB", lotteryAddress)


    //   // await bnb.connect(acct1).approve(operator, TOKENS_VALUE_20);
    //   // await bnb.connect(acct2).approve(operator, TOKENS_VALUE_20);
    //   const TOKENS_VALUE_20 = BigInt(10 ** 23)
    //   // await bnb.connect(acct1).deposit({ value: TOKENS_VALUE_20 });
    //   // await bnb.connect(acct2).deposit({ value: TOKENS_VALUE_20 });

    //   await cake.connect(acct1).getTokens(TOKENS_VALUE_20);
    //   await cake.connect(acct2).getTokens(TOKENS_VALUE_20);

    //   await usdt.connect(acct1).getTokens(TOKENS_VALUE_20);
    //   await usdt.connect(acct2).getTokens(TOKENS_VALUE_20);

    //   const lottery = new Ethers.Contract(lotteryAddress, json.abi, acct1)

    //   await cake.approve(router.address, TOKENS_VALUE_20)
    //   await bnb.approve(router.address, TOKENS_VALUE_20)
    //   await usdt.approve(router.address, TOKENS_VALUE_20)
    //   await cake.approve(lotteryAddress, TOKENS_VALUE_20)



    //   await pancakeFactory.createPair(cake.address, bnb.address)
    //   await utils.saveAddress("LPToken_CAKE_BNB", await pancakeFactory.getPair(cake.address, bnb.address))
    //   await router.addLiquidityETH(cake.address, BigInt(100000), 100000, 1, acct1.address, Math.round(Date.now() / 1000) + 60 * 20, { value: 100000 })


    //   await pancakeFactory.createPair(cake.address, usdt.address)
    //   await utils.saveAddress("LPToken_CAKE_USDT", await pancakeFactory.getPair(cake.address, usdt.address))
    //   await router.addLiquidity(cake.address, usdt.address, BigInt(100000000000000), BigInt(300000000000000), 1, 1, acct1.address, Math.round(Date.now() / 1000) + 60 * 20)


    //   await pancakeFactory.createPair(bnb.address, usdt.address)
    //   await utils.saveAddress("LPToken_BNB_USDT", await pancakeFactory.getPair(bnb.address, usdt.address))
    //   await router.addLiquidity(bnb.address, usdt.address, BigInt(100000000000000), BigInt(30000000000000000), 1, 1, acct1.address, Math.round(Date.now() / 1000) + 60 * 20)


    //   await lottery.setAll(cake.address, bnb.address, usdt.address, router.address, masterChef.address, await pancakeFactory.getPair(cake.address, bnb.address))
    //   await masterChef.add(1, await pancakeFactory.getPair(cake.address, bnb.address), 0)

    //   await referal.connect(acct2).add(acct1.address)
    //   // await lottery.deposit(BigInt(5000000000000039000000))
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
