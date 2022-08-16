// SPDX License-Identifier: MIT

pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

error RandomIpfsNft__RangeOutOfBounds;

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

		//VRF Helpers
		mapping(uint256 => address) public s_requestIdToSender; // so we know whoever call the requestNft function to be existent in fulfillRandomWords

		//NFT variables
		uint256 public s_tokenCounter;
		uint256 internal constant MAX_CHANCE_VALUE = 100;

		//Type Declaration
		enum Breed {
			PUG,
			SHIBA_INU,
			ST.BERNARD
		};

contract RandomIpfsNft is VRFConsumerBaseV2,ERC721 {

	constructor(address vrfCoordinatorV2,
	 uint64 subscriptionId,
	 bytes32 gasLane,
	 uint32 callbackGasLimit
	)

	 	VRFConsumerBaseV2(vrfCoordinatorV2) 
		ERC721("Random IPFS NFT", "RIN")  {
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
		);
		s_requestIdToSender[requestId] = msg.sender;
	}


	function fulfillRandomWords(uint256 requestId,uint256[] memory randomWords) override internal {
		address dogOwner = s_requestIdToSender[requestId];
		// mint this random NFT(dog) for this user and save it to his account/address
		uint256 newTokenId = s_tokenCounter;
		_safeMint(dogOwner,newTokenId);
		//What does this token look like?
		uint256 moddedRng = randomWords[0] % MAX_CHANCE_VALUE;// between 0-99

		getBreedFromModdedRng()
		s_tokenCounter = s_tokenCounter + 1;
	}

	function getBreedFromModdedRng(uint256 moddedRng) public pure return(Breed) {
		uint256 cumulativeSum = 0;
		uint256[3] memory chanceArray = getChanceArray();
		for(uint256 i = 0; i<chanceArray.length; i++) {
			if(moddedRng >= cumulativeSum && moddedRng < cumulativeSum + chanceArray[i]) {
				return Breed(i);
			};
			cumulativeSum +=chanceArray[i];
		}
		revert RandomIpfsNft__RangeOutOfBounds();
	}

	function getChanceArray() public pure returns(uint256[3] memory) {
		return [10,30,MAX_CHANCE_VALUE];
		// pug - 10 % , shiba-inu 30%, st.bernard - 60% chance 
	}	

	function tokenURI(uint256) public view override returns(string memory) {

	}

}