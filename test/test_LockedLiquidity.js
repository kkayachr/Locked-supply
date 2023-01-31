const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const {
  days,
} = require("@nomicfoundation/hardhat-network-helpers/dist/src/helpers/time/duration");
const { expect } = require("chai");
const { ethers } = require("hardhat");
require("dotenv").config();

describe("LockedSupply", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployLockedSupply() {
    const [owner, otherAccount] =
      await ethers.getSigners();


    let randomAddresses = [];
    for (let i = 0; i < 100; i++) {
      randomAddresses.push(ethers.Wallet.createRandom().address);
    }


    const LockedSupply = await ethers.getContractFactory("LockedSupply");
    const lockedSupply = await LockedSupply.deploy();
    await lockedSupply.deployed();

    const ERC20Mock = await ethers.getContractFactory("ERC20Mock");
    const erc20Mock = await ERC20Mock.deploy(10000);
    await erc20Mock.deployed();

    await erc20Mock.mint(otherAccount.address, 2000);

    return {
      lockedSupply,
      erc20Mock,
      owner,
      otherAccount,
      randomAddresses
    };
  }
  it("Should add addresses", async () => {
    const { lockedSupply, owner, otherAccount, randomAddresses } =
      await loadFixture(deployLockedSupply);

    await lockedSupply.addLockedAddresses(owner.address, randomAddresses);
    let lockedAddresses = await lockedSupply.getLockedAddresses(owner.address, owner.address);
    await expect(lockedAddresses).to.eql(randomAddresses);
  });
  it("Should give locked supply 1", async () => {
    const { lockedSupply, erc20Mock, owner, otherAccount } =
      await loadFixture(deployLockedSupply);

    await lockedSupply.addLockedAddresses(erc20Mock.address, [owner.address, otherAccount.address]);
    let lockedSupplyAmount = await lockedSupply.getLockedSupply(owner.address, erc20Mock.address);
    await expect(lockedSupplyAmount).to.eq(12000);
  });
  it("Should give locked supply 2", async () => {
    const { lockedSupply, erc20Mock, owner, otherAccount } =
      await loadFixture(deployLockedSupply);

    await lockedSupply.addLockedAddresses(erc20Mock.address, [otherAccount.address]);
    let lockedSupplyAmount = await lockedSupply.getLockedSupply(owner.address, erc20Mock.address);
    await expect(lockedSupplyAmount).to.eq(2000);
  });
  it("Should give total supply", async () => {
    const { lockedSupply, erc20Mock, owner, otherAccount } =
      await loadFixture(deployLockedSupply);

    await lockedSupply.addLockedAddresses(erc20Mock.address, [otherAccount.address]);
    let totalSupply = await lockedSupply.getTotalSupply(erc20Mock.address);
    await expect(totalSupply).to.eq(12000);
  });
  it("Should give circulating supply", async () => {
    const { lockedSupply, erc20Mock, owner, otherAccount } =
      await loadFixture(deployLockedSupply);

    await lockedSupply.addLockedAddresses(erc20Mock.address, [otherAccount.address]);
    let circulatingSupply = await lockedSupply.getCirculatingSupply(owner.address, erc20Mock.address);
    await expect(circulatingSupply).to.eq(10000);
  });
  it("Should give supply information", async () => {
    const { lockedSupply, erc20Mock, owner, otherAccount } =
      await loadFixture(deployLockedSupply);

    await lockedSupply.addLockedAddresses(erc20Mock.address, [otherAccount.address]);
    let supplyInformation = await lockedSupply.getSupplyInformation(owner.address, erc20Mock.address);
    supplyInformation = supplyInformation.map(x => x.toNumber());
    await expect(supplyInformation).to.eql([12000, 2000, 10000]);
  });
  it("Should let remove addresses", async () => {
    const { lockedSupply, erc20Mock, owner, otherAccount, randomAddresses } =
      await loadFixture(deployLockedSupply);

    await lockedSupply.addLockedAddresses(erc20Mock.address, randomAddresses);
    let indices = await lockedSupply.getIndices(erc20Mock.address, randomAddresses.slice(0, 40));
    await lockedSupply.removeLockedAddresses(erc20Mock.address, indices);
    let lockedAddresses = await lockedSupply.getLockedAddresses(owner.address, erc20Mock.address);
    await expect(lockedAddresses).to.eql([...new Array(40).fill(ethers.constants.AddressZero), ...randomAddresses.slice(40, 100)]);
  });
});