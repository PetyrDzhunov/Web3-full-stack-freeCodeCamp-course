//hardhat-deployer gives us the hre as a param when we run
// deploy so we are destructuring to get only what we need
const {
  networkConfig,
  developmentChains,
} = require('../helper-hardhat-config');
const { network } = require('hardhat');

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log, get } = deployments;
  const { deployer } = await getNamedAccounts(); // from hardhat.config.js

  let ethUsdPriceFeedAddress;
  if (developmentChains.includes(network.name)) {
    const ethUsdAggregator = await get('MockV3Aggregator');
    ethUsdPriceFeedAddress = ethUsdAggregator.address;
  } else {
    ethUsdPriceFeedAddress = networkConfig[chainID]['ethUsdPriceFeed'];
  }
  //if the contract doesn't exist , we depoy a minimal version of  contract for our local testing

  //when going for localhost or hardhat network we want to use a mock
  // what happens when we want to change chains? - they have
  // different addresses because they are different contracts on different chains
  const fundMe = await deploy('FundMe', {
    from: deployer,
    args: [ethUsdPriceFeedAddress], // price feed address,
    log: true,
  });
  log('-/-/-/-/-/-/-/-/-/-/-/-/-/-/-//-/-/-/-/-/-/-/-');
};

module.exports.tags = ['all', 'fundme'];
