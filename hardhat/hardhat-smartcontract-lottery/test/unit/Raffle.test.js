const { assert } = require('chai');
const { network, getNamedAccounts, deployments, ethers } = require('hardhat');
const {
  developmentChains,
  networkConfig,
} = require('../../helper-hardhat-config');

!developmentChains.includes(network.name)
  ? describe.skip
  : describe('Raffle Unit Tests', async () => {
      let raffle, vrfCoordinatorV2Mock;
      const chainId = network.config.chainId;

      beforeEach(async () => {
        const { deployer } = await getNamedAccounts();
        await deployments.fixture(['all']); // check out the tags in deploy files
        raffle = await ethers.getContract('Raffle', deployer);
        vrfCoordinatorV2Mock = await ethers.getContract(
          'VRFCoordinatorV2Mock',
          deployer,
        );
      });

      describe('constructor', async () => {
        it('initializes the raffle correctly', async () => {
          // Ideally we make our tests have just 1 assert per "it"
          const raffleState = await raffle.getRaffleState();
          const interval = await raffle.getInterval();
          assert.equal(interval.toString(), networkConfig[chainId]['interval']);
          assert.equal(raffleState.toString(), '0'); // 0 is open in the enum
        });
      });
    });
