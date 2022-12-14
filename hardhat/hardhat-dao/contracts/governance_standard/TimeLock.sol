//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/governance/TimelockController.sol";

contract TimeLock is TimelockController {

	// minDelay: How long you have to wait before executing
	// proposers is the list of the address that can propose
	// executors: Who can execute a proposal passes
	constructor(
		uint256 minDelay,
		address[] memory proposers,
		address[] memory executors
	) TimelockController(minDelay,proposers,executors) {}
}
// Que // we want to wait for a new vote to be "executed"

// Everyone who holds the governance token has to pay 5 tokens

// Give time to users to "get out" if they dont like a governance update

