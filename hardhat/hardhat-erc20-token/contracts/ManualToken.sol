// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

contract ManualToken { 
	mapping(address => uint256) public balanceOf;
	mapping(address => mapping(address => uint256)) public allowance;

	// transfer tokens
	//subtact from adrress amount and add to to address


	function _transfer(address from address to,uint256 amount) public payable {
		balanceOf[from] -= amount;
		balance[to] += amount;
	}
	
	function transferFrom(address _from,address _to, address _value) public {
		require(_value <= allowance[_from][msg.sender]);
		allowance[_from][msg.sender] -= _value;
		transfer(_from, _to, _value);
		return true;
	}
}