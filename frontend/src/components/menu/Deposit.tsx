import { deposit } from "@/functions/deposit"
import { abis } from "@/functions/utils"
import { useEffect, useState } from "react"
import { useWalletClient } from "wagmi"
import Web3 from "web3"
import { Router } from "../types/export"
import { RouterEnum } from "@/types/exports"

export function Deposit({ setRouter, constants, lotteryData }: DepositStuct & Router) {
    const { data } = useWalletClient()


    const [userInputDeposit, setUserInputDeposit] = useState({
        tokenAddressSelected: constants.token0,
        walletClient: data,
        depositAmount: "0",
    } as UserInputDepositStruct)

    useEffect(() => {
        userInputDeposit.tokenAddressSelected = lotteryData.poolKey?.token0
        setUserInputDeposit({ ...userInputDeposit })
    }, [lotteryData.poolKey?.token0])



    const [isUserTryedInput, setisUserTryedInput] = useState(false)

    useEffect(() => {
        userInputDeposit.walletClient = data
        setUserInputDeposit({ ...userInputDeposit })
    }, [data])

    useEffect(() => {
        if (data?.account.address != undefined && lotteryData.poolKey?.poolFee != undefined)
            getBalances(data?.account.address)
    }, [data?.account.address, lotteryData])

    const [balances, setBalances] = useState({
        token0: 0,
        token1: 0,
        stable: 0,
    } as any)


    const getBalances = async (userAddress: string) => {
        const web3 = new Web3(data as any)
        const getBalance = async (tokenAddress: string) => {
            const token = new web3.eth.Contract(abis.ERC20 as any, tokenAddress)
            const decimals = await token.methods.decimals().call()
            return (BigInt(await token.methods.balanceOf(userAddress).call()) / BigInt(10 ** decimals)).toString()
        }
        setBalances({
            token0: await getBalance(lotteryData.poolKey.token0),
            token1: await getBalance(lotteryData.poolKey.token1),
            stable: await getBalance(constants.stable),
        })
    }

    const callDeposit = async () => {
        try {
            await deposit(userInputDeposit, lotteryData, constants)
            // setRouter(RouterEnum.claimReward)
        } catch (error) {
            console.log(error)
        }

    }

    return (
        <div className="container-regular">
            <div id="w-node-_6f369299-dc14-2f93-d3cc-2248b1553a1e-b1553a16" role="listitem" className="w-dyn-item">
                <div className="course-card course-card_autoHeight" style={{ backgroundColor: "#effaea" }}>
                    <div className="course-card-text-wrapper">
                        <div style={{ marginBottom: "30px", display: 'flex', justifyContent: 'space-between' }}>
                            <div>
                                <div style={{ fontWeight: 'bold', display: 'inline' }}>STEP 2 OF 2</div> Add liquidity to the draw
                            </div>
                            {lotteryData.frogBalances && lotteryData.frogBalances.balanceOf + lotteryData.frogBalances.depositOf + lotteryData.frogBalances.withdrawOf + lotteryData.frogRewards.reward0 + lotteryData.frogRewards.reward1 + lotteryData.frogRewards.rewardCake > 0 ?
                                <img onClick={() => setRouter(RouterEnum.claimReward)} src="/icons/close-circle-outline.svg" className="info-potwin pointer" width={18} height={18} />
                                : <></>
                            }

                        </div>
                        <hr style={{ marginBottom: "30px" }} />
                        <form>
                            <div className="course-card__group">
                                <Coin coin="BUSD" balance={balances.token0} userInputDeposit={userInputDeposit} setUserInputDeposit={setUserInputDeposit} address={lotteryData.poolKey?.token0} />
                                <Coin coin="USDT" balance={balances.token1} userInputDeposit={userInputDeposit} setUserInputDeposit={setUserInputDeposit} address={lotteryData.poolKey?.token1} />
                                <Coin coin="USDC" balance={balances.stable} userInputDeposit={userInputDeposit} setUserInputDeposit={setUserInputDeposit} address={constants.stable} />
                            </div>
                            <div className="text-field-wrapper course-card__group" style={{ boxShadow: "none", borderColor: isUserTryedInput && (BigInt(userInputDeposit?.depositAmount as any * 1e18) < lotteryData.minUsd || BigInt(userInputDeposit?.depositAmount as any * 1e18) > lotteryData.maxUsd) ? 'red' : undefined }}>
                                <input onChange={e => {
                                    setisUserTryedInput(true)
                                    const regex = /^[0-9.\b]+$/; // регулярное выражение, разрешающее ввод только чисел
                                    let v = e.target.value
                                    const dot = v.indexOf('.')
                                    const dotReverse = v.lastIndexOf('.')
                                    if (regex.test(v) || v == '') {
                                        if (v == '') {
                                            userInputDeposit.depositAmount = '0'
                                        } else if (dot > 0 && dot == dotReverse) {
                                            userInputDeposit.depositAmount = v
                                        } else {
                                            userInputDeposit.depositAmount = parseFloat(v).toString()
                                        }
                                        setUserInputDeposit({ ...userInputDeposit })
                                    }
                                }} type="text" id="amountCurrencyDraw" className="text-field-plain w-input" value={userInputDeposit.depositAmount.toString()} />
                                <span className="course-card__textField-add button-max" data-action="setMax" data-target="amountCurrencyDraw" data-valuemax="">MAX</span>
                            </div>
                            {isUserTryedInput && BigInt(userInputDeposit?.depositAmount as any * 1e18) < lotteryData.minUsd &&
                                < span style={{ color: "red" }}>
                                    Amount should be not less than ${`${parseFloat(((lotteryData.minUsd?.toString() as any) / (BigInt(1e18).toString() as any)) as any)}`}
                                </span>}
                            {isUserTryedInput && BigInt(userInputDeposit?.depositAmount as any * 1e18) > lotteryData.maxUsd &&
                                < span style={{ color: "red" }}>
                                    Amount should be less than ${`${parseFloat(((lotteryData.maxUsd?.toString() as any) / (BigInt(1e18).toString() as any)) as any)}`}
                                </span>}

                        </form>
                        <div className="course-card-bottom-row" style={{ justifyContent: "center" }}>
                            <a className=" detalis" href="https://frogs.gitbook.io/frogsfi/welcome/how-it-works" target="_blank" >
                                {"Check theprocess details ->"}
                            </a>
                        </div>
                        <div className="course-card-bottom-row">
                            <button onClick={callDeposit} id="buttonAddDraw" className="button-primary w-button fro-fro" style={{ width: "100%" }}>Add ${userInputDeposit.depositAmount} to draw</button>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    )
}

function Coin({ coin, balance, userInputDeposit, setUserInputDeposit, address }: any) {
    return (
        <div className="course-card__block">
            <label className="course-card__label" htmlFor={`cur${coin.toLowerCase()}`}>
                <strong className="course-card__currencyName">
                    {coin}
                </strong>
                <span className="course-card__currencyAmount">
                    <img src={`/img/icons/${coin.toLowerCase()}.svg`} alt="" className="course-card__walletIcon" />
                    {balance}
                </span>
            </label>
            <label className="course-card__radio">
                <input onClick={e => {
                    userInputDeposit.tokenAddressSelected = address;
                    setUserInputDeposit({ ...userInputDeposit })
                }} data-action="setMaxValue" type="radio" id={`cur${coin.toLowerCase()}`} name="currency" checked={userInputDeposit.tokenAddressSelected == address} />
                <span className="course-card__radioBox"></span>
            </label>
        </div>
    )
}