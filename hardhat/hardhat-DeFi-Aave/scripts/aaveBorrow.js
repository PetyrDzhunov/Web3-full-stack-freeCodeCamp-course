const { getNamedAccounts, ethers, network } = require("hardhat")
const { networkConfig } = require("../helper-hardhat-config")
const { getWeth, AMOUNT } = require("../scripts/getWeth")

async function main() {
    await getWeth()
    const { deployer } = await getNamedAccounts()
    const lendingPool = await getLendingPool(deployer)
    const lendingPoolAddress = await lendingPool.address

    console.log(`Lending pool address : ${lendingPoolAddress}`)
    //depositing into aave - need abi,adress
    // 0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5 - Lending pool address provider\
    const wethTokenAddress = networkConfig[network.config.chainId]["wethToken"]
    // before depositing we first need to approve the token
    await approveErc20(wethTokenAddress, lendingPoolAddress, AMOUNT, deployer)
    console.log("Depositing...")

    await lendingPool.deposit(wethTokenAddress, AMOUNT, deployer, 0)
    console.log("Deposited")
}

async function getLendingPool(account) {
    const lendingPoolAdressProvider = await ethers.getContractAt(
        "ILendingPoolAddressesProvider",
        "0xb53c1a33016b2dc2ff3653530bff1848a515c8c5",
        account
    )

    const lendingPoolAddress = lendingPoolAdressProvider.getLendingPool()
    const lendingPool = await ethers.getContractAt("ILendingPool", lendingPoolAddress, account)
    return lendingPool
}

async function approveErc20(erc20Address, spenderAdress, amountToSpend, account) {
    const erc20Token = await ethers.getContractAt("IERC20", erc20Address, account)
    const tx = await erc20Token.approve(spenderAdress, amountToSpend)
    await tx.wait(1)
    console.log("Approved")
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(`Error`, error)
        process.exit(1)
    })
