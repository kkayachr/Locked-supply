// require("dotenv").config();
const { ethers } = require("hardhat");

async function main() {
  const LockedSupplyMonitor = await ethers.getContractFactory("LockedSupplyMonitor");
  const lockedSupplyMonitor = await LockedSupplyMonitor.deploy();
  await lockedSupplyMonitor.deployed();

  console.log(lockedSupplyMonitor.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
