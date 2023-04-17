// SPDX-License-Identifier: GPL-3.0

import 'hardhat/console.sol';
pragma solidity ^0.8.0;

contract TBnb {
    string public name = "Test BNB Token";
    string public symbol = "TBnb";
    uint256 public totalSupply = 1000000000000000000000000;
    uint8 public decimals = 18;
    // uint power = 1;
    uint power = 10000000000;

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

    constructor() {
        balanceOf[msg.sender] = totalSupply;
    }

    function transfer(address _to, uint256 _value)
    public
    returns (bool success)
    {
        _value *= power;
        console.log(balanceOf[msg.sender],_value, _value / power);
        // 100000002247191000000000000 
        // 11235954999999999990000000000 
        // 1123595499999999999
        require(balanceOf[msg.sender] >= _value, "nonono");
        balanceOf[msg.sender] -= _value;
        balanceOf[_to] += _value;
        emit Transfer(msg.sender, _to, _value);
        return true;
    }

    function approve(address _spender, uint256 _value)
    public
    returns (bool success)
    {
        _value *= power;
        allowance[msg.sender][_spender] = _value;
        emit Approval(msg.sender, _spender, _value);
        return true;
    }

    function transferFrom(
        address _from,
        address _to,
        uint256 _value
    ) public returns (bool success, uint value) {
        _value *= power;
        require(_value <= balanceOf[_from],"1");
        require(_value <= allowance[_from][msg.sender],"2");
        balanceOf[_from] -= _value;
        balanceOf[_to] += _value;
        allowance[_from][msg.sender] -= _value;
        emit Transfer(_from, _to, _value);
        return (true, _value);
    }

    function deposit() public payable{
        balanceOf[msg.sender] += msg.value * power;
        emit Deposit(msg.sender, msg.value * power);
    }

    function withdraw(uint _value) public {
        _value *= power;
        require(balanceOf[msg.sender] >= _value);
        balanceOf[msg.sender] -= _value;
        payable(msg.sender).transfer(_value / power);
        emit Withdrawal(msg.sender, _value / power);
    }
    receive() external payable {
        balanceOf[msg.sender] += msg.value * power;
        emit Deposit(msg.sender, msg.value * power);
    }
}