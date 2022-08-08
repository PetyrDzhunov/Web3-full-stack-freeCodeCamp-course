// Enter the lottery (paying some amount)
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;
//Pick a random wi8ner (verifiably random)
//Winner to be selected every X minutes -> completely automated
//Chainlink Oracle -> Randomness, Automated Exectuion(Chainlink Keepers)

import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
error Raffle__NotEnoughETHEntered();

contract Raffle is VRFConsumerBaseV2 {
	/* State Variables */
	uint256 immutable private i_entranceFee;
	address payable[] private s_players;
	VRFCoordinatorV2Interface private immutable i_vrfCoordinator;
	bytes32 private immutable i_gasLane;
	uint64 private immutable i_subscriptionId;
	uint16 private constant REQUEST_CONFIRMATIONS = 3;
	uint32 private immutable i_callbackGasLimit;
	uint32 private constant NUM_WORDS = 1;
	/* Events */
	event RaffleEnter(address indexed player);
	event RequestedRaffleWinner(uint256 indexed requestId);

	constructor(address vrfCoordinatorV2,
	uint256 entranceFee,
	bytes32 gasLane,
	uint64 subscriptionId,
	uint32 callbackGasLimit) VRFConsumerBaseV2(vrfCoordinatorV2) {
		i_entranceFee = entranceFee;
		i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinatorV2);
		i_gasLane = gasLane;
		i_subscriptionId = subscriptionId;
		i_callbackGasLimit = callbackGasLimit;
	}

		function enterRaffle() public payable {
			if(msg.value < i_entranceFee) {
				revert Raffle__NotEnoughETHEntered();
			}
			s_players.push(payable(msg.sender));
			//Events - whenever we update a dynamic array/mapping we always want to emit an event
			//emit an event when we update a dynamic array or mapping
			// named events with the function name reversed
			emit RaffleEnter(msg.sender);
		}

	/* View / Pure functions */
		function requestRandomWinner() external {
			//We need chainlink VRF and chainlink Keepers
			//Request the random number
			// Once we get it do something with it 
			// 2 transaction process
			uint256 requestId = i_vrfCoordinator.requestRandomWords(
				i_gasLane,
				i_subscriptionId,
				REQUEST_CONFIRMATIONS,
				i_callbackGasLimit,
				NUM_WORDS
			);
		emit RequestedRaffleWinner(requestId);

		}

		function fulfillRandomWords(uint256 requestId,uint256[] memory randomWords)
		 internal override {
			 
		}

		function getIntranceFee() public view returns(uint256) {
			return i_entranceFee;
		}
		
		function getPlayer(uint256 index) public view returns(address) {
			return s_players[index];
		}
}