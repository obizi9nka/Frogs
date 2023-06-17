import { claimReferalReward } from "@/functions/claimReferalReward";
import { Lines } from "./periphery/Lines";
import { useWalletClient } from "wagmi";
import { Router } from "./types/export";
import { fromAmountToUsd, fromLiqToUsd, gsapPopUp } from "@/functions/utils";
import { useEffect, useRef, useState } from "react";
import axios, { AxiosResponse } from "axios";

export function Referal({ constants, lotteryData }: DepositStuct) {
    const { data } = useWalletClient()

    const callClaimReferalReward = async () => {
        await claimReferalReward({ walletClient: data } as UserInputDepositStruct, lotteryData, constants)
    }

    const [frogRewardsInUsd, setFrogRewardsInUsd] = useState(0)


    useEffect(() => {
        if (lotteryData?.frogReferal) {
            convertFrogBalances()
        }
    }, [lotteryData])

    useEffect(() => {
        if (data?.account.address) {
            findUser(data?.account.address)
        }
    }, [data])

    const [user, setuser] = useState<any>(undefined)
    const [domen, setDomen] = useState('your referal link')

    const setURL = (wallet: string | undefined) => {
        const domen = typeof window != 'undefined' ? window.location.hostname : ''
        if (wallet)
            setDomen(domen)
    }


    const findUser = async (wallet: string) => {
        await axios.post(`/api/findUserWithReferals`, { wallet }).then(async (response: AxiosResponse) => {
            if (response.status == 200) {
                const _user = await response.data
                setuser(_user)
                setURL(_user.wallet)
            }
        })
    }

    const copyToClipboard = () => {
        if (user.wallet)
            navigator.clipboard.writeText(domen + `/invite/${user.wallet ? user.wallet : ''}`);
    };

    const convertFrogBalances = async () => {
        let reward0InUsd = await fromAmountToUsd(data, parseFloat(lotteryData.frogReferal.referalReward0.toString()), lotteryData.poolKey.token0, constants.stable, lotteryData.poolKey.poolFee)
        let reward1InUsd = await fromAmountToUsd(data, parseFloat(lotteryData.frogReferal.referalReward1.toString()), lotteryData.poolKey.token1, constants.stable, lotteryData.poolKey.poolFee)
        let rewardCakeInUsd = await fromAmountToUsd(data, parseFloat(lotteryData.frogReferal.referalRewardCake.toString()), constants.cake, constants.stable, lotteryData.poolKey.poolFee)
        // let rewardCakeInUsd = 0
        // console.log(lotteryData.frogRewards.reward0, lotteryData.frogRewards.reward1, lotteryData.frogRewards.rewardCake)
        // console.log(reward0InUsd, reward1InUsd, rewardCakeInUsd)

        reward0InUsd = parseFloat((reward0InUsd / 1e18).toString())
        reward1InUsd = parseFloat((reward1InUsd / 1e18).toString())
        rewardCakeInUsd = parseFloat((rewardCakeInUsd / 1e18).toString())
        console.log(reward0InUsd, reward1InUsd, rewardCakeInUsd)

        setFrogRewardsInUsd(reward0InUsd + reward1InUsd + rewardCakeInUsd)
    }

    const blockInvite = useRef(null)


    useEffect(() => {
        gsapPopUp(blockInvite.current)
    }, [])

    return (
        <div className="section-regular" id="ref">
            <Lines />

            <div className="container-x-small">
                <div data-w-id="362479a4-ad8f-68b0-447f-d46739d7ca12" className="title-wrapper-center">
                    <h2 className="h2-heading pixel-font" ref={blockInvite}>Invite</h2>
                </div>
                <div className="section-actions do-anim appear-slideInUp is-animated" id="invite-more">
                    <h3>Now you invited <span className="highlight">{user && user.invited} friends</span>. Invite more using your referral link below</h3>
                    <div className="ref-code paragraph-large" style={{ display: 'inline-flex' }}><a href="#" id="invite-link" className="invite-link" style={{ textDecorationStyle: 'dotted', marginTop: 'auto', marginBottom: 'auto' }}>{user ? domen + `/invite/0x...${user.wallet.slice(37.42)}` : domen}</a>
                        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", cursor: "pointer", userSelect: 'none', marginLeft: '10px' }} onClick={copyToClipboard}>
                            <img src="/img/copy.png" width={40} height={40} />
                        </div>
                    </div>
                    <p className="left-finger animate__animated animate__pulse animate__infinite">
                        <img src="/img/finger.svg" style={{ height: "45px", marginRight: "10px" }} />
                        <img src="/img/finger.svg" style={{ height: "45px" }} />
                        <img src="/img/finger.svg" style={{ height: "45px", marginLeft: "10px" }} />
                    </p>
                    {frogRewardsInUsd > 0 ?
                        <div>
                            <button onClick={callClaimReferalReward} className="button-primary w-button fro-fro" style={{ marginBottom: "15px", width: "100%" }}>Claim ${frogRewardsInUsd.toString()}</button>
                            <i>Claim your referral prize of ${frogRewardsInUsd.toString()}</i>
                        </div> :
                        <div>
                            <button className="button-primary w-button fro-fro-disabled" style={{ marginBottom: "15px", marginLeft: 'auto', marginRight: 'auto', padding: "0px 60px" }}>Claim $0</button>
                            <i>None of your friends won in the draw</i>
                        </div>
                    }
                </div>
            </div>
        </div>
    )
}