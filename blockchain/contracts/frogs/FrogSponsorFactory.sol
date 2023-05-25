// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;


import "./FrogSponsor.sol";
// import "../v3-interfaces/IUniswapV3Factory.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import 'hardhat/console.sol';
import "./IFrogs.sol";


contract FrogSponsorFactory is Ownable{
    mapping(address => address) public sponsorContracts;

    address frogFactory;

    constructor(address _frogFactory) {
        frogFactory = _frogFactory;
    }

    function createNewSponsor(IFrog.DeployLotteryParams memory params, address lottery) public {
        require(msg.sender == frogFactory, "not a factory");

        address newSponsor = address(new FrogSponsor(params, lottery));
        sponsorContracts[lottery] = newSponsor;
    }

}