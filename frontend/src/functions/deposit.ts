import Web3 from "web3";
import { getAbis, getConstants, rateDeposit, calculateAmountsForLiquidity, getPrice, sigAddress, fromLiqToUsd, fromAmountToUsd } from "./utils";
import BigNumber from 'bignumber.js';
import axios from "axios";

const abis = getAbis

export async function deposit({ tokenAddressSelected, walletClient, depositAmount, }: UserInputDepositStruct, { frogBalances, sqrtPriceX96_token0_token1, minUsd, maxUsd }: LotteyDataStruct, constants: ConstantsStruct) {
    const userAddress = walletClient?.account.address

    const depositAmountWithDecimals = BigInt(depositAmount.toString()) * BigInt(1e18)

    const web3 = new Web3(walletClient)
    const FrogContract = new web3.eth.Contract(abis.FrogLottery as any, constants.frogLottery)
    const Token = new web3.eth.Contract(abis.ERC20 as any, tokenAddressSelected)

    let tokenBalance = BigNumber(0)

    Token.methods.balanceOf(userAddress).call()
        .then(async (balance: any) => {
            tokenBalance = BigNumber(balance).div(BigNumber(10 ** 18))
        })
    const token0 = await FrogContract.methods.token0().call()
    const token1 = await FrogContract.methods.token1().call()
    const poolFee = await FrogContract.methods.poolFee().call()
    const frogBalancesUsd = await fromLiqToUsd(walletClient, frogBalances.depositOf + frogBalances.balanceOf - frogBalances.withdrawOf, constants, { token0, token1, poolFee })
    const depositUsd = await fromAmountToUsd(walletClient, depositAmount, tokenAddressSelected, constants.stable, poolFee)

    if (frogBalancesUsd + depositUsd < parseInt((minUsd / BigInt(1e18)).toString()) || frogBalancesUsd + depositUsd > parseInt((maxUsd / BigInt(1e18)).toString())) {
        throw new Error('Amount of balance must be in $' + minUsd + ' .. $' + maxUsd + "|" + `${frogBalancesUsd}` + ` ${frogBalancesUsd}`)
    }
    else {
        const FrogReferal = new web3.eth.Contract(abis.FrogReferal as any, constants.frogReferal)
        const isPartisipant = await FrogReferal.methods.alreadyParticipant(userAddress).call()
        const approve = async (tokenAddress: string) => {
            const token = new web3.eth.Contract(abis.ERC20 as any, tokenAddress)
            const allowance = await token.methods.allowance(userAddress, constants.frogLottery).call();
            if (depositAmountWithDecimals > allowance) {
                const approveCake = await token.methods.approve(constants.frogLottery, depositAmountWithDecimals)
                    .send({
                        from: userAddress
                    })
                    .on('sending', () => {
                        console.log('Waiting for confirmation')
                    })
                if (approveCake.status != true) {
                    throw new Error('Something went wrong with tCake approve!')
                }
            }

        }
        approve(constants.token0)
        approve(constants.token1)
        if (tokenAddressSelected == constants.stable)
            approve(constants.stable)

        const executeFunc = async (func: any) => {
            func.send({
                from: userAddress,
                value: 0
            })
                .on('sending', () => {
                    console.log('Waiting for confirmation')
                })
                .on('error', (error: any) => {
                    if (error.code != 4001)
                        throw new Error('Transaction error: ' + JSON.stringify(error))
                })
                .on('receipt', () => {
                    console.log('Your tokens sent to deposit!')
                })
        }
        if (isPartisipant) {
            const deposit = FrogContract.methods.deposit(
                tokenAddressSelected,
                depositAmountWithDecimals
            )
            await executeFunc(deposit)

        } else {
            const userData = {
                wallet: userAddress,
                refererWallet: await FrogContract.methods.beneficiary().call(),
                sig: ""
            }
            await axios.post('/api/createUser', userData).then(async (data: any) => {
                const { message, v, r, s } = await sigAddress(userAddress, constants.privateKey)
                const registerBeforeDeposit = FrogContract.methods.registerBeforeDeposit(
                    message, v, r, s,
                    tokenAddressSelected,
                    depositAmountWithDecimals
                )
                await executeFunc(registerBeforeDeposit)

            }).catch((data) => {
                throw new Error(data)
            })



        }
    }
}

