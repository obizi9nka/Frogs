import { CakeToken, TBnb, ERC20Token, PancakeRouter, FrogLottery, MasterChef, PancakeFactory, SyrupBar, Factory, FrogReferal } from "../typechain-types";
import { UniswapV3Pool, UniswapV3Factory, NonfungiblePositionManager, SwapRouter } from "../v3/typechain-types"

export type allContractsFromDeploy = {
    usdt: ERC20Token;
    usdc: ERC20Token;
    busd: ERC20Token;
    pool_busd_usdt: UniswapV3Pool;
    lottery_busd_usdt: FrogLottery;
    pancakeFactory: UniswapV3Factory;
    nonfungiblePositionManager: NonfungiblePositionManager;
    factory: Factory;
    referal: FrogReferal;
    router: SwapRouter;
    fee: number;
}