import { CakeToken, TBnb, ERC20Token, PancakeRouter, FrogLottery, MasterChef, PancakeFactory, SyrupBar, Factory, FrogReferal } from "../typechain-types";

export type allContractsFromDeploy = {
    cake: CakeToken;
    bnb: TBnb;
    usdt: ERC20Token;
    usdc: ERC20Token;
    router: PancakeRouter;
    lottery: FrogLottery;
    masterChef: MasterChef;
    pancakeFactory: PancakeFactory;
    syrupBar: SyrupBar;
    factory: Factory;
    referal: FrogReferal;
    lotteryERC20: FrogLottery;
}