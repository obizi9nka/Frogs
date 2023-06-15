import { RouterEnum } from "@/types/exports";
import { Router } from "../types/export";
import { useEffect, useState } from "react";
import { fromLiqToUsd, abis, rateDeposit } from "@/functions/utils";
import { useWalletClient } from "wagmi";
import Web3 from "web3";
import { claimReward } from "@/functions/claimReward";

export function ClaimReward({ setRouter, constants, lotteryData }: DepositStuct & Router) {
    const { data } = useWalletClient()

    const [frogbalancesInUsd, setFrogbalancesInUsd] = useState({ balanceOf: 0, depositOf: 0, withdrawOf: 0 } as FrogBalances<number>)
    const [participants, setParticipants] = useState(-1)
    const [symbols, setSymbols] = useState({ token0: '', token1: '' } as any)

    useEffect(() => {
        if (lotteryData?.frogBalances) {
            convertFrogBalances()
            getTokensSymbols()
        }
    }, [lotteryData])


    async function getTokensSymbols() {
        const web3 = new Web3(data as any)
        const token0 = new web3.eth.Contract(abis.ERC20, lotteryData.poolKey.token0)
        const token1 = new web3.eth.Contract(abis.ERC20, lotteryData.poolKey.token1)

        const symbol0 = await token0.methods.symbol().call()
        const symbol1 = await token0.methods.symbol().call()

        setSymbols({ token0: symbol0, token1: symbol1 })
    }

    const convertFrogBalances = async () => {
        let balanceOfInUsd = await fromLiqToUsd(data, lotteryData.frogBalances.balanceOf, constants, lotteryData.poolKey)
        let depositOfInUsd = await fromLiqToUsd(data, lotteryData.frogBalances.depositOf, constants, lotteryData.poolKey)
        let withdrawOfInUsd = await fromLiqToUsd(data, lotteryData.frogBalances.withdrawOf, constants, lotteryData.poolKey)

        balanceOfInUsd = parseFloat((balanceOfInUsd / 1e18).toString())
        depositOfInUsd = parseFloat((depositOfInUsd / 1e18).toString())
        withdrawOfInUsd = parseFloat((withdrawOfInUsd / 1e18).toString())

        setFrogbalancesInUsd({
            balanceOf: balanceOfInUsd,
            depositOf: depositOfInUsd,
            withdrawOf: withdrawOfInUsd
        })
    }

    const callClaimReward = async () => {
        await claimReward({ walletClient: data } as UserInputDepositStruct, constants)
    }

    return (
        <div className="container-regular">
            <div data-w-id="6f369299-dc14-2f93-d3cc-2248b1553a1c" className="collection-list-wrapper w-dyn-list">
                <div role="list" className="collection-list|w-dyn-items|grid-grid">
                    <div id="w-node-_6f369299-dc14-2f93-d3cc-2248b1553a1e-b1553a16" role="listitem"
                        className="w-dyn-item">
                        <div className="course-card " style={{ backgroundColor: "#effaea" }}>
                            <div className="course-card-text-wrapper draw-sec ">
                                <div style={{ marginBottom: "30px" }}>
                                    <b>CURRENT STATUS</b> In the draw
                                </div>
                                <hr style={{ marginBottom: "30px" }} />
                                <div data-w-id="362479a4-ad8f-68b0-447f-d46739d7ca18" className="faq-wrapper   "
                                    style={{ marginBottom: "30px" }}>
                                    <div data-hover="false" data-delay="0"
                                        data-w-id="362479a4-ad8f-68b0-447f-d46739d7ca19" className="faq-item w-dropdown gigaTransform"
                                        style={{ boxShadow: "0 4px 0 0 #050505" }}>
                                        <div className="faq-item-toggle w-dropdown-toggle">
                                            <div className="faq-title-wrapper">
                                                <div
                                                    style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                                                    <b>CURRENT DEPOSIT</b> <span><b>${(frogbalancesInUsd.depositOf + frogbalancesInUsd.balanceOf - frogbalancesInUsd.withdrawOf).toString()}</b> →</span>
                                                </div>
                                            </div>
                                        </div>
                                        <nav className="faq-content w-dropdown-list " >
                                            <div className="faq-tab-content">
                                                <p
                                                    style={{ fontSize: '14px', display: 'flex', justifyContent: 'space-between' }}>
                                                    <span style={{ display: "flex", alignItems: "center" }}>On the way to
                                                        the draw&nbsp;
                                                        <img src="/icons/alert-circle-outline.svg" className="info-potwin" style={{ opacity: '0.7' }} width={18} height={18} />
                                                    </span> <b>${frogbalancesInUsd.depositOf.toString()}</b>
                                                </p>
                                                <p
                                                    style={{ fontSize: '14px', display: 'flex', justifyContent: 'space-between' }}>
                                                    <span style={{ display: "flex", alignItems: "center" }}>On the way to
                                                        withdrawal&nbsp;
                                                        <img src="/icons/alert-circle-outline.svg" className="info-potwin" style={{ opacity: '0.7' }} width={18} height={18} />
                                                    </span> <b>${frogbalancesInUsd.withdrawOf.toString()}</b>
                                                </p>
                                                <p
                                                    style={{ fontSize: '14px', display: 'flex', justifyContent: 'space-between' }}>
                                                    <span style={{ display: "flex", alignItems: "center" }}>Staked in the
                                                        draw&nbsp;
                                                        <img src="/icons/alert-circle-outline.svg" className="info-potwin" style={{ opacity: '0.7' }} width={18} height={18} />
                                                    </span> <b>${frogbalancesInUsd.balanceOf.toString()}</b>
                                                </p>
                                                <div
                                                    style={{ marginTop: "20px", display: 'flex', justifyContent: 'space-between' }}>
                                                    <button onClick={() => setRouter(RouterEnum.deposit)} className="navigation-login liq-button " style={{ boxShadow: 'none' }}>Add liquidity</button>
                                                    <button onClick={() => setRouter(RouterEnum.withdraw)} className="navigation-login liq-button " style={{ boxShadow: 'none' }}>Remove</button>
                                                </div>
                                            </div>
                                        </nav>
                                    </div>
                                </div>
                                <p style={{ display: "flex", justifyContent: "space-between" }}>
                                    <span>Participants</span>
                                    <b>{lotteryData.participants.toString()}</b>
                                </p>
                                <p style={{ display: "flex", justifyContent: "space-between" }}>
                                    <span>Potential win&nbsp;
                                        <img src="/icons/alert-circle-outline.svg" className="info-potwin" width={18} height={18} />
                                    </span>
                                    <b>$???</b>
                                </p>
                                {lotteryData.frogRewards && lotteryData.frogRewards.reward0 + lotteryData.frogRewards.reward1 + lotteryData.frogRewards.rewardCake > 0 ?
                                    <>
                                        <p style={{ display: "flex", justifyContent: "space-between" }}>
                                            <span><span>Prizes</span>🏆</span>
                                            <b>{lotteryData.frogRewards && lotteryData.frogRewards.reward0.toString() + " "}
                                                {symbols.token0.toUpperCase()}
                                            </b>
                                        </p>
                                        <p style={{ display: "flex", justifyContent: "space-between" }}>
                                            <span></span>
                                            <b>
                                                {lotteryData.frogRewards && lotteryData.frogRewards.reward1.toString() + " "}
                                                {symbols.token1.toUpperCase()}
                                            </b>
                                        </p>
                                        <p style={{ display: "flex", justifyContent: "space-between" }}>
                                            <span></span>
                                            <b>
                                                {lotteryData.frogRewards && lotteryData.frogRewards.rewardCake.toString() + " "}
                                                CAKE
                                            </b>
                                        </p>
                                        <div className="course-card-bottom-row">
                                            <button onClick={callClaimReward} className="button-primary w-button fro-fro" style={{ width: "100%" }}>Claim
                                                Prizes</button>
                                        </div>
                                    </>
                                    :
                                    <div className="course-card-bottom-row">
                                        <button disabled className="button-primary w-button fro-fro-disabled"
                                            style={{ width: "100%" }}>Next draw in ?d ?h ?m</button>
                                    </div>
                                }

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
