// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


import "./FrogLottery.sol";
import "./IFrogReferal.sol";
// import "./FrogSponsor.sol";
import "../v3-interfaces/IPancakeV3Factory.sol";
// import "@openzeppelin/contracts/access/Ownable.sol";
import 'hardhat/console.sol';
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
    address CAKE;
    address frogSponsorFactory;
    address masterChef;

    constructor(address _FrogReferalAddress, address _WETH, address _pancakeFactory, address _beneficiary, address _swapRouter, address _masterChef, address _cake) {
        WETH = _WETH;
        pancakeFactory = _pancakeFactory;
        frogReferalAddress = _FrogReferalAddress;
        beneficiary = _beneficiary;
        swapRouter = _swapRouter;
        masterChef = _masterChef;
        CAKE = _cake;
    }

    function setSponsorFactoryAddress(address _frogSponsorFactory) public{
        frogSponsorFactory = _frogSponsorFactory;
    }

    function createNewLottery(address tokenA, address tokenB, uint24 poolFee, address pool, address nonfungiblePositionManager, address stable) public{
        // console.log('before', tokenA, tokenB);
        (address token0, address token1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
        // (address token0, address token1) = (tokenA, tokenB);
        // console.log('after', token0, token1, tokenA == token0);
        require(IPancakeV3Factory(pancakeFactory).getPool(token0,token1, poolFee) != address(0), "pool dont exist");
        require(lotteries[token0][token1][poolFee] == address(0), "lottery exist");
        bool isEthLottery = token0 == WETH || token1 == WETH;

        IFrog.DeployLotteryParams memory params = IFrog.DeployLotteryParams({
            token0: token0, 
            token1: token1, 
            poolFee: poolFee,
            frogReferalAddress: frogReferalAddress, 
            isEthLottery: isEthLottery, 
            beneficiary: beneficiary, 
            pool: pool, 
            nonfungiblePositionManager: nonfungiblePositionManager, 
            router: swapRouter, 
            pancakeFactory: pancakeFactory, 
            stable: stable,
            isReversed: !(tokenA < tokenB),
            masterChef: masterChef,
            cake: CAKE
        });

        address newLottery = address(new FrogLottery(params));

        
        console.log('frog factory: newLottery', newLottery);
        lotteries[token0][token1][poolFee] = newLottery;
        lotteries[token1][token0][poolFee] = newLottery;

        IFrogReferal(frogReferalAddress).registerNewLottery(newLottery);
    }

    // function deploy(IFrog.DeployLotteryParams memory params) internal returns (address newLottery) {
    //     newLottery = address(new FrogLottery(params));
    //     // IFrogSponsorFactoryCut(frogSponsorFactory).createNewSponsor(params, newLottery);        
    // }

}