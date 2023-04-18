// SPDX-License-Identifier: GPL-3.0

import "hardhat/console.sol";
pragma solidity ^0.8.0;

contract TCake {
    string public name = "Test CAKE Token";
    string public symbol = "TCake";
    uint256 public totalSupply = 1000000000000000000000000;
    uint8 public decimals = 18;

    event Transfer(address indexed _from, address indexed _to, uint256 _value);
    event Approval(
        address indexed _owner,
        address indexed _spender,
        uint256 _value
    );
    event Deposit(address indexed _sender, uint256 _value);
    event Withdrawal(address indexed _sender, uint256 _value);

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;
    mapping(address => uint256) public balanceOfBNB;

    constructor() {
        balanceOf[msg.sender] = totalSupply;
    }

    function transfer(address _to, uint256 _value)
    public
    returns (bool success)
    {
        require(balanceOf[msg.sender] >= _value,"44444444444");
        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;
        emit Transfer(msg.sender, _to, _value);
        return true;
    }

    function approve(address _spender, uint256 _value)
    public
    returns (bool success)
    {
        allowance[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    function transferFrom(
        address _from,
        address _to,
        uint256 _value
    ) public returns (bool success) {
        require(_value <= balanceOf[_from],"2222222222");
        require(_value <= allowance[_from][msg.sender],"111111111");
        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;
        allowance[_from][msg.sender] -= _value;
        emit Transfer(_from, _to, _value);
        return true;
    }

    function deposit() public payable {
        balanceOfBNB[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value);
    }

    function withdraw(uint _value) public {
        require(balanceOfBNB[msg.sender] >= _value,"33333333333");
        balanceOfBNB[msg.sender] -= _value;
        payable(msg.sender).transfer(_value);
        emit Withdrawal(msg.sender, _value);
    }
}