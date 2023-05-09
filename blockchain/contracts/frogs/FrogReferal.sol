// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./IFrogReferal.sol";

import 'hardhat/console.sol';

/**
  * @title FrogReferal
   * @dev FrogReferal
   */
contract FrogReferal is Ownable, IFrogReferal{
    uint percent;
    address public beneficiary;
    address publicKey;

    mapping(address => mapping(address => uint)) public balance; // реферальные балансы участников лотерей
    mapping(address => bool) public isLottery; // адреса зарегестрированных лотерей (регестрировать лотереи может только фабрика лотерей)

    event ReferalReward(address to, address lotteryAddress, uint reward);

    address lotteryFactoryAddress; 
    mapping (address => bool) public override alreadyParticipant;

    constructor(address _beneficiary, address _publicKey) {
        beneficiary = _beneficiary;
        alreadyParticipant[msg.sender] = true;
        publicKey = _publicKey;
    }

    modifier onlyLottery() {
        require(isLottery[msg.sender], "Caller is not a lottery");
        _;
    }

    modifier isBeneficiaryOrOwner() {
        require(msg.sender == owner() || msg.sender == beneficiary, "Caller is not beneficiary or owner");
        _;
    }

    function setBeneficiary(address _newBeneficiary) public isBeneficiaryOrOwner{
        beneficiary = _newBeneficiary;
    }

    function setFactoryAddress(address factory) public override isBeneficiaryOrOwner{
        lotteryFactoryAddress = factory;
    }

    // регестрирует новую созданную лотерею
    function registerNewLottery(address newLotteryAddress) public override{
        require(lotteryFactoryAddress == msg.sender, 'registerNewLottery: you are not allowed to register new lotteries');
        isLottery[newLotteryAddress] = true;
    }


    function claimReward(address token) public override{
        require(IERC20(token).transfer(msg.sender, balance[token][msg.sender]), 'claimReward: transfer faild');
        balance[token][msg.sender] = 0;
    }

     function accrueRewardFromWinningReferral(ReferersRewardInfo[] calldata data, address token) override public onlyLottery{
        uint len = data.length;
        for (uint i = 0; i < len; i++) {
            balance[token][data[i].wallet] += data[i].reward;
            emit ReferalReward(data[i].wallet, msg.sender, data[i].reward);
        }
    }

    function registerReferal(bytes calldata message, uint8 _v, bytes32 _r, bytes32 _s) public override onlyLottery returns(bool result) {
        bytes32 messageDigest = keccak256(abi.encodePacked('\x19Ethereum Signed Message:\n32', keccak256(message)));
        result = publicKey == ecrecover(messageDigest, _v, _r, _s);
        if(result){
            (address newUser) = abi.decode(message,(address));
            alreadyParticipant[newUser] = result;
        }
        return result;
    }

}