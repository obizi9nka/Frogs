import { Deposit } from "./menu/Deposit"
import { ClaimReward } from "./menu/ClaimReward"
import { ConnectWallet } from "./menu/ConnectWallet"
import { Withdraw } from "./menu/Withdraw"
import { Lines } from "./periphery/Lines"
import { useEffect, useRef, useState } from "react"
import { RouterEnum } from '@/types/exports'
import { Router } from "./types/export"
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { gsapPopUp } from "@/functions/utils"

gsap.registerPlugin(ScrollTrigger)
export function Frog({ Router, setRouter, constants, lotteryData }: DepositStuct & Router) {

    const blockZeroChance = useRef(null)
    const blockMenu = useRef(null)
    const blockLogo = useRef(null)

    useEffect(() => {
        gsapPopUp(blockZeroChance.current, .8)
        gsapPopUp(blockMenu.current, .9)
        gsapPopUp(blockLogo.current, 0.6)
    }, [])

    return (
        <div className="section-small" id="draw" style={{ paddingTop: "25px" }}>
            <div className="container-regular" style={{ paddingBottom: "80px" }}>
                <div className="w-layout-grid content-grid">
                    <div id="w-node-e15cdd8c-4365-9c82-f67e-be97a6d15d5f-32ea3cba" data-w-id="e15cdd8c-4365-9c82-f67e-be97a6d15d5f" style={{ opacity: 1, maxWidth: "100%", width: "100%" }} className="content-text-wrapper">
                        <div data-w-id="f931eddd-76ee-7452-08a1-3e151e0229a8" style={{ opacity: 1, transformStyle: "preserve-3d" }} className="title-wrapper-center">
                            <div className="margin-bottom-16">
                                <h3 className="pixel-font" style={{ opacity: 0 }} ref={blockZeroChance}>Join to win.<br />No chance to lose</h3>
                            </div>
                        </div>
                        <div style={{ opacity: 0 }} ref={blockMenu}>
                            {Router == RouterEnum.connectWallet && <ConnectWallet constants={constants} lotteryData={lotteryData} />}
                            {Router == RouterEnum.deposit && <Deposit setRouter={setRouter} constants={constants} lotteryData={lotteryData} />}
                            {Router == RouterEnum.withdraw && <Withdraw setRouter={setRouter} constants={constants} lotteryData={lotteryData} />}
                            {Router == RouterEnum.claimReward && <ClaimReward setRouter={setRouter} constants={constants} lotteryData={lotteryData} />}
                        </div>
                    </div>
                    <div className="node-image" id="w-node-e15cdd8c-4365-9c82-f67e-be97a6d15d68-32ea3cba" data-w-id="e15cdd8c-4365-9c82-f67e-be97a6d15d68" >
                        <img style={{ opacity: 0 }} ref={blockLogo} src="/img/frogs-king.png" loading="lazy" id="w-node-e15cdd8c-4365-9c82-f67e-be97a6d15d69-32ea3cba" srcSet="/img/frogs-king.png 500w, /img/frogs-king.png 800w, /img/frogs-king.png 1080w, /img/frogs-king.png 1092w" sizes="90vw" alt="4" className="content-image" />
                    </div>
                </div>
            </div>
            <Lines />
        </div>
    )
}