require('@nomicfoundation/hardhat-toolbox');
require('hardhat-deploy');

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: '0.8.7',
  defaultNetwork: 'hardhat',
  namedAccounts: {
    deployer: {
      default: 0,
    },
  },
};
