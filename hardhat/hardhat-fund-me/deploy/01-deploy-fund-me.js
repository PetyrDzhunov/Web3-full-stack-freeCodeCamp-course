//hardhat-deployer gives us the hre as a param when we run
// deploy so we are destructuring to get only what we need

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts(); // from hardhat.config.js
  const chainId = network.config.chainID;
};
