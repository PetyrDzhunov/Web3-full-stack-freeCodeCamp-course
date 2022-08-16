// SPDX License-Identifier: MIT

pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";

/**
	when we mint an NFT, we will trigger a Chainlink VRF call to get us a random number
	using that number, we will get a random NFT
	Pug, Shiba Inu, St.Bernard - each dogs have different rarity
	users have to pay to mint an NFT
	The owner of the contract can withdraw the ETH
 */

    VRFCoordinatorV2Interface immutable private i_vrfCoordinator;
		uint64 private immutable i_subscriptionId;
		bytes private immutable i_gasLane;
		uint32 private immutable i_callbackGasLimit;
		uint16 private constant REQUEST_CONFIRMATIONS = 3;
		uint32 private constant NUM_WORDS = 1;

contract RandomIpfsNft is VRFConsumerBaseV2  {

	constructor(address vrfCoordinatorV2,
	 uint64 subscriptionId,
	 bytes32 gasLane,
	 uint32 callbackGasLimit
	)
	 	VRFConsumerBaseV2(vrfCoordinatorV2) {
		i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinatorV2);
	  i_subscriptionId = subscriptionId;
		i_gasLane = gasLane;
		i_callbackGasLimit = callbackGasLimit;
	}

	function requestNft() public returns (uint256 requestId) {  // kick off a chainLink vrf request
		requestId = i_vrfCoordinator.requestRandomWords(
			i_gasLane,
			i_subscriptionId,
			REQUST_CONFIRMATIONS,
			i_callbackGasLimit,
			NUM_WORDS
		)
	}


	function fulfillRandomWords(uint256 requestId,uint256[] memory randomWords) override internal {

	}

	function tokenURI(uint256) public {

	}
}