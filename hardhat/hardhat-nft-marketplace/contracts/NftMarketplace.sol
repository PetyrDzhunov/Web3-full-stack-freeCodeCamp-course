// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol"; 

error NftMarketplace__PriceMustBeAboveZero();
error NftMarketPlace__NotApprovedForMarketplace();
error NftMarketplace__AlreadyListed(address nftAddress,uint256 tokenId);
error NftMarketplace__NotListed(address nftAddress,uint256 tokenId);
error NftMarketplace__NotOwner();
error NftMarketplace_PriceNotMet(address nftAddress, uint256 tokenId,uint256 price);

contract NftMarketplace is ReentrancyGuard {

	struct Listing { 
		uint256 price;
		address seller;
	}

	event ItemListed (
		address indexed seller,
		address indexed nftAddress,
		uint256 indexed tokenId,
		uint256 price
	);

	event ItemBought(
		address indexed buyer,
		address indexed nftAddress,
		uint256 indexed tokenId,
		uint256 price
	)

	// NFT Contract address -> NFT TokenID -> Listing
	mapping(address => mapping(uint256 => Listing)) private s_listings;
	// Seller address -> Amount earned
	mapping(address => uint256) private s_proceeds;

	//////////////////////
	// Modifiers        //
	//////////////////////
	modifier notListed(address nftAddress,uint256 tokenId,address owner) {
		Listing memory listing = s_listings[nftAddress][tokenId];
		if(listing.price > 0) {
			revert NftMarketplace__AlreadyListed(nftAddress,tokenId);
		}
		_;
	}

	modifier isOwner(address nftAddress,uint256 tokenId,address spender) {
		IERC721 nft = IERC721(nftAddress);
		address owner = nft.ownerOf(tokenId);
		if(spender != owner) {
			 revert Marketplace__NotOwner();
		}
		_;
	}

	modifier isListed(address nftAddress, uint256 tokenId) {
		Listing memory listing = s_listings[nftAddress][tokenId];
		if(listing.price <= 0) {
			revert NftMarketplace__NotListed(nftAddress,tokenId);
		}
		_;
	}

	//////////////////////
	// Main Functions //
	/////////////////////

	/*
	* @notice Method for listing your NFT on the marketplace
	* @param nftAddress: Adress of the NFT
	* @param tokenId: The Token ID of the NFT
	* @param price: sale price of the listed NFT
	* @dev Technically, we could have the contract be the escrow for the NFTs
	* but this way people can still hold their NFTs when listed.
	*/

	function listItem(address nftAddress, uint256 tokenId, uint256 price) external 
	notListed(nftAddress,tokenId,msg.sender)
	isOwner(nftAddress,tokenId,msg.sender) {
		if(price <=0) {
			revert NftMarketplace__PriceMustBeAboveZero();
		}

		// 1. Send the NFT to the contract. Transfer -> Contract "hold" the NFT.
		// 2. Owners can still hold their NFT, and give the marketplace approval to sell the NFT for them.
		 IERC721 nft = IERC721(nftAddress);
		 if(nft.getApproved(tokenId) != address(this)) {
			revert NftMarketPlace__NotApprovedForMarketplace();
		 }
		s_listings[nftAddress][tokenId] = Listing(price,msg.sender);
		emit ItemListed(msg.sender,nftAddress,tokenId,price);
	}


	function buyItem(address nftAddress,uint256 tokenId) external payable
	isListed(nftAddress,tokenId)
	nonReentrant { 
		listing memory listedItem = s_listings[nftAddress][tokenId];
		if(msg.value < listedItem.price) {
			revert NftMarketplace_PriceNotMet(nftAddress,tokenId,listedItem.price);
		}
	 // We don't just send the seller the money...?
	 // Pull over push solidity concept - best practice when working with Solidity

		s_proceeds[listedItem.seller] = s_proceeds[listedItem.seller] + msg.value;
		delete (s_listings[nftAddress][tokenId]);
		IERC721(nftAddress).safeTransferFrom(listedItem.seller,msg.sender,tokenId);
		emit ItemBought(msg.sender,nftAddress,tokenId,listedItem.price);

	}
	
}



// 1. Create a decentralized NFT Marketplace
//     1. `listItem`: List NFTs on the marketplace
//     2. `buyItem`: Buy the NFTs
//     3. `cancelItem`: Cancel a listing
//     4. `updateListing`: Update price
//     5. `withdrawProceeds`: Withdraw payment for my bought NFTs
