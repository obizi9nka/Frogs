// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


import "./FrogLottery.sol";
import "./pancekeswap-fork/utils/interfaces/IFrogReferal.sol";

contract Factory {
    address FrogReferalAddress;

    mapping(address => mapping(address => address)) lotteriesForward;
    mapping(address => mapping(address => address)) lotteriesBackward;

    constructor(address _FrogReferalAddress) {
        FrogReferalAddress = _FrogReferalAddress;
        createNewLottery(_FrogReferalAddress);
    }

    address public cake_bnb;

    function createNewLottery(address _FrogReferalAddress) public {
        cake_bnb = address(new FrogLottery(FrogReferalAddress));
        IFrogReferal(_FrogReferalAddress).registerNewLottery(cake_bnb);
    }

}