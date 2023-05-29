// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IFrog {
    struct DeployLotteryParams {
        address token0; 
        address token1; 
        uint24 poolFee;
        address frogReferalAddress; 
        bool isEthLottery; 
        address beneficiary; 
        address pool; 
        address nonfungiblePositionManager; 
        address swapRouter; 
        address pancakeFactory; 
        address stable;
        bool isReversed;
        address masterChef;
    }

}