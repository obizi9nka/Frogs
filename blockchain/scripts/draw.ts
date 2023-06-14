
const utils = require("./main");
import { ethers } from "hardhat";
import { deployAll } from "./fixtures/fixtures";
const prefix = 'localhost_'
import lottery from "../artifacts/contracts/frogs/FrogLottery.sol/FrogLottery.json"

import constants from "./json/constants.json"
import { FrogLottery } from "../typechain-types";

async function main() {
  const [acct1] = await ethers.getSigners();
  const lottery_busd_usdt = new ethers.Contract(constants.addresses.localhost_Lottery_busd_usdt, lottery.abi, acct1) as FrogLottery

  await lottery_busd_usdt.draw()
  console.log('DRAWED')
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});