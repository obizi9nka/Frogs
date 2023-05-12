// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

import 'hardhat/console.sol';

contract ERC20Token is ERC20 {
    constructor(string memory name, string memory symbol) ERC20(name,symbol) {    }

    function getTokens(uint amount) public {
        _mint(msg.sender,amount);
    }

    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) public virtual override returns (bool) {
        address spender = _msgSender();
        // console.log('this', address(this));
        // console.log(from, spender, amount);
        _spendAllowance(from, spender, amount);
        
        // console.log(from, to, amount);
        _transfer(from, to, amount);
        return true;
    }
}