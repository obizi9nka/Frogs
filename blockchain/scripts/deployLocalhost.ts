
const utils = require("./main");

import { deployAll } from "../test/fixtures/fixtures";

const prefix = 'localhost_'

async function main() {
  const { usdc, usdt, busd, pool_busd_usdt, pool_busd_usdc, pool_usdt_usdc, lottery_busd_usdt, pancakeFactory, router, nonfungiblePositionManager, factory, referal, fee } = await deployAll()

  await utils.saveAddress(prefix + "Pool_busd_usdt_fee", fee)
  // // ==================
  // //        USDC
  // // ==================

  await utils.saveAddress(prefix + "USDC", usdc.address)
  // // ==================
  // //        USDT
  // // ==================

  await utils.saveAddress(prefix + "USDT", usdt.address)
  // // ==================
  // //        BUSD
  // // ==================

  await utils.saveAddress(prefix + "BUSD", busd.address)

  // // ==================
  // //     FrogReferal
  // // ==================

  await utils.saveAddress(prefix + "FrogReferal", referal.address)



  // // ==================
  // //   PancakeFactory
  // // ==================

  await utils.saveAddress(prefix + "PancakeFactory", pancakeFactory.address)


  await utils.saveAddress(prefix + "Pool_busd_usdt", pool_busd_usdt.address)
  await utils.saveAddress(prefix + "Pool_busd_usdc", pool_busd_usdc.address)
  await utils.saveAddress(prefix + "Pool_usdt_usdc", pool_usdt_usdc.address)

  // // ==================
  // //  NonfungiblePositionManager
  // // ==================

  await utils.saveAddress(prefix + "NonfungiblePositionManager", nonfungiblePositionManager.address)

  // // ==================
  // //       Router
  // // ==================

  await utils.saveAddress(prefix + "SwapRouter", router.address)

  // // ==================
  // //       FrogFactory
  // // ==================

  await utils.saveAddress(prefix + "FrogFactory", factory.address)
  await utils.saveAddress(prefix + "Lottery_busd_usdt", lottery_busd_usdt.address)

  console.log('DEPLOYED')
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});