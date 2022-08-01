const { ethers, run, network } = require("hardhat");

async function main() {
    const SimpleStorageFactory = await ethers.getContractFactory(
        "SimpleStorage"
    );
    console.log("Deploying contract");
    const simpleStorage = await SimpleStorageFactory.deploy();
    await simpleStorage.deployed();
    console.log(`Deployed contract to ${simpleStorage.address}`);
    // ONLY verify if we are on the rinkeby(chainID=4) test network
    // and we have etherscan api key in the .env file
    if (network.config.chainId === 4 && process.env.ETHERSCAN_API_KEY) {
        await simpleStorage.deployTransaction.wait(6); // wait 6 blocks to be mined and then run verification proccess
        await verify(simpleStorage.address, []);
    }
}

async function verify(contractAddress, args) {
    console.log("Veryfying contract...");
    try {
        await run("verify:verify", {
            address: contractAddress,
            constructorArguments: args,
        });
    } catch (err) {
        if (err.message.toLowerCase().includes("already verified")) {
            console.log("Already Verified!");
        } else {
            console.log(err);
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
