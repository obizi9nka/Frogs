// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.0 ;

import "./Random.sol";

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import 'hardhat/console.sol';

import "./FrogLottery.sol";


/**
  * @title FrogLottery
   * @dev FrogLottery
   */

interface IFrogLotteryCut {
    function getRandomParticipantForSponsor() external view returns(address[] memory, uint[] memory);
}

contract FrogSponsor is FrogLottery{
    address immutable FrogLotteryAddress;

    constructor(address _token0, address _token1, bool _isEthLottery, address _beneficiary, uint _pancakePID, address _FrogLotteryAddress) FrogLottery(_token0,_token1,address(0),_isEthLottery,_beneficiary,_pancakePID) {
        FrogLotteryAddress = _FrogLotteryAddress;
    }

    function draw() override public isBeneficiaryOrOwner{
        // IMasterChef(pancakeMCAddress).deposit(pancakePID, 0);
        uint currentReward = IERC20(token0).balanceOf(address(this));
        (address[] memory winners, uint[] memory winnersBalance)= IFrogLotteryCut(FrogLotteryAddress).getRandomParticipantForSponsor();
        uint winnersCount = winnersBalance.length;
    
        if(winnersCount > 0){
            uint reward = currentReward;

            uint winnersDeposit;
            for (uint i = 0; i < winnersCount; i++) {
                winnersDeposit += winnersBalance[i];
            }   
            drawNumber++;
            for(uint i = 0; i < winnersCount; i++){
                address winner = winners[i];
                uint participantRewardPart = winnersBalance[i] * 100 / winnersDeposit;
                uint participantReward = reward * participantRewardPart / 100;
                rewardOf[winner] += participantReward;
                balanceFromPreviousDraws += participantReward;
                emit Victory(drawNumber, winner, participantReward);
            }

            emit Draw(drawNumber, currentReward, 0, 0);
            accounting();
        } else {
            accounting();
        }
    }

    function claimReward() public override {
        require(rewardOf[msg.sender] > 0, 'Reward is empty');
        require(IERC20(token0).transfer(msg.sender, rewardOf[msg.sender]),"Transfer faild");
        rewardOf[msg.sender] = 0;
    }
    
}