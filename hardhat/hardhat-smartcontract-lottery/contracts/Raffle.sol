

// Enter the lottery (paying some amount)

//Pick a random winner (verifiably random)

//Winner to be selected every X minutes -> completely automated

//Chainlink Oracle -> Randomness, Automated Exectuion(Chainlink Keepers)

// SPDX-License-Identifier: MIT

pragma solidity ^0.8.9;
error Raffle__NotEnoughETHEntered()

contract Raffle {
	/* State Variables */
	uint256 immutable private i_entranceFee;
	address payable[] private s_players;

	constructor(uint256 entranceFee) {
		i_entranceFee = entranceFee
	}

		function enterRaffle() public payable {
			if(msg.value < i_entranceFee) {
				revert(Raffle__NotEnoughETHEntered)
			}
			s_players.push(payable(msg.sender));
		}

		//function pickRandomWinner() {}

		function getIntranceFee() public view returns(uint256) {
			return i_entranceFee;
		}
		
		function getPlayer(uint256 index) public view returns(address) {
			return s_players[index];
		}
}