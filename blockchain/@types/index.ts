import { ERC20Token, FrogLottery, FrogReferal, FrogFactory } from "../typechain-types";
import { UniswapV3Pool, UniswapV3Factory, NonfungiblePositionManager, SwapRouter } from "../v3/typechain-types"

export type allContractsFromDeploy = {
    usdt: ERC20Token;
    usdc: ERC20Token;
    busd: ERC20Token;
    pool_busd_usdt: UniswapV3Pool;
    pool_busd_usdc: UniswapV3Pool;
    pool_usdt_usdc: UniswapV3Pool;
    lottery_busd_usdt: FrogLottery;
    pancakeFactory: UniswapV3Factory;
    nonfungiblePositionManager: NonfungiblePositionManager;
    factory: FrogFactory;
    referal: FrogReferal;
    router: SwapRouter;
    fee: number;
}