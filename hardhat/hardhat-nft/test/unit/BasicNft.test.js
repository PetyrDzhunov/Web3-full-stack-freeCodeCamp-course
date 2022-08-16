const { assert, expect } = require("chai")
const { network, getNamedAccounts, deployments, ethers } = require("hardhat")
const { developmentChains, networkConfig } = require("../../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? desribe.skip
    : describe("BasicNft Unit Tests", () => {
          let deployer, basicNftContract
          beforeEach(async () => {
              deployer = (await getNamedAccounts()).deployer
              await deployments.fixture(["BasicNFT"])
              basicNftContract = await ethers.getContract("BasicNft")
          })
          describe("counstructor", () => {
              it("initialize the basicNft constructor correctly", async () => {
                  const tokenCounter = await basicNftContract.getTokenCounter()
                  assert.equal(tokenCounter.toString(), "0")
              })
          })
          describe("Smart contract functions", () => {
              it("works as expected minting NFT", async () => {
                  await basicNftContract.mintNft()
                  const tokenCounter = await basicNftContract.getTokenCounter()
                  assert.equal(tokenCounter.toString(), "1")
              })
          })
      })

/* after the module.exports add 
			module.exports.tags=["all","BasicNFT"]. 
			await deployments.fixture(["BasicNFT"]) 
			is the line used to deploy during tests.
			It will only deploy if what is mentioned 
			in the module.exports.tags is what is inside
			the fixtures.
			*/
