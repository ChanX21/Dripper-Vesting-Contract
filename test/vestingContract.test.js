const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

describe("Dripper Vesting Contract Testing....", function () {
  async function deployVestingFixture() {
    const [owner, admin, senderAccount1, senderAccount2, recipientAccount1, recipientAccount2] = await ethers.getSigners();
    const Dripper = await ethers.getContractFactory("Dripper");
    const dripper = await Dripper.deploy();

    return { dripper, owner, admin, senderAccount1, senderAccount2, recipientAccount1, recipientAccount2 };
  }

  describe("Vesting Contract Deployment", function () {
    it("Should set the right admin", async function () {
      const { dripper, owner } = await loadFixture(deployVestingFixture);
      expect(await dripper.isAdmin(owner)).to.be.true;
    });

    it("Should set the right balance of owner", async function () {
      const { dripper, owner } = await loadFixture(deployVestingFixture);
      expect(Number(await dripper.balanceOf(owner))).to.be.equal(600000000 * 10 ** 18);
    });

    it("Should set the right balance of owner", async function () {
      const { dripper, owner, senderAccount1 } = await loadFixture(deployVestingFixture);
      await dripper.setAdmin(senderAccount1, true);
      expect(await dripper.isAdmin(senderAccount1)).to.be.true;
    });
  });

  describe("Vestings", function () {
    it("Should lock a vesting for a sender address", async function () {
      const { dripper, owner, recipientAccount1 } = await loadFixture(deployVestingFixture);
      const TIME = (await time.latest()) + 10;
      await dripper.lockToVestAndTransfer(100000, recipientAccount1, TIME, 100, 20);
      expect(Number(await dripper.getTotalLockedAmountForAddress(owner))).to.be.equal(100000);
    });
    it("Should lock a vesting for an admin address", async function () {
      const { dripper, owner, senderAccount1, recipientAccount1 } = await loadFixture(deployVestingFixture);
      const TIME = (await time.latest()) + 10;
      await dripper["lockToVestAndTransfer(address,address,uint256,uint256,uint256,uint256)"](senderAccount1, recipientAccount1, 100000, TIME, 100, 20);
      expect(Number(await dripper.getTotalLockedAmountForAddress(senderAccount1))).to.be.equal(100000);
    });
    it("Should lock multiple vesting for a sender address", async function () {
      const { dripper, owner, senderAccount1, recipientAccount1, senderAccount2, recipientAccount2 } = await loadFixture(deployVestingFixture);
      const TIME = (await time.latest()) + 10;
      await dripper.multipleLockToVestAndTransfer([recipientAccount1, recipientAccount2], [100000, 20000], TIME, 100, 20);
      expect(Number(await dripper.getTotalLockedAmountForAddress(owner))).to.be.equal(100000 + 20000);
    });
    it("Should lock multiple vesting for an admin address", async function () {
      const { dripper, owner, senderAccount1, recipientAccount1, senderAccount2, recipientAccount2 } = await loadFixture(deployVestingFixture);
      const TIME = (await time.latest()) + 10;
      await dripper["multipleLockToVestAndTransfer(address[],address[],uint256[],uint256,uint256,uint256)"]([senderAccount1, senderAccount2], [recipientAccount1, recipientAccount2], [100000, 20000], TIME, 300, 1);
      expect(Number(await dripper.getTotalLockedAmountForAddress(senderAccount1))).to.be.equal(100000);
      expect(Number(await dripper.getTotalLockedAmountForAddress(senderAccount2))).to.be.equal(20000);
      await time.increase(20000);
      let [locked, unlocked] = await dripper.getLockedAndUnlockedPerAgreement(senderAccount1,0);
      expect(locked).to.equal(0);
      expect(unlocked).to.equal(100000);
    });
  });

  describe("Withdrawals", function () {
    it("Should be withdrawable for the recipient after the alloted time", async function () {
      const { dripper, owner, senderAccount1, recipientAccount1 } = await loadFixture(deployVestingFixture);
      const TIME = (await time.latest()) + 10;
      await dripper["lockToVestAndTransfer(address,address,uint256,uint256,uint256,uint256)"](senderAccount1, recipientAccount1, 100000, TIME, 100, 20);
      const vestingAgreement = await dripper.connect(recipientAccount1).getVestingAgreements(senderAccount1, 0);
      expect(vestingAgreement.totalAmount).to.equal(100000);
      await time.increaseTo(TIME + 100 * 20);
      expect(await dripper.connect(recipientAccount1).getWithdrawableAmount(senderAccount1, 0)).to.equal(100000);
      await dripper.connect(recipientAccount1).withdraw(senderAccount1, 0, 100000);
      expect((await dripper.balanceOf(recipientAccount1))).to.equal(100000);
    });
  });

  describe("Other Utilities", function () {
    it("testing other utility functions", async function () {
      const { dripper, owner, senderAccount1, recipientAccount1, recipientAccount2 } = await loadFixture(deployVestingFixture);
      const TIME = (await time.latest()) + 10;
      await dripper.mint(senderAccount1, 7000);
      expect(Number(await dripper.balanceOf(senderAccount1))).to.equal(7000);
      await dripper.multipleLockToVestAndTransfer([recipientAccount1, recipientAccount2], [100000, 20000], TIME, 100, 20);
      expect(Number(await dripper.getNumberOfVestingAgreement(owner))).to.equal(2);
    });
  });
});
