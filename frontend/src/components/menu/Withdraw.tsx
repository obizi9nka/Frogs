import { withdraw } from "@/functions/withdraw"
import { Router } from "../types/export"
import { RouterEnum } from "@/types/exports"
import { useWalletClient } from "wagmi"
import { useState, useEffect } from "react"


export function Withdraw({ setRouter, constants, lotteryData }: DepositStuct & Router) {
    const { data } = useWalletClient()

    const [userInputWithdraw, setUserInputWithdraw] = useState({
        walletClient: data,
        withdrawAmount: 0,
    } as UserInputWithdrawStuct)

    useEffect(() => {
        userInputWithdraw.walletClient = data
        setUserInputWithdraw({ ...userInputWithdraw })
    }, [data])

    const callWithdraw = async () => {
        withdraw(userInputWithdraw, lotteryData, constants)
    }

    return (
        <div className="container-regular">
            <div data-w-id="6f369299-dc14-2f93-d3cc-2248b1553a1c" className="collection-list-wrapper w-dyn-list">
                <div role="list">
                    <div id="w-node-_6f369299-dc14-2f93-d3cc-2248b1553a1e-b1553a16" role="listitem" className="w-dyn-item">
                        <div className="course-card" style={{ backgroundColor: "#effaea" }}>
                            <div className="course-card-text-wrapper">
                                <div
                                    style={{ marginBottom: "30px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                    Remove liquidity from the draw<br />
                                    <h5 style={{ display: "flex", alignItems: "end" }} />
                                    <img onClick={() => setRouter(RouterEnum.claimReward)} src="/icons/close-circle-outline.svg" className="info-potwin pointer" width={18} height={18} />
                                </div>
                                <hr style={{ marginBottom: "30px" }} />
                                <form>
                                    <div className="text-field-wrapper course-card__group" style={{ boxShadow: "none", backgroundColor: "#eeeeee" }}>
                                        <input onChange={(e) => { userInputWithdraw.withdrawAmount = parseInt(e.target.value); setUserInputWithdraw({ ...userInputWithdraw }) }} type="text" id="amountCurrencyDraw" className="text-field-plain w-input"
                                            style={{ backgroundColor: 'inherit' }} placeholder="" />
                                    </div>
                                </form>

                                <div className="course-card-bottom-row" style={{ justifyContent: "center" }}>
                                    <a href="https://frogs.gitbook.io/frogsfi/welcome/how-it-works" target="_blank"
                                        style={{ color: "color(display-p3 0.945 0.62 0.286)" }}>Check the
                                        process details {'->'}</a>
                                </div>
                                <div className="course-card-bottom-row">
                                    <button onClick={callWithdraw} id="buttonAddDraw" className="button-primary w-button fro-fro"
                                        style={{ width: "100%" }}>Remove $122.123</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}