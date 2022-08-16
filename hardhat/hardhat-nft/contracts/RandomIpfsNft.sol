// SPDX License-Identifier: MIT

pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

error RandomIpfsNft__RangeOutOfBounds();
error RandomIpfsNft__NeedMoreETHSent();
error RandomIpfsNft__TransferFailed();
/**
	when we mint an NFT, we will trigger a Chainlink VRF call to get us a random number
	using that number, we will get a random NFT
	Pug, Shiba Inu, St.Bernard - each dogs have different rarity
	users have to pay to mint an NFT
	The owner of the contract can withdraw the ETH
 */
contract RandomIpfsNft is VRFConsumerBaseV2,ERC721URIStorage,Ownable {
	
    VRFCoordinatorV2Interface immutable private i_vrfCoordinator;
		uint64 private immutable i_subscriptionId;
		bytes32 private immutable i_gasLane;
		uint32 private immutable i_callbackGasLimit;
		uint16 private constant REQUEST_CONFIRMATIONS = 3;
		uint32 private constant NUM_WORDS = 1;

		//VRF Helpers
		mapping(uint256 => address) public s_requestIdToSender; // so we know whoever call the requestNft function to be existent in fulfillRandomWords

		//NFT variables
		uint256 public s_tokenCounter;
		uint256 internal constant MAX_CHANCE_VALUE = 100;
		string[] internal s_dogTokenUris; // we will pass the dog URI's in the constructor
		uint256 internal immutable i_mintFee;

		//Events
		event NftRequested(uint256 indexed requestId,address requester);
		event NftMinted(Breed dogBreed,address minter);

		//Type Declaration
		enum Breed {
			PUG,
			SHIBA_INU,
			ST_BERNARD
		}

	constructor(
	 address vrfCoordinatorV2,
	 uint64 subscriptionId,
	 bytes32 gasLane,
	 uint32 callbackGasLimit,
	 string[3] memory dogTokenUris,
	 uint256 mintFee
	)

	 	VRFConsumerBaseV2(vrfCoordinatorV2) 
		ERC721("Random IPFS NFT", "RIN")  {
		i_vrfCoordinator = VRFCoordinatorV2Interface(vrfCoordinatorV2);
	  i_subscriptionId = subscriptionId;
		i_gasLane = gasLane;
		i_callbackGasLimit = callbackGasLimit;
		s_dogTokenUris = dogTokenUris;
		i_mintFee = mintFee;
	}

	function requestNft() public payable returns (uint256 requestId) { // kick off a chainLink vrf reques
		if(msg.value < i_mintFee) { 
			revert RandomIpfsNft__NeedMoreETHSent();
		}
		requestId = i_vrfCoordinator.requestRandomWords(
			i_gasLane,
			i_subscriptionId,
			REQUEST_CONFIRMATIONS,
			i_callbackGasLimit,
			NUM_WORDS
		);
		s_requestIdToSender[requestId] = msg.sender;
		emit NftRequested(requestId,msg.sender);
	}


	function fulfillRandomWords(uint256 requestId,uint256[] memory randomWords) override internal {
		address dogOwner = s_requestIdToSender[requestId];
		// mint this random NFT(dog) for this user and save it to his account/address
		uint256 newTokenId = s_tokenCounter;
		//What does this token look like?
		uint256 moddedRng = randomWords[0] % MAX_CHANCE_VALUE;// between 0-99

		Breed dogBreed = getBreedFromModdedRng(moddedRng);
		s_tokenCounter = s_tokenCounter + 1;
		_safeMint(dogOwner,newTokenId);
		/* set this token this URI */
		_setTokenURI(newTokenId, s_dogTokenUris[uint256(dogBreed)] ); //casting the dog breed into uint256 to get its index
		emit NftMinted(dogBreed,dogOwner);
	}

	function withdraw() public onlyOwner {
		uint256 amount = address(this).balance;
		(bool success,) = payable(msg.sender).call{value:amount}("");
		if(!success) 
			revert RandomIpfsNft__TransferFailed();
	}

	function getBreedFromModdedRng(uint256 moddedRng) public pure returns(Breed) {
		uint256 cumulativeSum = 0;
		uint256[3] memory chanceArray = getChanceArray();
		for(uint256 i = 0; i<chanceArray.length; i++) {
			if(moddedRng >= cumulativeSum && moddedRng < cumulativeSum + chanceArray[i]) {
				return Breed(i);
			}
			cumulativeSum +=chanceArray[i];
		}
		revert RandomIpfsNft__RangeOutOfBounds();
	}

	function getChanceArray() public pure returns(uint256[3] memory) {
		return [10,30,MAX_CHANCE_VALUE];
		// pug - 10 % , shiba-inu 30%, st.bernard - 60% chance 
	}

	function getMintFee() public view returns(uint256) {
		return i_mintFee;
	}

	function getDogTokenUris(uint256 index) public view returns(string memory) {
		return s_dogTokenUris[index];
	}

	function getTokenCounter() public view returns(uint256) {
		return s_tokenCounter;
	}
}