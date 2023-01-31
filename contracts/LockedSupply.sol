// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract LockedSupply {
    mapping(address => mapping(address => address[]))
        public userToTokenToLockedAddresses;

    function addLockedAddresses(
        address token,
        address[] calldata wallets
    ) public {
        for (uint i = 0; i < wallets.length; i++) {
            userToTokenToLockedAddresses[msg.sender][token].push(wallets[i]);
        }
    }

    function removeLockedAddresses(
        address token,
        address[] calldata wallets
    ) public {
        address[] storage lockedAddresses = userToTokenToLockedAddresses[
            msg.sender
        ][token];
        uint deletedCount = 0;
        for (uint i = 0; i < lockedAddresses.length; i++) {
            for (uint j = 0; j < wallets.length; j++) {
                if (lockedAddresses[i] == wallets[j]) {
                    delete lockedAddresses[i];
                    deletedCount++;
                    if (deletedCount == wallets.length) return;
                }
            }
        }
    }

    function getLockedAddresses(
        address user,
        address token
    ) public view returns (address[] memory) {
        return userToTokenToLockedAddresses[user][token];
    }

    function getLockedSupply(
        address user,
        address token
    ) public view returns (uint lockedSupply) {
        address[] memory lockedAddresses = getLockedAddresses(user, token);
        for (uint i = 0; i < lockedAddresses.length; i++) {
            if (lockedAddresses[i] == address(0)) continue;
            lockedSupply += IERC20(token).balanceOf(lockedAddresses[i]);
        }
    }

    function getTotalSupply(address token) public view returns (uint) {
        return IERC20(token).totalSupply();
    }

    function getCirculatingSupply(
        address user,
        address token
    ) public view returns (uint) {
        return (getTotalSupply(token) - getLockedSupply(user, token));
    }

    function getSupplyInformation(
        address user,
        address token
    ) public view returns (uint, uint, uint) {
        return (
            getTotalSupply(token),
            getLockedSupply(user, token),
            getCirculatingSupply(user, token)
        );
    }
}
