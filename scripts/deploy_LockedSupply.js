// require("dotenv").config();
const { ethers } = require("hardhat");

async function main() {
  const LockedSupply = await ethers.getContractFactory("LockedSupply");
  const lockedSupply = await LockedSupply.deploy();
  await lockedSupply.deployed();

  console.log(lockedSupply.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
