// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

interface IFrogReferal {
    struct ReferalInfo {
        address participant;
        uint256 percent;
    }
    function alreadyParticipant(address _participant) external view returns (bool);

    function setFactoryAddress(address factory) external;

    // регестрирует новую созданную лотерею
    function registerNewLottery(address newLotteryAddress) external;

    function claimReward(address token) external; 

    ///////////////////////////////////////////////////
    struct ReferersRewardInfo {
        address wallet;
        uint reward;
    }
    function accrueRewardFromWinningReferral(ReferersRewardInfo[] memory info,address token) external;

    function registerReferal(bytes calldata message, uint8 _v, bytes32 _r, bytes32 _s) external  returns (bool result);
}