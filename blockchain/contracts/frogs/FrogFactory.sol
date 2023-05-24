// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


import "./FrogLottery.sol";
import "./IFrogReferal.sol";
import "../v3-interfaces/IUniswapV3Factory.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import 'hardhat/console.sol';

contract FrogFactory is Ownable{
    mapping(address => mapping(address => mapping(uint24 => address))) public lotteries;

    address frogReferalAddress;
    address beneficiary;
    address pancakeFactory;
    address swapRouter;
    address WETH;

    constructor(address _FrogReferalAddress, address _WETH, address _pancakeFactory, address _beneficiary, address _swapRouter) {
        WETH = _WETH;
        pancakeFactory = _pancakeFactory;
        frogReferalAddress = _FrogReferalAddress;
        beneficiary = _beneficiary;
        swapRouter = _swapRouter;
    }

    function createNewLottery(address tokenA, address tokenB, uint24 fee, address _pool, address nonfungiblePositionManager, address stable) public onlyOwner{
        (address token0, address token1) = tokenA < tokenB ? (tokenA, tokenB) : (tokenB, tokenA);
        require(IUniswapV3Factory(pancakeFactory).getPool(token0,token1, fee) != address(0), "pool dont exist");
        require(lotteries[token0][token1][fee] == address(0), "lottery exist");
        bool isEth = false;
        if(token0 == WETH){
            isEth = true;
            token0 = token1;
            token1 = WETH;
        }
        else if(token1 == WETH){
            isEth = true;
        }
        // console.log('tiks',uint(tickUpper), uint(tickLower));
        address newLottery = address(new FrogLottery(token0,token1,fee,frogReferalAddress,isEth,beneficiary, _pool, nonfungiblePositionManager,swapRouter,pancakeFactory,stable));
        lotteries[token0][token1][fee] = newLottery;
        lotteries[token1][token0][fee] = newLottery;
        IFrogReferal(frogReferalAddress).registerNewLottery(newLottery);
    }

}