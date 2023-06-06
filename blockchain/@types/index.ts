import { ERC20Token, FrogLottery, FrogReferal, FrogFactory, TCake, TBnb, MasterChefV3 } from "../typechain-types";
import { PancakeV3Pool, PancakeV3Factory, NonfungiblePositionManager, SwapRouter, PancakeV3PoolDeployer, SmartRouter } from "../v3/typechain-types"

export type allContractsFromDeploy = {
    usdt: ERC20Token;
    usdc: ERC20Token;
    busd: ERC20Token;
    cake: ERC20Token;
    wbnb: TBnb;
    pool_busd_usdt: PancakeV3Pool;
    pool_busd_usdc: PancakeV3Pool;
    pool_usdt_usdc: PancakeV3Pool;
    lottery_busd_usdt: FrogLottery;
    pancakeFactory: PancakeV3Factory;
    nonfungiblePositionManager: NonfungiblePositionManager;
    factory: FrogFactory;
    referal: FrogReferal;
    router: SmartRouter;
    mc: MasterChefV3;
    pancakeV3PoolDeployer: PancakeV3PoolDeployer;
    fee: number;
}

export type DeployLotteryParams = {
    token0: string;
    token1: string;
    poolFee: number;
    frogReferalAddress: string;
    isEthLottery: boolean;
    beneficiary: string;
    pool: string;
    nonfungiblePositionManager: string;
    swapRouter: string;
    pancakeFactory: string;
    stable: string;
}