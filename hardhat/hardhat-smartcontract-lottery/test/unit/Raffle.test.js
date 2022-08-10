const { assert, expect } = require('chai');
const { network, getNamedAccounts, deployments, ethers } = require('hardhat');
const {
  developmentChains,
  networkConfig,
} = require('../../helper-hardhat-config');

!developmentChains.includes(network.name)
  ? describe.skip
  : describe('Raffle Unit Tests', () => {
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

      describe('constructor', () => {
        it('initializes the raffle correctly', async () => {
          // Ideally we make our tests have just 1 assert per "it"
          const raffleState = await raffle.getRaffleState();
          assert.equal(interval.toString(), networkConfig[chainId]['interval']);
          assert.equal(raffleState.toString(), '0'); // 0 is open in the enum
        });
      });

      describe('enterRaffle', () => {
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

        describe('checkUpkeep', () => {
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
            await network.provider.request({ method: 'evm_mine', params: [] });
            const { upkeepNeeded } = await raffle.callStatic.checkUpkeep([]);
            assert(!upkeepNeeded);
          });

          it('returns true if enough time has passed,has players,eth and is open', async () => {
            await raffle.enterRaffle({ value: raffleEntranceFee });
            await network.provider.send('evm_increaseTime', [
              interval.toNumber() + 1,
            ]);
            await network.provider.request({ method: 'evm_mine', params: [] });
            const { upkeepNeeded } = await raffle.callStatic.checkUpkeep('0x');
            assert(upkeepNeeded);
          });

          it('reverts when checkUpkeep is false', async () => {
            await expect(
              raffle.performUpkeep([]),
            ).to.be.revertedWithCustomError(raffle, 'Raffle_UpkeepNotNeeded');
          });
        });
      });

      describe('performUpkeep', () => {
        it('it can only run if checkUpkeep is true', async () => {
          await raffle.enterRaffle({ value: raffleEntranceFee });
          await network.provider.send('evm_increaseTime', [
            interval.toNumber() + 1,
          ]);
          await network.provider.send('evm_mine', []);
          const tx = await raffle.performUpkeep([]);
          assert(tx);
        });

        it('updates the raffle state, emits and event and calls the vrf coordinator', async () => {
          await raffle.enterRaffle({ value: raffleEntranceFee });
          await network.provider.send('evm_increaseTime', [
            interval.toNumber() + 1,
          ]);
          await network.provider.request({ method: 'evm_mine', params: [] });
          const txResponse = await raffle.performUpkeep([]);
          const txReceipt = await txResponse.wait(1);
          const requestId = txReceipt.events[1].args.requestId;
          const raffleState = await raffle.getRaffleState();
          assert(requestId.toNumber() > 0);
          assert(raffleState.toString() == '1');
        });
      });

      describe('fullfillRandomWords', () => {
        beforeEach(async () => {
          /* make sure a player has entered before the pick of random winner number */
          await raffle.enterRaffle({ value: raffleEntranceFee });
          await network.provider.send('evm_increaseTime', [
            interval.toNumber() + 1,
          ]);
          await network.provider.send('evm_mine', []);
        });

        it('can only be called after performUpkeep', async () => {
          await expect(
            vrfCoordinatorV2Mock.fulfillRandomWords(0, raffle.address),
          ).to.be.revertedWith('nonexistent request');
          await expect(
            vrfCoordinatorV2Mock.fulfillRandomWords(1, raffle.address),
          ).to.be.revertedWith('nonexistent request');
        });
        // wayyyy to big should be destructured to few tests
        it('picks a winner, resets the lottery and sends money', async () => {
          const additionalEntrants = 3;
          const startingAccountIndex = 1; // deployer = 0
          const accounts = await ethers.getSigners();
          // from 1 to 4 => connect the raffle contract to this new 3 accounts and then enter the raffle
          for (
            let i = startingAccountIndex;
            i < startingAccountIndex + additionalEntrants;
            i++
          ) {
            const accountConnectedRaffle = raffle.connect(accounts[i]);
            await accountConnectedRaffle.enterRaffle({
              value: raffleEntranceFee,
            });
          }

          const startingTimeStamp = await raffle.getLatestTimeStamp();
          // performUpkeep (mock being chainlink keepers)
          // it will kick off calling fulfillRandomWords (mock being the chainlink VRF)
          // We will have to wait for the fulfillRandomWords to be called if we're on testnet
          // we need to set up a listener to  simulate waiting for an event
          // we dont want the test to be finished before the listener is done listening

          await new Promise(async (resolve, reject) => {
            // listen for the WinnerPicked event when it gets emitted then do something
            raffle.once('WinnerPicked', async () => {
              console.log('Found the event!');

              try {
                const recentWinner = await raffle.getRecentWinner();
                console.log(recentWinner);
                console.log(accounts[0].address);
                console.log(accounts[1].address);
                console.log(accounts[2].address);
                console.log(accounts[3].address);
                const raffleState = await raffle.getRaffleState();
                const endingTimeStamp = await raffle.getLatestTimeStamp();
                const numPlayers = await raffle.getNumberOfPlayers();
                const winnerEndingBalance = await accounts[1].getBalance();
                assert.equal(numPlayers.toString(), '0');
                assert.equal(raffleState.toString(), '0'); // back to open
                assert(endingTimeStamp > startingTimeStamp);
                assert.equal(
                  winnerEndingBalance.toString(),
                  winnerStartingBalance.add(
                    raffleEntranceFee
                      .mul(additionalEntrants)
                      .add(raffleEntranceFee)
                      .toString(),
                  ),
                );
              } catch (e) {
                reject(e);
              }

              resolve();
            });
            //Setting up the listener
            //below we will fire the event, and the listener will pick it up, and resolve
            const tx = await raffle.performUpkeep([]);
            const txReceipt = await tx.wait(1);
            const winnerStartingBalance = await accounts[1].getBalance();
            await vrfCoordinatorV2Mock.fulfillRandomWords(
              txReceipt.events[1].args.requestId,
              raffle.address,
            );
          });
        });
      });
    });
