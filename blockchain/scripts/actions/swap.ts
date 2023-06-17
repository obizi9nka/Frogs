
import { ethers } from "hardhat";
import lottery from "../../artifacts/contracts/frogs/FrogLottery.sol/FrogLottery.json"
import roter from "../../artifacts/contracts/router/SmartRouter.sol/SmartRouter.json"

import constants from "../json/constants.json"
import { FrogLottery, SmartRouter } from "../../typechain-types";

const is0To1 = true

async function main() {
  const [acct1] = await ethers.getSigners();
  const lottery_busd_usdt = new ethers.Contract(constants.addresses.localhost_Lottery_busd_usdt, lottery.abi, acct1) as FrogLottery

  const router = new ethers.Contract(constants.addresses.localhost_SwapRouter, roter.abi, acct1) as SmartRouter

  const poolKey = await lottery_busd_usdt.poolKey()
  const params = {
    tokenIn: is0To1 ? poolKey.token0 : poolKey.token1,
    tokenOut: is0To1 ? poolKey.token1 : poolKey.token0,
    fee: poolKey.poolFee,
    recipient: acct1.address,
    amountIn: BigInt(1e21),
    amountOutMinimum: 0,
    sqrtPriceLimitX96: 0
  }

  await router.exactInputSingle(params)


  console.log('Swaped')
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});