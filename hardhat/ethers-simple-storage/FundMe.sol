//SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;
import "./PriceConvertor.sol"; 

error NotOwner();

contract FundMe {

    using PriceConvertor for uint256;
    uint256 public constant MINIMUM_USD = 50 * 1e18;
    address[] public funders;
    mapping (address => uint256) public addressToAmountFunded;
    address public immutable i_owner;
    
    constructor() {
        i_owner = msg.sender;
    }

    function fund() public payable {
        msg.value.getConversionRate();
        require(msg.value.getConversionRate() >=  MINIMUM_USD,"Didn't send enough");   //1e18 = 1*10**18 == 1ETH (in wei)
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
     
    modifier onlyOwner{
        // require(msg.sender == i_owner, "Only owner can withdraw");
        if(msg.sender != i_owner) {
            revert NotOwner();
        }
        _;
    }

    receive() external payable {
        fund();
    }

    fallback() external payable {
        fund();
    }
}