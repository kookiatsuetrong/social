// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

contract Social {
	mapping(address => uint256) public balance;
	mapping(address => bool) public member;

	function register() public {
		require(member[msg.sender] == false); // new address
		member[msg.sender] = true;
	}
	
	function deposit(uint256 amount) public payable {
		require(msg.value == amount);
		require(member[msg.sender] == true);  // existing address
		balance[msg.sender] += amount;
	}
	
	function withdraw(uint256 amount) public {
		require(amount <= balance[msg.sender]);
		balance[msg.sender] -= amount;
		address payable target = payable(msg.sender);
		target.transfer(amount);
	}
	
	function close() public {
		require(member[msg.sender] == true);
		member[msg.sender] = false;
		uint256 amount = balance[msg.sender];
		balance[msg.sender] = 0;
		address payable target = payable(msg.sender);
		target.transfer(amount);
	}
}

// V4 Ropsten Address: 0x54f94798E9F44Ef49D6A33793AA6d61B12caeCCE
// V3 Ropsten Address: 0xD19454A65706773E3F5709267A8Cc42f932fCe9a  ACTIVE
// V2 Ropsten Address: 0x4C1DbFA51f193D521C62488A5bf02FD137698EE1
// V1 Ropsten Address: 0xa81e2495D976F877B07D6cb69c87B8f2F9dB545A

