const { assert, expect } = require('chai');
const { network, getNamedAccounts, deployments, ethers } = require('hardhat');
const {
  developmentChains,
  networkConfig,
} = require('../../helper-hardhat-config');
//staging tests are only for testnet
/**
 * @Get subId for Chainlink VRF,
 * @Deploy contract using that subId
 * @Register the contract with Chainlink VRF & it's subId
 * @Register the contract with Chainlink Keepers
 * @Run staging tests
 */

developmentChains.includes(network.name)
  ? describe.skip
  : describe('Raffle Unit Tests', () => {
      let raffle, raffleEntranceFee, deployer;

      beforeEach(async () => {
        deployer = (await getNamedAccounts()).deployer;
        raffle = await ethers.getContract('Raffle', deployer);
        raffleEntranceFee = await raffle.getEntranceFee();
      });

      describe('fullfillRandomWords', () => {
        it('works with live Chainlink Keepers and Chainlink VRF, we get a random winner', async () => {
          //enter the raffle
          const startingTimeStamp = await raffle.getLatestTimeStamp();
          const accounts = await ethers.getSigners();
          await new Promise(async (resolve, reject) => {
            raffle.once('WinnerPicked', async () => {
              console.log('WinnerPicked event fired!');
              try {
                const recentWinner = await raffle.getRecentWinner();
                const raffleState = await raffle.getRaffleState();
                const winnerEndingBalance = await accounts[0].getBalance();
                const endingTimeStamp = await raffle.getLatestTimeStamp();

                await expect(raffle.getPlayer(0)).to.be.reverted;
                assert.equal(recentWinner.toString(), accounts[0].address);
                assert.equal(raffleState, 0);
                assert.equal(
                  winnerEndingBalance.toString(),
                  winnerStartingBalance.add(raffleEntranceFee).toString(),
                );
                assert(endingTimeStamp > startingTimeStamp);
                resolve();
              } catch (error) {
                console.log(error);
                reject(error);
              }
            });
            //Then entering the raffle
            console.log('Entering Raffle...');
            await raffle.enterRaffle({ value: raffleEntranceFee });
            console.log('Raffle was entered');
            // await tx.wait(1);
            console.log('Ok, time to wait...');
            const winnerStartingBalance = await accounts[0].getBalance();
            // and this code WONT complete until our listener has finished listening!
          });
          //setup listener before we enter the raffle
          // in case the blockchain moves REALLY fast
        });
      });
    });
