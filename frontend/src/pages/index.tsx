import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger)

import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import { Faq } from '@/components/Faq';
import { Referal } from '@/components/Referal';
import { Frog } from '@/components/Frog';
import { abis, getConstants } from '@/functions/utils';
import { RouterEnum } from '@/types/exports';
import { ethers } from 'ethers';
import { useState, useEffect } from 'react';
import { useAccount, useWalletClient, usePublicClient } from 'wagmi';

export default function Home() {

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

    const frog = new ethers.Contract(constants.frogLottery, abis.FrogLottery, provider)
    const pool = new ethers.Contract(constants.pool_token0_token1, abis.PancakeV3Pool, provider)

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

    const participants = (await frog.getParticipants()).counter

    const sqrtPriceX96_token0_token1 = (await pool.slot0()).sqrtPriceX96

    setLotteryData({
      minUsd,
      maxUsd,
      isLotteryReversed,
      participants,
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
    <div className="change-background change-background-1">
      <Header />
      <Frog Router={Router} setRouter={setRouter} constants={constants} lotteryData={lotteryData} />
      <Referal lotteryData={lotteryData} constants={constants} />
      <Faq />
      <Footer />
    </div >
  )
}
