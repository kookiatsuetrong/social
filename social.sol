contract Social {
	mapping(address => uint256) public balance;
	mapping(address => bool) public member;

	function register(uint256 amount) public payable {
		require(msg.value == amount);
		require(member[msg.sender] == false); // new address
		member[msg.sender] = true;
		balance[msg.sender] = amount;
	}
	
	function deposit(uint256 amount) public payable {
		require(msg.value == amount);
		member[msg.sender] = true;
		balance[msg.sender] += amount;
	}
	
	function withdraw(uint256 amount) public {
		require(amount <= balance[msg.sender]);
		balance[msg.sender] -= amount;
		address payable target = payable(msg.sender);
		target.transfer(amount);
	}
	
	function remove() public {
		require(member[msg.sender] == true);
		member[msg.sender] = false;
		uint256 amount = balance[msg.sender];
		balance[msg.sender] = 0;
		address payable target = payable(msg.sender);
		target.transfer(amount);
	}
}
pragma solidity ^0.8.8;
// SPDX-License-Identifier: MIT


// V2 Ropsten Address: 0x4C1DbFA51f193D521C62488A5bf02FD137698EE1
// V1 Ropsten Address: 0xa81e2495D976F877B07D6cb69c87B8f2F9dB545A

/*
JavaScript

contract.methods.deposit('1000000000000')
	.send({from:'0x5f7dbfe77ae919075a8f4d074de2676dba4aa812',
			value: '1000000000000'},
	function(error, result) {
		console.log(error)
		console.log(result)
	})

contract.methods.withdraw('10003001000000000')
.send({from:'0x5f7dbfe77ae919075a8f4d074de2676dba4aa812'},
	function(error, result) {
		console.log(error)
		console.log(result)
	})

contract.methods.show('0x5f7dbfe77ae919075a8f4d074de2676dba4aa812')
.call({from:'0x5f7dbfe77ae919075a8f4d074de2676dba4aa812'},
	function(error, result) {
		console.log(error)
		console.log(result)
	})

contract.methods.show()
.call({from:'0x5f7dbfe77ae919075a8f4d074de2676dba4aa812'},
	function(error, result) {
		console.log(error)
		console.log(result)
	})

contract.methods.balance('0x5f7dbfe77ae919075a8f4d074de2676dba4aa812')
.call({from:'0x5f7dbfe77ae919075a8f4d074de2676dba4aa812'},
	function(error, result) {
		console.log(error)
		console.log(result)
	})

contract.methods.check()
.call({from:'0x5f7dbfe77ae919075a8f4d074de2676dba4aa812'},
	function(error, result) {
		console.log(error)
		console.log(result)
	})




*/


/*

"abi": [
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "balance",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "deposit",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getBalance",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "a",
				"type": "address"
			}
		],
		"name": "getBalance",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "withdraw",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	}
]
*/