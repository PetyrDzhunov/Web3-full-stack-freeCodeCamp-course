const { ethers } = require("hardhat");
const { expect, assert } = require("chai");
describe("SimpleStorage", () => {
    let simpleStorageFactory, simpleStorage;
    // deploy the contract before each test
    beforeEach(async () => {
        simpleStorageFactory = await ethers.getContractFactory("SimpleStorage");
        simpleStorage = await simpleStorageFactory.deploy();
    });

    it("Should start with a favorite number of 0", async () => {
        const currentValue = await simpleStorage.retrieve();
        const expectedValue = "0";
        assert.equal(currentValue.toString(), expectedValue);
    });

    it("Should update when we call store", async () => {
        const expectedValue = "7";
        const txResponse = await simpleStorage.store(expectedValue);
        await txResponse.wait(1);

        const currentValue = await simpleStorage.retrieve();
        assert.equal(currentValue.toString(), expectedValue);
    });
});
