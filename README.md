<p align="center">
  <a href="" rel="noopener">
 <img width=200px height=200px src="./logo.png" alt="Project logo"></a>
</p>

<h3 align="center">Locked Supply</h3>

<div align="center">

[![Status](https://img.shields.io/badge/status-active-success.svg)]()
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](/LICENSE)

</div>

---

<p align="center"> Enables calculations of locked supply, circulating supply and total supply on directly on the blockchain
    <br> 
</p>

## 📝 Table of Contents

- [About](#about)
- [Getting Started](#getting_started)
- [Deployment](#deployment)
- [Usage](#usage)
- [Built Using](#built_using)
- [Authors](#authors)

## 🏁 Getting Started <a name = "getting_started"></a>

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See [deployment](#deployment) for notes on how to deploy the project on a live system.

### Prerequisites

Simply do an npm install in the root folder for the prerequisites 

```
npm install
```


## 🔧 Running the tests <a name = "tests"></a>

Tests can simply be run by the following console command in the root folder:

```
npx hardhat test
```

## 🎈 Usage <a name="usage"></a>

The smart contract is available on Binance Smart Chain at the moment:
- [BSC Contract](https://testnet.bscscan.com/address/0xdD2fA1F0450E42F16d1A24223fFa08d196E55AcE)

Simply go in there and add locked addresses to the correct token. You can then call get supply information which will give you total supply, locked supply and circulating supply.

## 🚀 Deployment <a name = "deployment"></a>

The smart contract can otherwise be deployed normally using the deploy_LockedSupply script.

## ⛏️ Built Using <a name = "built_using"></a>

- [Hardhat](https://hardhat.org/) - Blockchain Tooling

## ✍️ Authors <a name = "authors"></a>

- [@kkayam](https://github.com/kkayam)

See also the list of [contributors](https://github.com/kkayachr/locked-supply/graphs/contributors) who participated in this project.
