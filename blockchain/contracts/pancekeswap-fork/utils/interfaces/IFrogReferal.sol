// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.0;

interface IFrogReferal {
    struct ReferalInfo {
        address participant;
        uint256 percent;
    }
    function isParticipant(address _participant) external view returns (bool);

    function setFactoryAddress(address factory) external;

    function add(address _referer) external;


    function setPercent(uint _percent) external ;
    // ui
    function getReferalInfo(address referal) view external returns(ReferalInfo memory);

    // регестрирует новую созданную лотерею
    function registerNewLottery(address newLotteryAddress) external;

    // возвращает процент который должен отдать referal
    function getReferalPercent(address referal) external view returns(uint);

    // зарегестрированная лотерея во время розыгрыша вызывает эту функцию и изменяет состояния баланса на данном контракте на основе выбранных победителей 
    // по хорошему сделать параметры массивами, что бы сократить количество вызовов данной функции до константной единицы с целью сохранения газа 
    function recieveRewardFromReferalVictory(address token,address referal, uint reward) external;

    function claimReward(address token) external;
}