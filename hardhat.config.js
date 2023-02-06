/** @type import('hardhat/config').HardhatUserConfig */
require("dotenv").config();
require("@nomiclabs/hardhat-waffle");
require("hardhat-gas-reporter");
require("@nomiclabs/hardhat-etherscan");

const BSCTESTNET_PRIVATE_KEY = process.env.BSCTESTNET_PRIVATE_KEY;
const RPC_NODE = process.env.RPC_NODE;
const BSCSCAN_API_KEY = process.env.BSCSCAN_API_KEY;

module.exports = {
  solidity: {
    version: "0.8.17",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      allowUnlimitedContractSize: true,
    },
    BSCTestnet: {
      url: `${RPC_NODE}`,
      accounts: [`0x${BSCTESTNET_PRIVATE_KEY}`],
      allowUnlimitedContractSize: true,
    },
    ETHTestnet: {
      url: `${process.env.ETH_TESTNET_RPC}`,
      accounts: [`0x${BSCTESTNET_PRIVATE_KEY}`],
      allowUnlimitedContractSize: true,
    },
    BSCMainnet: {
      url: `${process.env.RPC_NODE_MAINNET}`,
      accounts: [`0x${process.env.BSCMAINNET_PRIVATE_KEY}`],
      allowUnlimitedContractSize: true,
    },
  },
  gasReporter: {
    currency: "USD",
    token: "BNB",
    gasPriceApi: "https://api.bscscan.com/api?module=proxy&action=eth_gasPrice",
    gasPrice: 5,
    coinmarketcap: "0431b70e-ffff-4061-81b0-fa361384d36c",
    // enabled: (process.env.REPORT_GAS) ? true : false
  },
  etherscan: {
    apiKey: `${process.env.ETHERSCAN_API_KEY}`,
  },
};
