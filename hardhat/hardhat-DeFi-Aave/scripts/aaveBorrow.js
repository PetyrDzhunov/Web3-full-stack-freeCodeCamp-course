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

    //Borrow...
    // getUserAccountData()
    let { availableBorrowsETH, totalDebtETH } = await getBorrowUserData(lendingPool, deployer)
    const daiPrice = await getDaiPrice()
    // amount of Dai we can borrow - conver it from the available amount  from the ETH available
    const amountDaiToBorrow = availableBorrowsETH.toString() * 0.95 * (1 / daiPrice.toNumber())
    console.log(`You can borrow ${amountDaiToBorrow} DAI`)
    const amountDaiToBorrowWei = ethers.utils.parseEther(amountDaiToBorrow.toString())
    const daiTokenAddress = networkConfig[network.config.chainId]["daiToken"]
    await borrowDai(daiTokenAddress, lendingPool, amountDaiToBorrowWei, deployer)

    await getBorrowUserData(lendingPool, deployer)
    await repay(amountDaiToBorrowWei, daiTokenAddress, lendingPool, deployer)
    await getBorrowUserData(lendingPool, deployer)
}

async function repay(amount, daiAddress, lendingPool, account) {
    const lendingPoolAddress = await lendingPool.address
    await approveErc20(daiAddress, lendingPoolAddress, amount, account)
    const repayTx = await lendingPool.repay(daiAddress, amount, 1, account)
    await repayTx.wait(1)
    console.log("Repaid!")
}

async function borrowDai(daiAddress, lendingPool, amountDaiToBorrowWei, account) {
    const borrowTx = await lendingPool.borrow(daiAddress, amountDaiToBorrowWei, 1, 0, account)
    await borrowTx.wait(1)
    console.log(`You've borrowed!`)
}

async function getDaiPrice() {
    const daiEthPriceFeed = await ethers.getContractAt(
        "AggregatorV3Interface",
        networkConfig[network.config.chainId]["daiEthPriceFeed"]
    )
    const price = (await daiEthPriceFeed.latestRoundData())[1]
    console.log(`The DAI/ETH price is ${price.toString()}`)
    return price
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

async function getBorrowUserData(lendingPool, account) {
    const {
        totalCollateralETH,
        totalDebtETH,
        availableBorrowsETH
    } = await lendingPool.getUserAccountData(account)
    console.log(`You have  ${totalCollateralETH} worth of ETH deposited`)
    console.log(`You have ${totalDebtETH} worth of ETH borrowed`)
    console.log(`You can borrow ${availableBorrowsETH} worth of ETH`)
    return { availableBorrowsETH, totalDebtETH }
}
main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(`Error`, error)
        process.exit(1)
    })
