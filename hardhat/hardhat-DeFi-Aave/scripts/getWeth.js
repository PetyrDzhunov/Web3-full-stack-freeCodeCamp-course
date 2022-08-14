const { getNamedAccounts } = requrie('hardhat');

async function getWeth() {
  const { deployer } = await getNamedAccounts();
  // call the deposit function on the WETH contract;
  // abi , contract address
}

module.exports = { getWeth };
