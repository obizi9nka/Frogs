import { useAccount, usePublicClient, useWalletClient } from "wagmi"
import { Deposit } from "./menu/Deposit"
import { ClaimReward } from "./menu/ClaimReward"
import { ConnectWallet } from "./menu/ConnectWallet"
import { Withdraw } from "./menu/Withdraw"
import { Lines } from "./periphery/Lines"
import { useEffect, useState } from "react"
import { ethers, ContractRunner } from "ethers"
import { getConstants } from "@/functions/utils"
import lottery_json from '../../../blockchain/artifacts/contracts/frogs/FrogLottery.sol/FrogLottery.json'
import pool_json from "../../../blockchain/artifacts/contracts/v3-core/PancakeV3Pool.sol/PancakeV3Pool.json"
import { RouterEnum } from '@/types/exports'
import { Router } from "./types/export"

export function Frog({ Router, setRouter, constants, lotteryData }: DepositStuct & Router) {

    return (
        <div className="section-small" id="draw" style={{ paddingTop: "25px" }}>
            <div className="container-regular" style={{ paddingBottom: "80px" }}>
                <div className="w-layout-grid content-grid">
                    <div id="w-node-e15cdd8c-4365-9c82-f67e-be97a6d15d5f-32ea3cba" data-w-id="e15cdd8c-4365-9c82-f67e-be97a6d15d5f" style={{ opacity: 1, maxWidth: "100%", width: "100%" }} className="content-text-wrapper">
                        <div data-w-id="f931eddd-76ee-7452-08a1-3e151e0229a8" style={{ opacity: 1, transformStyle: "preserve-3d" }} className="title-wrapper-center">
                            <div className="margin-bottom-16">
                                <h3 className="pixel-font">Join to win.<br />No chance to lose</h3>
                            </div>
                        </div>
                        {Router == RouterEnum.connectWallet && <ConnectWallet constants={constants} lotteryData={lotteryData} />}
                        {Router == RouterEnum.deposit && <Deposit setRouter={setRouter} constants={constants} lotteryData={lotteryData} />}
                        {Router == RouterEnum.withdraw && <Withdraw setRouter={setRouter} constants={constants} lotteryData={lotteryData} />}
                        {Router == RouterEnum.claimReward && <ClaimReward setRouter={setRouter} constants={constants} lotteryData={lotteryData} />}
                    </div>
                    <div className="node-image" id="w-node-e15cdd8c-4365-9c82-f67e-be97a6d15d68-32ea3cba" data-w-id="e15cdd8c-4365-9c82-f67e-be97a6d15d68" style={{ opacity: 1, width: "100%" }}>
                        <img src="/img/frogs-king.png" loading="lazy" id="w-node-e15cdd8c-4365-9c82-f67e-be97a6d15d69-32ea3cba" srcSet="/img/frogs-king.png 500w, /img/frogs-king.png 800w, /img/frogs-king.png 1080w, /img/frogs-king.png 1092w" sizes="90vw" alt="4" className="content-image" />
                    </div>
                </div>
            </div>
            <Lines />
        </div>
    )
}