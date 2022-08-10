const { assert, expect } = require('chai');
const { network, getNamedAccounts, deployments, ethers } = require('hardhat');
const {
  developmentChains,
  networkConfig,
} = require('../../helper-hardhat-config');

!developmentChains.includes(network.name)
  ? describe.skip
  : describe('Raffle Unit Tests', async () => {
      let raffle, vrfCoordinatorV2Mock, raffleEntranceFee, deployer;
      const chainId = network.config.chainId;

      beforeEach(async () => {
        deployer = (await getNamedAccounts()).deployer;
        await deployments.fixture(['all']); // check out the tags in deploy files
        raffle = await ethers.getContract('Raffle', deployer);
        vrfCoordinatorV2Mock = await ethers.getContract(
          'VRFCoordinatorV2Mock',
          deployer,
        );
        raffleEntranceFee = await raffle.getEntranceFee();
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

      describe('enterRaffle', async () => {
        it("reverts when you don't pay enough", async () => {
          await expect(raffle.enterRaffle()).to.be.revertedWithCustomError(
            raffle,
            'Raffle__NotEnoughETHEntered',
          );
        });

        it('records players when they enter', async () => {
          await raffle.enterRaffle({ value: raffleEntranceFee });
          const playerFromContract = await raffle.getPlayer(0);
          assert.equal(playerFromContract, deployer);
        });

        it('emits event on enter', async () => {
          await expect(
            raffle.enterRaffle({ value: raffleEntranceFee }),
          ).to.emit(raffle, 'RaffleEnter');
        });
      });
    });
