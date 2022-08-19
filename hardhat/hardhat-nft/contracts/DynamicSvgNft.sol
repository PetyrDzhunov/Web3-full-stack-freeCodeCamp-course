// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "base64-sol/base64.sol";

contract DynamicSvgNft is ERC721 {


	uint private s_tokenCounter;
	string private immutable i_lowImageURI;
	string private immutable i_highIMageURI;
	string private constant base64EncodedSvgPrefix = "data:image/svg+xml;base64,";
	// mint
	// store our SVG information somewhere
	// some logic to say "Show X image" or "show Y image" 

	constructor(string memory lowSvg,string memory highSvg) ERC721("Dynamic SVG NFT" , "DSN") {
		s_tokenCounter = 0;
	}

	// encode svg to base64 URL
	function svgToImageURI(string memory svg) public pure returns(string memory){
		string memory svgBase64Encoded = Base64.encode(bytes(string(bi.encodePacked(svg))));
		return string(abi.encodePacked(base64EncodedSvgPrefix,svgBase64Encoded));
	};

	function mintNft() public {
		_safeMint(msg.sender,s_tokenCounter);
		s_tokenCounter = s_tokenCounter +1;
	}

	function _baseURI() internal pure override returns(string memory) {
		return "data:application/json;base64,";
	}

	function tokenURI(uint256 tokenId) public view override returns(string memory) {
		require(_exists(tokenId), "URI Query for nonexistent token");
		string memory imageURI = "hi!"
		Base64.encode(bytes
		(abi.encodePacked('{"name":"', name(), '", 
		"description":"AN NFT that changes based on the Chailink Feed", ',
		'"attributes": [{"trait_type": "coolness", "value": 100}],"image":"',imageURI,'"}'
		)));
	}
}	