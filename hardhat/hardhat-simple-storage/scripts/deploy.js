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
    console.log(process.env.ETHERSCAN_API_KEY);
    if (network.config.chainID === 4 && process.env.ETHERSCAN_API_KEY) {
        console.log("Waiting for blocks tx...");
        await simpleStorage.deployTransaction.wait(6); // wait 6 blocks to be mined and then run verification proccess
        await verify(simpleStorage.address, []);
    }

    const currentValue = await simpleStorage.retrieve();
    console.log(`Current value is ${currentValue}`);
    const transactionResponse = await simpleStorage.store(7);
    await transactionResponse.wait(1);
    const updatedValue = await simpleStorage.retrieve();
    console.log(`Updated value is: ${updatedValue}`);
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
