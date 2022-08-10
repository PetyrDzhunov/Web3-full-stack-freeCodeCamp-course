const { assert, expect } = require('chai');
const { network, getNamedAccounts, deployments, ethers } = require('hardhat');
const {
  developmentChains,
  networkConfig,
} = require('../../helper-hardhat-config');

!developmentChains.includes(network.name)
  ? describe.skip
  : describe('Raffle Unit Tests', async () => {
      let raffle, vrfCoordinatorV2Mock, raffleEntranceFee, deployer, interval;
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
        interval = await raffle.getInterval();
      });

      describe('constructor', async () => {
        it('initializes the raffle correctly', async () => {
          // Ideally we make our tests have just 1 assert per "it"
          const raffleState = await raffle.getRaffleState();
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

        it('doesnt allow entance when raffle is calculating', async () => {
          await raffle.enterRaffle({ value: raffleEntranceFee });
          await network.provider.send('evm_increaseTime', [
            interval.toNumber() + 1,
          ]);
          await network.provider.send('evm_mine', []);
          // We pretend to be a Chainlink Keeper
          await raffle.performUpkeep([]);
          await expect(
            raffle.enterRaffle({ value: raffleEntranceFee }),
          ).to.be.revertedWithCustomError(raffle, 'Raffle__NotOpen');
        });

        describe('checkUpkeep', async () => {
          it('return false if provider havent sent any ETH', async () => {
            await network.provider.send('evm_increaseTime', [
              interval.toNumber() + 1,
            ]);
            await network.provider.send('evm_mine', []);
            // simulate calling this transaction and seeing what it respond
            const { upkeepNeeded } = await raffle.callStatic.checkUpkeep([]); // will get the returned value
            assert(!upkeepNeeded);
          });

          it('returns false if raffle isnt open', async () => {
            await raffle.enterRaffle({ value: raffleEntranceFee });
            await network.provider.send('evm_increaseTime', [
              interval.toNumber() + 1,
            ]);
            await network.provider.send('evm_mine', []);
            await raffle.performUpkeep([]);
            const raffleState = await raffle.getRaffleState();
            const { upkeepNeeded } = await raffle.callStatic.checkUpkeep([]); // will get the returned value
            assert.equal(raffleState.toString(), '1');
            assert.equal(upkeepNeeded, false);
          });

          it('returns false if enough time hasnt passed', async () => {
            await raffle.enterRaffle({ value: raffleEntranceFee });
            await network.provider.send('evm_increaseTime', [
              interval.toNumber() - 1,
            ]);
            await network.provider.send('evm_mine', []);
            const { upkeepNeeded } = await raffle.callStatic.checkUpkeep([]);
            assert(!upkeepNeeded);
          });

          it('returns true if enough time has passed,has players,eth and is open', async () => {
            await raffle.enterRaffle({ value: raffleEntranceFee });
            await network.provider.send('evm_increaseTime', [
              interval.toNumber() + 1,
            ]);
            await network.provider.send('evm_mine', []);
            const { upkeepNeeded } = await raffle.callStatic.checkUpkeep([]);
            assert(upkeepNeeded);
          });
        });
      });
    });
