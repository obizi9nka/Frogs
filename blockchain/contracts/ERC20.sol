// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";


contract ERC20Token is ERC20 {
    constructor(string memory name, string memory symbol) ERC20(name,symbol) {    }

    function getTokens(uint amount) public {
        _mint(msg.sender,amount);
    }
}