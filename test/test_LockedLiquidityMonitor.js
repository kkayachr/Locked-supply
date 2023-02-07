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

describe("LockedSupplyMonitor", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployLockedSupplyMonitor() {
    const [owner, otherAccount] =
      await ethers.getSigners();

    let randomAddresses = [];
    for (let i = 0; i < 30; i++) {
      randomAddresses.push(ethers.Wallet.createRandom().address);
    }

    const LockedSupplyMonitor = await ethers.getContractFactory("LockedSupplyMonitor");
    const lockedSupplyMonitor = await LockedSupplyMonitor.deploy();
    await lockedSupplyMonitor.deployed();

    const ERC20Mock = await ethers.getContractFactory("ERC20Mock");
    const erc20Mock = await ERC20Mock.deploy(10000);
    await erc20Mock.deployed();

    await erc20Mock.mint(otherAccount.address, 2000);

    return {
      lockedSupplyMonitor,
      erc20Mock,
      owner,
      otherAccount,
      randomAddresses
    };
  }

  it("Should add addresses", async () => {
    const { lockedSupplyMonitor, owner, erc20Mock, otherAccount, randomAddresses } =
      await loadFixture(deployLockedSupplyMonitor);

    await lockedSupplyMonitor.addLockedAddresses(erc20Mock.address, randomAddresses);
    let lockedAddresses = await lockedSupplyMonitor.getLockedAddresses(owner.address, erc20Mock.address);
    await expect(lockedAddresses).to.eql(randomAddresses);
  });
  it("Should filter duplicate addresses", async () => {
    const { lockedSupplyMonitor, owner, erc20Mock, otherAccount, randomAddresses } =
      await loadFixture(deployLockedSupplyMonitor);

    await lockedSupplyMonitor.addLockedAddresses(erc20Mock.address, randomAddresses);
    await lockedSupplyMonitor.addLockedAddresses(erc20Mock.address, randomAddresses);
    await expect(await lockedSupplyMonitor.getLockedAddresses(owner.address, erc20Mock.address)).to.eql(randomAddresses);
  });
  it("Should check for duplicate addresses", async () => {
    const { lockedSupplyMonitor, owner, erc20Mock, otherAccount, randomAddresses } =
      await loadFixture(deployLockedSupplyMonitor);

    await lockedSupplyMonitor.addLockedAddresses(erc20Mock.address, randomAddresses);
    await lockedSupplyMonitor.addLockedAddresses(erc20Mock.address, randomAddresses);
    var [duplicateAddresses, duplicateIndex] = await lockedSupplyMonitor.duplicatesCheck(owner.address, erc20Mock.address);
    await expect(duplicateAddresses).to.eql(randomAddresses);

    var expectedIndices = Array.from(Array(30).keys()).map(x => x + randomAddresses.length);
    await expect(duplicateIndex.map(x => x.toNumber())).to.eql(expectedIndices);
  });
  it("Should give locked supply 1", async () => {
    const { lockedSupplyMonitor, erc20Mock, owner, otherAccount } =
      await loadFixture(deployLockedSupplyMonitor);

    await lockedSupplyMonitor.addLockedAddresses(erc20Mock.address, [owner.address, otherAccount.address]);
    let lockedSupplyMonitorAmount = await lockedSupplyMonitor.getLockedSupply(owner.address, erc20Mock.address);
    await expect(lockedSupplyMonitorAmount).to.eq(12000);
  });
  it("Should give locked supply 2", async () => {
    const { lockedSupplyMonitor, erc20Mock, owner, otherAccount } =
      await loadFixture(deployLockedSupplyMonitor);

    await lockedSupplyMonitor.addLockedAddresses(erc20Mock.address, [otherAccount.address]);
    let lockedSupplyMonitorAmount = await lockedSupplyMonitor.getLockedSupply(owner.address, erc20Mock.address);
    await expect(lockedSupplyMonitorAmount).to.eq(2000);
  });
  it("Should give locked supply with removal", async () => {
    const { lockedSupplyMonitor, erc20Mock, owner, otherAccount } =
      await loadFixture(deployLockedSupplyMonitor);

    await lockedSupplyMonitor.addLockedAddresses(erc20Mock.address, [owner.address, otherAccount.address]);
    await lockedSupplyMonitor.removeLockedAddresses(erc20Mock.address, [owner.address]);
    let lockedSupplyMonitorAmount = await lockedSupplyMonitor.getLockedSupply(owner.address, erc20Mock.address);
    await expect(lockedSupplyMonitorAmount).to.eq(2000);
  });
  it("Should give locked supply with removal duplicates", async () => {
    const { lockedSupplyMonitor, erc20Mock, owner, otherAccount } =
      await loadFixture(deployLockedSupplyMonitor);

    await lockedSupplyMonitor.addLockedAddresses(erc20Mock.address, [owner.address, otherAccount.address]);
    await lockedSupplyMonitor.addLockedAddresses(erc20Mock.address, [owner.address, otherAccount.address]);
    await lockedSupplyMonitor.removeLockedAddresses(erc20Mock.address, [owner.address]);
    let lockedSupplyMonitorAmount = await lockedSupplyMonitor.getLockedSupply(owner.address, erc20Mock.address);
    await expect(lockedSupplyMonitorAmount).to.eq(2000);
  });
  it("Should give locked supply with index removal duplicates", async () => {
    const { lockedSupplyMonitor, erc20Mock, owner, otherAccount } =
      await loadFixture(deployLockedSupplyMonitor);

    await lockedSupplyMonitor.addLockedAddresses(erc20Mock.address, [owner.address, otherAccount.address]);
    await lockedSupplyMonitor.addLockedAddresses(erc20Mock.address, [owner.address, otherAccount.address]);
    let indices = await lockedSupplyMonitor.getIndices(erc20Mock.address, [owner.address]);
    await lockedSupplyMonitor.removeLockedAddressesWithIndex(erc20Mock.address, indices);
    let lockedSupplyMonitorAmount = await lockedSupplyMonitor.getLockedSupply(owner.address, erc20Mock.address);
    await expect(lockedSupplyMonitorAmount).to.eq(2000);
  });
  it("Should give total supply", async () => {
    const { lockedSupplyMonitor, erc20Mock, owner, otherAccount } =
      await loadFixture(deployLockedSupplyMonitor);

    await lockedSupplyMonitor.addLockedAddresses(erc20Mock.address, [otherAccount.address]);
    let totalSupply = await lockedSupplyMonitor.getTotalSupply(erc20Mock.address);
    await expect(totalSupply).to.eq(12000);
  });
  it("Should give circulating supply", async () => {
    const { lockedSupplyMonitor, erc20Mock, owner, otherAccount } =
      await loadFixture(deployLockedSupplyMonitor);

    await lockedSupplyMonitor.addLockedAddresses(erc20Mock.address, [otherAccount.address]);
    let circulatingSupply = await lockedSupplyMonitor.getCirculatingSupply(owner.address, erc20Mock.address);
    await expect(circulatingSupply).to.eq(10000);
  });
  it("Should give supply information", async () => {
    const { lockedSupplyMonitor, erc20Mock, owner, otherAccount } =
      await loadFixture(deployLockedSupplyMonitor);

    await lockedSupplyMonitor.addLockedAddresses(erc20Mock.address, [otherAccount.address]);
    let supplyInformation = await lockedSupplyMonitor.getSupplyInformation(owner.address, erc20Mock.address);
    supplyInformation = supplyInformation.map(x => x.toNumber());
    await expect(supplyInformation).to.eql([12000, 2000, 10000]);
  });
  it("Should let remove addresses", async () => {
    const { lockedSupplyMonitor, erc20Mock, owner, otherAccount, randomAddresses } =
      await loadFixture(deployLockedSupplyMonitor);

    await lockedSupplyMonitor.addLockedAddresses(erc20Mock.address, randomAddresses);
    await lockedSupplyMonitor.removeLockedAddresses(erc20Mock.address, randomAddresses.slice(0, 10));
    var lockedAddresses = await lockedSupplyMonitor.getLockedAddresses(owner.address, erc20Mock.address);
    lockedAddresses = Array.from(lockedAddresses).sort();
    rAddresses = Array.from(randomAddresses.slice(10, 30)).sort();
    await expect(lockedAddresses).to.eql(rAddresses);
  });
  it("Should let remove addresses with indices", async () => {
    const { lockedSupplyMonitor, erc20Mock, owner, otherAccount, randomAddresses } =
      await loadFixture(deployLockedSupplyMonitor);

    await lockedSupplyMonitor.addLockedAddresses(erc20Mock.address, randomAddresses);
    let indices = await lockedSupplyMonitor.getIndices(erc20Mock.address, randomAddresses.slice(0, 10));
    await lockedSupplyMonitor.removeLockedAddressesWithIndex(erc20Mock.address, indices);
    var lockedAddresses = await lockedSupplyMonitor.getLockedAddresses(owner.address, erc20Mock.address);
    lockedAddresses = Array.from(lockedAddresses).sort();
    rAddresses = Array.from(randomAddresses.slice(10, 30)).sort();
    await expect(lockedAddresses).to.eql(rAddresses);
  });
  it("Should get correct indices", async () => {
    const { lockedSupplyMonitor, erc20Mock, owner, otherAccount, randomAddresses } =
      await loadFixture(deployLockedSupplyMonitor);


    await lockedSupplyMonitor.addLockedAddresses(erc20Mock.address, randomAddresses);
    var indices = await lockedSupplyMonitor.getIndices(erc20Mock.address, randomAddresses.slice(0, 10));
    indices = indices.map(x => x.toNumber());
    await expect(indices).to.eql(Array.from(Array(10).keys()));

    var randomIndices = Array.from({ length: 10 }, () => Math.floor(Math.random() * 30));
    var rAddresses = [];
    randomIndices.forEach(x => rAddresses.push(randomAddresses[x]));
    indices = await lockedSupplyMonitor.getIndices(erc20Mock.address, rAddresses);
    indices = indices.map(x => x.toNumber());
    indices.sort();
    randomIndices.sort();
    await expect(indices).to.eql(randomIndices);
  });
});