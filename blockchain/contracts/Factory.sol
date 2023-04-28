// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


import "./FrogLottery.sol";
import "./IFrogReferal.sol";
import "./pancekeswap-fork/utils/interfaces/IPancakeFactory.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Factory is Ownable{
    mapping(address => mapping(address => address)) public lotteries;

    address frogReferalAddress;
    address beneficiary;
    address pancakeFactory;
    address WETH;

    constructor(address _FrogReferalAddress, address _WETH, address _pancakeFactory, address _beneficiary) {
        WETH = _WETH;
        pancakeFactory = _pancakeFactory;
        frogReferalAddress = _FrogReferalAddress;
        beneficiary = _beneficiary;
    }

    function createNewLottery(address token0, address token1, uint pancakePID) public onlyOwner{
        require(IPancakeFactory(pancakeFactory).getPair(token0,token1) != address(0), "pair dont exist");
        console.log(token0,token1,lotteries[token0][token1]);
        require(lotteries[token0][token1] == address(0), "lottery exist");
        bool isEth = false;
        if(token0 == WETH){
            isEth = true;
            token0 = token1;
            token1 = WETH;
        }
        else if(token1 == WETH){
            isEth = true;
        }
        address newLottery = address(new FrogLottery(token0,token1,frogReferalAddress,isEth,beneficiary,pancakePID));
        lotteries[token0][token1] = newLottery;
        lotteries[token1][token0] = newLottery;
        IFrogReferal(frogReferalAddress).registerNewLottery(newLottery);
    }

}