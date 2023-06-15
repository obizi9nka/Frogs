import Web3 from "web3";
import { abis, getConstants, rateDeposit, calculateAmountsForLiquidity, getPrice, sigAddress, fromLiqToUsd, fromAmountToUsd, executeFunc } from "./utils";
import BigNumber from 'bignumber.js';
import axios from "axios";

export async function claimReward({ walletClient, }: UserInputDepositStruct, constants: ConstantsStruct) {
    const userAddress = walletClient?.account.address

    const web3 = new Web3(walletClient)
    const FrogContract = new web3.eth.Contract(abis.FrogLottery as any, constants.frogLottery)

    const func = FrogContract.methods.claimReward()
    await executeFunc(func, userAddress)
}

