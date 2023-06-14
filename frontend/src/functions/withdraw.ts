import Web3 from "web3";
import { getAbis, getConstants, rateDeposit, calculateAmountsForLiquidity, getPrice, sigAddress, fromLiqToUsd } from "./utils";
import BigNumber from 'bignumber.js';
import axios from "axios";

const abis = getAbis

export async function withdraw({ withdrawAmount, walletClient }: UserInputWithdrawStuct, { frogBalances, minUsd, maxUsd }: LotteyDataStruct, constants: ConstantsStruct) {
    if (withdrawAmount <= 0) {
        throw new Error("Withdraw must be > 0")
    }
    const web3 = new Web3(walletClient)
    const FrogContract = new web3.eth.Contract(abis.FrogLottery as any, constants.frogLottery)

    const userAddress = walletClient?.account.address

    if (frogBalances.depositOf + frogBalances.balanceOf - frogBalances.withdrawOf < withdrawAmount) {
        throw new Error("Not enough LP")
    }
    const token0 = await FrogContract.methods.token0().call()
    const token1 = await FrogContract.methods.token1().call()
    const poolFee = await FrogContract.methods.poolFee().call()
    const usdValue = await fromLiqToUsd(walletClient, frogBalances.depositOf + frogBalances.balanceOf - frogBalances.withdrawOf - BigInt(withdrawAmount), constants, { token0, token1, poolFee })

    const _minUsd = parseFloat((minUsd.toString() as any / (1e18.toString() as any)).toString())
    const _maxUsd = parseFloat((maxUsd.toString() as any / (1e18.toString() as any)).toString())
    const _usdValue = parseFloat((usdValue.toString() as any / (1e18.toString() as any)).toString())
    if (_usdValue < _minUsd || _usdValue > _maxUsd) {
        throw new Error('Amount of balance must be in $' + _minUsd + ' .. $' + _maxUsd + "|" + `${_usdValue}`)
    }

    if (confirm("You want to withdraw: \n" + withdrawAmount + " LP?")) {
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

