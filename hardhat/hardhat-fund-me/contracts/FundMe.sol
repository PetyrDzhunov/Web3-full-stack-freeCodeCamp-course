//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;
import "./PriceConvertor.sol"; 

error FundMe__NotOwner();

/** @title A contract for crowd funding
	*	@author Petar Dzhunov
 	*	@notice This contract is to demo a sample funding contract
 	*	@dev This implements price feeds as our library
 */
contract FundMe {

    using PriceConvertor for uint256;
    uint256 public constant MINIMUM_USD = 50 * 1e18;
    address[] public funders;
    mapping (address => uint256) public addressToAmountFunded;
    address public immutable i_owner;
    // we pass the address price feed depending on the chain we are on

		AggregatorV3Interface public priceFeed;
		     
    modifier onlyOwner{
        if(msg.sender != i_owner) {
            revert FundMe__NotOwner();
        }
        _;
    }

    constructor(address priceFeedAddress) {
        i_owner = msg.sender;
				priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

	/**
		* @notice This function funds this contract
		* @dev This implements price feeds as our library
	 */
    function fund() public payable {
        require(msg.value.getConversionRate(priceFeed) >=  MINIMUM_USD,"Didn't send enough");   //1e18 = 1*10**18 == 1ETH (in wei)
        funders.push(msg.sender);
        addressToAmountFunded[msg.sender] = msg.value;
    }

    function withdraw() public onlyOwner {
        for(uint256 funderIndex = 0; funderIndex < funders.length; funderIndex++) {
            address funder =  funders[funderIndex];
            addressToAmountFunded[funder] = 0;
        }

        funders = new address[](0); // reseting the array
       (bool callSuccess,) =  payable(msg.sender).call{value: address(this).balance}("");
       require(callSuccess, "Call failed");
    }
}