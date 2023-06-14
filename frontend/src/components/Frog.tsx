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

export function Frog() {

    const { address, isConnected } = useAccount()
    const walletClient = useWalletClient()
    const publicClient = usePublicClient()

    const [Router, setRouter] = useState(RouterEnum.connectWallet)
    const [lotteryData, setLotteryData] = useState({} as LotteyDataStruct)
    const [constants, setConstants] = useState({} as ConstantsStruct)

    useEffect(() => {
        setRouter(isConnected ? RouterEnum.deposit : RouterEnum.connectWallet)
    }, [isConnected])

    useEffect(() => {
        setConstants(getConstants(walletClient.data?.chain.id))
    }, [walletClient.data?.chain.id])

    const [interval, setIntervaL] = useState<any>()

    useEffect(() => {
        if (publicClient && constants.cake) {
            clearInterval(interval)
            getVariables()
            const inter = setInterval(() => {
                getVariables()
            }, 10000)
            setIntervaL(inter)
        }

    }, [constants])

    const getVariables = async () => {
        const provider = new ethers.BrowserProvider(publicClient)

        const frog = new ethers.Contract(constants.frogLottery, lottery_json.abi, provider)
        const pool = new ethers.Contract(constants.pool_token0_token1, pool_json.abi, provider)

        const minUsd = await frog.minUsd()
        const maxUsd = await frog.maxUsd()
        const isLotteryReversed = (await frog.token0()) == constants.token1

        const token0 = await frog.token0()
        const token1 = await frog.token1()
        let poolFee
        try {
            poolFee = await frog.poolFee()
        } catch (error) {
            console.log('poool fee not public')
        }
        if (poolFee == undefined)
            poolFee = constants.fee

        const depositOf = await frog.depositOf(address)
        const balanceOf = await frog.balanceOf(address)
        const withdrawOf = await frog.withdrawOf(address)

        const reward0 = await frog.rewardOfToken0(address)
        const reward1 = await frog.rewardOfToken1(address)
        const rewardCake = await frog.rewardOfCake(address)
        // console.log(depositOf + balanceOf + withdrawOf + reward0 + reward1 + rewardCake > 0)
        if (depositOf + balanceOf + withdrawOf + reward0 + reward1 + rewardCake > 0) {
            // console.log('RouterEnum.claimReward')
            setRouter(RouterEnum.claimReward)

        }

        const sqrtPriceX96_token0_token1 = (await pool.slot0()).sqrtPriceX96

        setLotteryData({
            minUsd,
            maxUsd,
            isLotteryReversed,
            frogRewards: {
                reward0,
                reward1,
                rewardCake
            },
            poolKey: {
                token0,
                token1,
                poolFee,
            },
            frogBalances: {
                depositOf,
                balanceOf,
                withdrawOf,
            },
            sqrtPriceX96_token0_token1
        })

    }

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
                        {Router == RouterEnum.connectWallet && <ConnectWallet />}
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