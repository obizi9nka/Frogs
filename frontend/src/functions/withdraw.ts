import Web3 from "web3";
import { abis, getConstants, rateDeposit, calculateAmountsForLiquidity, getPrice, sigAddress, fromLiqToUsd, checkUsdFrogBalanceRange } from "./utils";
import BigNumber from 'bignumber.js';
import axios from "axios";


export async function withdraw({ withdrawAmount, walletClient }: UserInputWithdrawStuct, { frogBalances, minUsd, maxUsd }: LotteyDataStruct, constants: ConstantsStruct) {

    if (parseFloat(withdrawAmount) <= 0) {
        throw new Error("Withdraw must be > 0")
    }
    const web3 = new Web3(walletClient)
    const FrogContract = new web3.eth.Contract(abis.FrogLottery as any, constants.frogLottery)

    const userAddress = walletClient?.account.address

    if (frogBalances.depositOf + frogBalances.balanceOf - frogBalances.withdrawOf < parseFloat(withdrawAmount)) {
        throw new Error("Not enough LP")
    }

    const poolKey = await FrogContract.methods.poolKey().call()

    // const token0 = await FrogContract.methods.token0().call()
    // const token1 = await FrogContract.methods.token1().call()
    // const poolFee = await FrogContract.methods.poolFee().call()
    // const frogBalancesUsd = await fromLiqToUsd(walletClient, frogBalances.depositOf + frogBalances.balanceOf - frogBalances.withdrawOf, constants, { token0, token1, poolFee })
    // const depositUsd = await fromAmountToUsd(walletClient, parseFloat(depositAmount), tokenAddressSelected, constants.stable, poolFee)

    // if (frogBalancesUsd + depositUsd < parseInt((minUsd / BigInt(1e18)).toString()) || frogBalancesUsd + depositUsd > parseInt((maxUsd / BigInt(1e18)).toString())) {
    //     throw new Error('Amount of balance must be in $' + minUsd + ' .. $' + maxUsd + "|" + `${frogBalancesUsd}` + ` ${frogBalancesUsd}`)
    // }


    const result = await checkUsdFrogBalanceRange(poolKey, { liquidity: frogBalances.depositOf + frogBalances.balanceOf - frogBalances.withdrawOf, amount: BigInt(withdrawAmount), walletClient }, { frogBalances, minUsd, maxUsd } as LotteyDataStruct, constants)
    if (typeof result == typeof Error)
        throw result
    else {
        await FrogContract.methods.withdraw(
            withdrawAmount.toString()
        )
            .send({
                from: userAddress
            })
            .on('sending', () => {
                console.log('Waiting for confirmation')
            })
            .on('error', (error: any) => {
                console.log('Transaction error: ' + JSON.stringify(error))
            })
            .on('receipt', (receipt: any) => {
                console.log('Your lp was sent to withdraw!')
            })
    }


}

