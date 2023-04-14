// SPDX-License-Identifier: GPL-3.0

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import 'hardhat/console.sol';
pragma solidity ^0.8.0;

/**
  * @title FrogReferal
   * @dev FrogReferal
   */
contract FrogReferal is Ownable{
    uint percent;
    mapping(address => ReferalInfo) public refererOf;
    mapping(address => ReferalInfo[]) public referalsOf;

    mapping(address => uint) public balance; // реферальные балансы участников лотерей

    mapping(address => bool) public isLottery; // адреса зарегестрированных лотерей (регестрировать лотереи может только фабрика лотерей)


    event ReferalReward(address from, address to, address lotteryAddress, uint reward);

    struct ReferalInfo {
        address participant;
        uint256 percent;
    }

    address lotteryFactoryAddress; 
    address[] public participants;
    mapping (address => bool) public alreadyParticipant;
    function isParticipant(address _participant) public view returns (bool) {
        return alreadyParticipant[_participant];
    }

    event PercentChanged(uint indexed _oldFeePercent, uint indexed _newFeePercent);
    event NewParticipant(address indexed _newParticipant, address indexed _referer);

    constructor(address _beneficiary) {
        setPercent(3);
        _add(_beneficiary, address(0));
    }

    function setFactoryAddress(address factory) public{
        lotteryFactoryAddress = factory;
    }

    function add(address _referer) public{
        require(!isParticipant(msg.sender),'Participant already exist!');
        require(isParticipant(_referer), 'Referer not found!');

        _add(msg.sender, _referer);
    }

    function _add(address _newParticipant, address _referer) internal{
        participants.push(_newParticipant);
        alreadyParticipant[_newParticipant] = true;

        refererOf[_newParticipant] = ReferalInfo(_referer,percent);

        referalsOf[_referer].push(ReferalInfo(_newParticipant,percent));

        emit NewParticipant(_newParticipant, _referer);
    }

    function setPercent(uint _percent) public{
        emit PercentChanged(percent, _percent);
        percent = _percent;
    }

    // регестрирует новую созданную лотерею
    function registerNewLottery(address newLotteryAddress) public {
        // require(lotteryFactoryAddress == msg.sender, 'registerNewLottery: you are not allowed to register new lotteries');
        isLottery[newLotteryAddress] = true;
    }

    // возвращает процент который должен отдать referal
    function getReferalPercent(address referal) public view returns(uint){
        return refererOf[referal].percent;
    }

    // зарегестрированная лотерея во время розыгрыша вызывает эту функцию и изменяет состояния баланса на данном контракте на основе выбранных победителей 
    // по хорошему сделать параметры массивами, что бы сократить количество вызовов данной функции до константной единицы с целью сохранения газа 
    function recieveRewardFromReferalVictory(address referal, uint reward) public{
        ReferalInfo memory temp = refererOf[referal];
        require(isLottery[msg.sender], 'recieveRewardFromReferalVictory: you are not a lottery');
        balance[temp.participant] += reward;
        emit ReferalReward(referal,temp.participant,msg.sender,reward);
    }

    function claimReward(address token) public {
        require(IERC20(token).transfer(msg.sender, balance[msg.sender]), 'claimReward: transfer faild');
        balance[msg.sender] = 0;
    }
}