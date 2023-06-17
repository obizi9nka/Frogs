

type DepositStuct = {
    constants: ConstantsStruct,
    lotteryData: LotteyDataStruct,
}

type UserInputDepositStruct = {
    tokenAddressSelected: string,
    walletClient: any,
    depositAmount: string,
}

type UserInputWithdrawStuct = {
    walletClient: any,
    withdrawAmount: string
}

type FrogBalances<T = bigint> = {
    depositOf: T,
    balanceOf: T,
    withdrawOf: T,
}

type FrogReward<T = bigint> = {
    reward0: T,
    reward1: T,
    rewardCake: T
}

type FrogReferalReward<T = bigint> = {
    referalReward0: T,
    referalReward1: T,
    referalRewardCake: T
}

type PoolKey = {
    token0: string,
    token1: string,
    poolFee: number
}


type LotteyDataStruct = {
    frogBalances: FrogBalances,
    frogRewards: FrogReward,
    frogReferal: FrogReferalReward,
    poolKey: PoolKey,
    participants: bigint,
    minUsd: bigint,
    maxUsd: bigint,
    isLotteryReversed: boolean,
    sqrtPriceX96_token0_token1: bigint
}