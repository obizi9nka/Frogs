// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


import "./FrogLottery.sol";
import "./IFrogReferal.sol";
// import "./FrogSponsor.sol";
import "../v3-interfaces/IUniswapV3Factory.sol";
// import "@openzeppelin/contracts/access/Ownable.sol";
// import 'hardhat/console.sol';
import "./IFrogs.sol";

interface IFrogSponsorFactoryCut {
    function createNewSponsor(IFrog.DeployLotteryParams memory params, address lottery) external;
}

contract FrogFactory {
    mapping(address => mapping(address => mapping(uint24 => address))) public lotteries;
    mapping(address => address) public sponsorContracts;

    address frogReferalAddress;
    address beneficiary;
    address pancakeFactory;
    address swapRouter;
    address WETH;
    address frogSponsorFactory;

    constructor(address _FrogReferalAddress, address _WETH, address _pancakeFactory, address _beneficiary, address _swapRouter) {
        WETH = _WETH;
        pancakeFactory = _pancakeFactory;
        frogReferalAddress = _FrogReferalAddress;
        beneficiary = _beneficiary;
        swapRouter = _swapRouter;
    }

    function setSponsorFactoryAddress(address _frogSponsorFactory) public{
        frogSponsorFactory = _frogSponsorFactory;
    }

    function createNewLottery(address tokenA, address tokenB, uint24 fee, address _pool, address nonfungiblePositionManager, address stable) public{
        // console.log('before', tokenA, tokenB);
        (address token0, address token1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
        // (address token0, address token1) = (tokenA, tokenB);
        // console.log('after', token0, token1, tokenA == token0);
        require(IUniswapV3Factory(pancakeFactory).getPool(token0,token1, fee) != address(0), "pool dont exist");
        require(lotteries[token0][token1][fee] == address(0), "lottery exist");
        bool isEthLottery = token0 == WETH || token1 == WETH;
        address newLottery;
        {
            newLottery = deploy(IFrog.DeployLotteryParams(token0,token1,fee,frogReferalAddress,isEthLottery,beneficiary, _pool, nonfungiblePositionManager,swapRouter,pancakeFactory,stable, !(tokenA < tokenB)));
        }

        lotteries[token0][token1][fee] = newLottery;
        lotteries[token1][token0][fee] = newLottery;

        IFrogReferal(frogReferalAddress).registerNewLottery(newLottery);
    }

    function deploy(IFrog.DeployLotteryParams memory params) internal returns (address newLottery) {
        newLottery = address(new FrogLottery(params));
        // IFrogSponsorFactoryCut(frogSponsorFactory).createNewSponsor(params, newLottery);        
    }

}