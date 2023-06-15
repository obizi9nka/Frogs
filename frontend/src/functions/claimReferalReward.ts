import Web3 from "web3";
import { abis, getConstants, rateDeposit, calculateAmountsForLiquidity, getPrice, sigAddress, fromLiqToUsd, fromAmountToUsd, executeFunc } from "./utils";
import BigNumber from 'bignumber.js';
import axios from "axios";

export async function claimReferalReward({ walletClient }: UserInputDepositStruct, { poolKey }: LotteyDataStruct, constants: ConstantsStruct) {
    const userAddress = walletClient?.account.address

    const web3 = new Web3(walletClient)
    const FrogReferal = new web3.eth.Contract(abis.FrogReferal, constants.frogReferal)

    const func = FrogReferal.methods.claimReward([poolKey.token0, poolKey.token1, constants.cake])

    await executeFunc(func, userAddress)
}

