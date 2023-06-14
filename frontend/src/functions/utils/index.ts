import _constants from "../../../../blockchain/scripts/json/constants.json"

import ERC20Token from '../../../../blockchain/artifacts/contracts/frogs/ERC20.sol/ERC20Token.json'
import FrogLottery from '../../../../blockchain/artifacts/contracts/frogs/FrogLottery.sol/FrogLottery.json'
import FrogFactory from '../../../../blockchain/artifacts/contracts/frogs/FrogFactory.sol/FrogFactory.json'
import FrogReferal from "../../../../blockchain/artifacts/contracts/frogs/FrogReferal.sol/FrogReferal.json"
import PancakeV3Pool from "../../../../blockchain/artifacts/contracts/v3-core/PancakeV3Pool.sol/PancakeV3Pool.json"
import PancakeV3Factory from "../../../../blockchain/artifacts/contracts/v3-core/PancakeV3Factory.sol/PancakeV3Factory.json"
import NonfungiblePositionManager from "../../../../blockchain/artifacts/contracts/v3-periphery/NonfungiblePositionManager.sol/NonfungiblePositionManager.json"
import Router from "../../../../blockchain/artifacts/contracts/router/SmartRouter.sol/SmartRouter.json"
import { ethers } from "ethers"
import JSBI from "jsbi"
import BigNumber from 'bignumber.js';
import Web3 from "web3"


export const getConstants = (prefix: string | number | undefined) => {

    const constants = _constants as any

    if (typeof prefix == 'number' || typeof prefix == 'undefined') {
        if (prefix == 31337)
            prefix = 'localhost_'
        else if (prefix == 11155111)
            prefix = 'sepolia_'
        else if (prefix == 56)
            prefix = 'bsc_'
    }

    const data = {
        token0: constants.addresses[prefix + 'BUSD'],
        token1: constants.addresses[prefix + 'USDT'],
        stable: constants.addresses[prefix + 'USDC'],
        cake: constants.addresses[prefix + 'CAKE'],
        wbnb: constants.addresses[prefix + 'WBNB'],
        pool_token0_stable: constants.addresses[prefix + 'Pool_busd_usdc'],
        pool_token1_stable: constants.addresses[prefix + 'Pool_usdt_usdc'],
        pool_token0_token1: constants.addresses[prefix + 'Pool_busd_usdt'],
        manager: constants.addresses[prefix + 'NonfungiblePositionManager'],
        router: constants.addresses[prefix + 'SwapRouter'],
        factory: constants.addresses[prefix + 'PancakeFactory'],
        mc: constants.addresses[prefix + 'MC'],
        fee: constants.addresses[prefix + 'Pool_busd_usdt_fee'],
        frogReferal: constants.addresses[prefix + 'FrogReferal'],
        frogLottery: constants.addresses[prefix + 'Lottery_busd_usdt'],
        frogFactory: constants.addresses[prefix + 'FrogFactory'],
        privateKey: constants[prefix + 'privateKey']
    }

    return data;

}

export const getAbis = {
    ERC20: ERC20Token.abi as any,
    FrogLottery: FrogLottery.abi as any,
    FrogFactory: FrogFactory.abi as any,
    FrogReferal: FrogReferal.abi as any,
    PancakeV3Pool: PancakeV3Pool.abi as any,
    PancakeV3Factory: PancakeV3Factory.abi as any,
    Manager: NonfungiblePositionManager.abi as any,
    Router: Router.abi as any,
}
const abis = getAbis

export async function calculateAmountsForLiquidity(sqrtPriceX96: any, currentTick: any, tickLower: any, tickUpper: any, liquidity: any, isMinus: boolean, frogContract: any) {
    const data = await frogContract.methods.calculateAmountsForLiquidity(sqrtPriceX96, BigInt(currentTick), BigInt(tickLower), BigInt(tickUpper), BigInt(liquidity), isMinus).call()
    return data
}

export function getPrice(amount: number, sqrtPriceX96: any, token0Decimals: any, token1Decimals: any, tokenIn: string, tokenOut: string) {
    const isReversed = parseInt(tokenIn) > parseInt(tokenOut)
    const ratioX192 = BigInt(sqrtPriceX96 * sqrtPriceX96) // JSBI.multiply(sqrtRatioX96, sqrtRatioX96)

    const baseAmount = JSBI.BigInt((10 ** token0Decimals))

    const shift = JSBI.leftShift(JSBI.BigInt(1), JSBI.BigInt(192))
    const quote = BigNumber(ratioX192.toString()).times(baseAmount.toString()).dividedBy(shift.toString())
    const price = quote.div(10 ** token1Decimals).toNumber()
    console.log(price)
    return ((isReversed && price != 0) ? 1 / price : price) * amount
}

export async function rateDeposit(constants: any, walletClient: any, tokenAddressSelected: string, depositAmount: any) {
    const sqrtPriceX96_token0_token1 = (await (new ethers.Contract(constants.pool_token0_token1, abis.PancakeV3Pool, new ethers.BrowserProvider(walletClient))).slot0()).sqrtPriceX96
    const sqrtPriceX96_token0_stable = (await (new ethers.Contract(constants.pool_token0_stable, abis.PancakeV3Pool, new ethers.BrowserProvider(walletClient))).slot0()).sqrtPriceX96
    const sqrtPriceX96_token1_stable = (await (new ethers.Contract(constants.pool_token1_stable, abis.PancakeV3Pool, new ethers.BrowserProvider(walletClient))).slot0()).sqrtPriceX96

    let t0_stbl = getPrice(1, sqrtPriceX96_token0_stable, 18, 18, constants.token0, constants.stable)
    let t1_stbl = getPrice(1, sqrtPriceX96_token1_stable, 18, 18, constants.token1, constants.stable)
    let firstPart = 0;
    let secndPart = 0;
    const t0_t1 = getPrice(1, sqrtPriceX96_token0_token1, 18, 18, constants.token0, constants.token1)
    const t1_t0 = 1 / t0_t1
    let value
    switch (tokenAddressSelected) {
        case constants.token0:
            firstPart = (t0_stbl) * (depositAmount / 2) //
            secndPart = (t1_stbl) * (depositAmount / 2 * (t0_t1)) //
            break;
        case constants.token1:
            firstPart = (t0_stbl) * (depositAmount / 2 * (t1_t0)) //
            secndPart = (t1_stbl) * (depositAmount / 2) //
            break;
        case constants.stable:
            firstPart = (t0_stbl) * (depositAmount / 2 * (1 / t0_stbl)) //
            secndPart = (t1_stbl) * (depositAmount / 2 * (1 / t1_stbl)) //
            break;
    }
    return firstPart + secndPart
}

export async function sigAddress(user: string, privateKey: string) {
    const sig = async (types: string[], values: any[], signer: any) => {
        const coder = ethers.AbiCoder.defaultAbiCoder()
        const message = coder.encode(types, values);
        const messageHash = ethers.keccak256(message);
        const messageHashBytes = ethers.getBytes(messageHash);

        const sig1 = await signer.signMessage(messageHashBytes);

        const { v, r, s } = ethers.Signature.from(sig1);
        return {
            message,
            messageHash,
            v,
            r,
            s,
        };
    };
    const { message, v, r, s } = await sig(['address'], [user], new ethers.Wallet(privateKey))
    return { message, v, r, s }
}

export async function fromAmountToUsd(walletClient: any, amount: number, tokenIn: string, tokenOut: string, poolFee: number) {
    const web3 = new Web3(walletClient)

    const constants = getConstants(walletClient.chain.id)

    const poolAddress = await new web3.eth.Contract(abis.PancakeV3Factory, constants.factory).methods.getPool(tokenIn, tokenOut, poolFee).call()

    const sqrtPriceX96 = (await new web3.eth.Contract(abis.PancakeV3Pool, poolAddress).methods.slot0().call()).sqrtPriceX96
    const decimals0 = await new web3.eth.Contract(abis.ERC20, tokenIn).methods.decimals().call()
    const decimals1 = await new web3.eth.Contract(abis.ERC20, tokenOut).methods.decimals().call()

    const price = getPrice(amount, sqrtPriceX96, decimals0, decimals1, tokenIn, tokenOut)
    return price;
}

export async function fromLiqToUsd(walletClient: any, liquidity: BigInt, constants: ConstantsStruct, poolKey: PoolKey) {
    const web3 = new Web3(walletClient)

    const poolAddress = await (new web3.eth.Contract(abis.PancakeV3Factory, constants.factory)).methods.getPool(poolKey.token0, poolKey.token1, poolKey.poolFee).call()
    const sqrtPriceX96 = (await new web3.eth.Contract(abis.PancakeV3Pool, poolAddress).methods.slot0().call()).sqrtPriceX96

    const amounts = await fromLiqToAmount(walletClient, liquidity, constants, sqrtPriceX96)

    const token0Value = await fromAmountToUsd(walletClient, amounts.amount0, poolKey.token0, constants.stable, poolKey.poolFee)
    const token1Value = await fromAmountToUsd(walletClient, amounts.amount1, poolKey.token1, constants.stable, poolKey.poolFee)

    return token0Value + token1Value;
}

export async function fromLiqToAmount(walletClient: any, liquidity: BigInt, constants: ConstantsStruct, sqrtPriceX96: BigInt) {
    const web3 = new Web3(walletClient)

    const FrogContract = new web3.eth.Contract(abis.FrogLottery, constants.frogLottery)
    const Manager = new web3.eth.Contract(abis.Manager, constants.manager)
    const Pool = new web3.eth.Contract(abis.PancakeV3Pool, constants.pool_token0_token1)

    const slot0 = await Pool.methods.slot0().call()
    const tokenId = await FrogContract.methods.tokenId().call()
    const position = await Manager.methods.positions(tokenId).call()

    const amounts = await calculateAmountsForLiquidity(sqrtPriceX96, slot0.tick, position.tickLower, position.tickUpper, liquidity, true, FrogContract)
    return amounts;
}   