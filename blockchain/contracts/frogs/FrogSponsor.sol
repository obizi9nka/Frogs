// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.0 ;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
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

    constructor(address _token0, address _token1, uint24 _poolFee, address _frogReferalAddress, bool _isEthLottery, address _beneficiary, address _pool, address _nonfungiblePositionManager, address _swapRouter, address _pancakeFactory, address stable, address _FrogLotteryAddress)
    FrogLottery(_token0,_token1,_poolFee,_frogReferalAddress,_isEthLottery,_beneficiary,_pool,_nonfungiblePositionManager,_swapRouter,_pancakeFactory,stable ){
        FrogLotteryAddress = _FrogLotteryAddress;
    }

    function draw() override public{
        INonfungiblePositionManager.CollectParams memory params =
        INonfungiblePositionManager.CollectParams({
            tokenId: tokenId,
            recipient: address(this),
            amount0Max: type(uint128).max,
            amount1Max: type(uint128).max
        });

        (uint rewardToken0, uint rewardToken1) = INonfungiblePositionManager(nonfungiblePositionManager).collect(params);


        (address[] memory winners, uint[] memory winnersBalances)= IFrogLotteryCut(FrogLotteryAddress).getRandomParticipantForSponsor();
        
        uint winnersCount = winnersBalances.length;
    
        if(winnersCount > 0){

            uint winnersBalance;
            for (uint i = 0; i < winnersCount; i++) {
                winnersBalance += winnersBalances[i];
            }   

            drawNumber++;
            uint participantRewards0;
            uint participantRewards1;
            for(uint i = 0; i < winnersCount; i++){
                address winner = winners[i];
                uint participantRewardPart = winnersBalances[i] * 100 / winnersBalance;

                uint participantReward0 = rewardToken0 * participantRewardPart / 100;
                uint participantReward1 = rewardToken1 * participantRewardPart / 100;

                participantRewards0 += participantReward0;
                participantRewards1 += participantReward1;

                rewardOfToken0[winner] += participantReward0;
                rewardOfToken1[winner] += participantReward1;

                // balanceFromPreviousDraws += participantReward;
                emit Victory(drawNumber, winner, participantReward0, participantReward1);
            }

            emit Draw(drawNumber, rewardToken0, rewardToken1, participantRewards0, participantRewards1);
            accounting();
        } else {
            accounting();
        }
    }

    function claimReward() public override {
        require(rewardOfToken0[msg.sender] > 0 || rewardOfToken1[msg.sender] > 0, 'Reward is empty');

        if (rewardOfToken0[msg.sender] > 0) {
            require(IERC20(token0).transfer(msg.sender, rewardOfToken0[msg.sender]),"Transfer faild");
        }

        if (rewardOfToken1[msg.sender] > 0) {
            require(IERC20(token1).transfer(msg.sender, rewardOfToken1[msg.sender]),"Transfer faild");
        }

        rewardOfToken0[msg.sender] = 0;
        rewardOfToken1[msg.sender] = 0;
    }
    
}