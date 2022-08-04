const { deployments, ethers, getNamedAccounts } = require("hardhat");
const { assert, expect } = require("chai");
describe("FundMe", () => {
  let fundMe;
  let deployerAcc;
  let mockV3Aggregator;
  const sendValue = ethers.utils.parseEther("1"); // 1ETH
  beforeEach(async () => {
    //deploy fundMe contract using hardhat-deploy
    // thats why we used module.exports.tags :)
    const { deployer } = await getNamedAccounts();
    deployerAcc = deployer;
    await deployments.fixture(["all"]);
    fundMe = await ethers.getContract("FundMe", deployerAcc);
    mockV3Aggregator = await ethers.getContract(
      "MockV3Aggregator",
      deployerAcc
    );
    // gets the most recently deployed FundMe contract
    // when we call function from the contract the deployer account colds them
  });
  describe("constructor", async () => {
    it("sets the aggregator addresses correctly", async () => {
      const response = await fundMe.s_priceFeed();
      assert.equal(response, mockV3Aggregator.address);
    });
  });
  describe("fund", async () => {
    it("fails if you don't send enough ETH", async () => {
      await expect(fundMe.fund()).to.be.revertedWith("Didn't send enough");
    });

    it("updates the amount funded data structure", async () => {
      await fundMe.fund({ value: sendValue });
      const response = await fundMe.s_addressToAmountFunded(deployerAcc);
      assert.equal(response.toString(), sendValue.toString());
    });

    it("Adds funder to array of s_funders", async () => {
      await fundMe.fund({ value: sendValue });
      const funder = await fundMe.s_funders(0);
      assert.equal(funder, deployerAcc);
    });
  });

  describe("withdraw", async () => {
    beforeEach(async () => {
      await fundMe.fund({ value: sendValue });
    });

    it("withdraw ETH from a single founder", async () => {
      //Arrange
      const startingFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      );

      const startingDeployerBalance = await fundMe.provider.getBalance(
        deployerAcc
      );
      //Act
      const transactionResponse = await fundMe.withdraw();
      const { gasUsed, effectiveGasPrice } = await transactionResponse.wait(1);
      const gasCost = gasUsed.mul(effectiveGasPrice);

      const endingFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      );
      const endingDeployerBalance = await fundMe.provider.getBalance(
        deployerAcc
      );
      //Assert
      assert.equal(endingFundMeBalance, 0);
      assert.equal(
        startingFundMeBalance.add(startingDeployerBalance).toString(),
        endingDeployerBalance.add(gasCost).toString()
      );
    });

    it("withdraw ETH from a single founder", async () => {
      //Arrange
      const startingFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      );

      const startingDeployerBalance = await fundMe.provider.getBalance(
        deployerAcc
      );
      //Act
      const transactionResponse = await fundMe.cheaperWithdraw();
      const { gasUsed, effectiveGasPrice } = await transactionResponse.wait(1);
      const gasCost = gasUsed.mul(effectiveGasPrice);

      const endingFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      );
      const endingDeployerBalance = await fundMe.provider.getBalance(
        deployerAcc
      );
      //Assert
      assert.equal(endingFundMeBalance, 0);
      assert.equal(
        startingFundMeBalance.add(startingDeployerBalance).toString(),
        endingDeployerBalance.add(gasCost).toString()
      );
    });

    it("allows us to withdraw with multiple s_funders", async () => {
      //Arrange
      const accounts = await ethers.getSigners();
      for (let i = 1; i < 6; i++) {
        const fundMeConnectedContract = await fundMe.connect(accounts[i]);
        await fundMeConnectedContract.fund({ value: sendValue });
      }

      const startingFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      );

      const startingDeployerBalance = await fundMe.provider.getBalance(
        deployerAcc
      );

      //Act
      const transactionResponse = await fundMe.withdraw();
      const { gasUsed, effectiveGasPrice } = await transactionResponse.wait(1);
      const gasCost = gasUsed.mul(effectiveGasPrice);

      //Assert
      const endingFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      );
      const endingDeployerBalance = await fundMe.provider.getBalance(
        deployerAcc
      );
      //Assert
      assert.equal(endingFundMeBalance, 0);
      assert.equal(
        startingFundMeBalance.add(startingDeployerBalance).toString(),
        endingDeployerBalance.add(gasCost).toString()
      );

      //Make sure the s_funders are reset properly
      await expect(fundMe.s_funders(0)).to.be.reverted;

      for (let i = 1; i < 6; i++) {
        assert.equal(
          await fundMe.s_addressToAmountFunded(accounts[i].address),
          0
        );
      }
    });

    it("cheaperWithDrawTesting", async () => {
      //Arrange
      const accounts = await ethers.getSigners();
      for (let i = 1; i < 6; i++) {
        const fundMeConnectedContract = await fundMe.connect(accounts[i]);
        await fundMeConnectedContract.fund({ value: sendValue });
      }

      const startingFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      );

      const startingDeployerBalance = await fundMe.provider.getBalance(
        deployerAcc
      );

      //Act
      const transactionResponse = await fundMe.cheaperWithdraw();
      const { gasUsed, effectiveGasPrice } = await transactionResponse.wait(1);
      const gasCost = gasUsed.mul(effectiveGasPrice);

      //Assert
      const endingFundMeBalance = await fundMe.provider.getBalance(
        fundMe.address
      );
      const endingDeployerBalance = await fundMe.provider.getBalance(
        deployerAcc
      );
      //Assert
      assert.equal(endingFundMeBalance, 0);
      assert.equal(
        startingFundMeBalance.add(startingDeployerBalance).toString(),
        endingDeployerBalance.add(gasCost).toString()
      );

      //Make sure the s_funders are reset properly
      await expect(fundMe.s_funders(0)).to.be.reverted;

      for (let i = 1; i < 6; i++) {
        assert.equal(
          await fundMe.s_addressToAmountFunded(accounts[i].address),
          0
        );
      }
    });

    it("Only allows the owner to withdraw", async () => {
      const accounts = await ethers.getSigners();
      const attacker = accounts[1];
      const attackerConnectedContract = await fundMe.connect(attacker);
      await expect(
        attackerConnectedContract.withdraw()
      ).to.be.revertedWithCustomError(fundMe, "FundMe__NotOwner");
    });
  });
});
