import Web3 from "web3";
import { abis, getConstants, rateDeposit, calculateAmountsForLiquidity, getPrice, sigAddress, fromLiqToUsd, fromAmountToUsd, executeFunc, checkUsdFrogBalanceRange } from "./utils";
import BigNumber from 'bignumber.js';
import axios from "axios";


export async function deposit({ tokenAddressSelected, walletClient, depositAmount, }: UserInputDepositStruct, { frogBalances, sqrtPriceX96_token0_token1, minUsd, maxUsd }: LotteyDataStruct, constants: ConstantsStruct) {
    const userAddress = walletClient?.account.address

    depositAmount = BigInt(parseFloat(depositAmount) * 1e18) as unknown as string

    const web3 = new Web3(walletClient)
    const FrogContract = new web3.eth.Contract(abis.FrogLottery as any, constants.frogLottery)
    const Token = new web3.eth.Contract(abis.ERC20 as any, tokenAddressSelected)

    let tokenBalance = BigNumber(0)

    Token.methods.balanceOf(userAddress).call()
        .then(async (balance: any) => {
            tokenBalance = BigNumber(balance).div(BigNumber(10 ** 18))
        })

    const poolKey = await FrogContract.methods.poolKey().call()

    const result = await checkUsdFrogBalanceRange(poolKey, { liquidity: frogBalances.depositOf + frogBalances.balanceOf - frogBalances.withdrawOf, amount: depositAmount, tokenAddressSelected: tokenAddressSelected, walletClient }, { frogBalances, minUsd, maxUsd } as LotteyDataStruct, constants)
    if (result == undefined) {
        const FrogReferal = new web3.eth.Contract(abis.FrogReferal as any, constants.frogReferal)
        const isPartisipant = await FrogReferal.methods.alreadyParticipant(userAddress).call()
        const approve = async (tokenAddress: string) => {
            const token = new web3.eth.Contract(abis.ERC20 as any, tokenAddress)
            const allowance = await token.methods.allowance(userAddress, constants.frogLottery).call();
            if (depositAmount > allowance) {
                const approveCake = await token.methods.approve(constants.frogLottery, depositAmount)
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


        if (isPartisipant) {
            const deposit = FrogContract.methods.deposit(
                tokenAddressSelected,
                depositAmount
            )
            await executeFunc(deposit, userAddress)

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
                    depositAmount
                )
                await executeFunc(registerBeforeDeposit, userAddress)

            }).catch((data) => {
                throw new Error(data)
            })
        }

    }
    else {
        throw result
    }
}
