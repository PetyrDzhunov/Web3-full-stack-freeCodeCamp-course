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
    address[] public s_funders;
    mapping (address => uint256) public s_addressToAmountFunded;
    address public immutable i_owner;
    // we pass the address price feed depending on the chain we are on

		AggregatorV3Interface public s_priceFeed;
		     
    modifier onlyOwner{
        if(msg.sender != i_owner) {
            revert FundMe__NotOwner();
        }
        _;
    }

    constructor(address priceFeedAddress) {
        i_owner = msg.sender;
				s_priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

	/**
		* @notice This function funds this contract
		* @dev This implements price feeds as our library
	 */
    function fund() public payable {
        require(msg.value.getConversionRate(priceFeed) >=  MINIMUM_USD,"Didn't send enough");   //1e18 = 1*10**18 == 1ETH (in wei)
        s_funders.push(msg.sender);
        s_addressToAmountFunded[msg.sender] = msg.value;
    }

    function withdraw() public onlyOwner {
        for(uint256 funderIndex = 0; funderIndex < s_funders.length; funderIndex++) {
            address s_funder =  funders[funderIndex];
            s_addressToAmountFunded[funder] = 0;
        }

        funders = new address[](0); // reseting the array
       (bool callSuccess,) =  payable(msg.sender).call{value: address(this).balance}("");
       require(callSuccess, "Call failed");
    }
}