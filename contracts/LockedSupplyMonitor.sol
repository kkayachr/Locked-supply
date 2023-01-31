// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract LockedSupplyMonitor {
    event addedAddresses(
        address indexed user,
        address indexed token,
        uint amount
    );
    event removedAddresses(
        address indexed user,
        address indexed token,
        uint amount
    );

    mapping(address => mapping(address => address[]))
        public userToTokenToLockedAddresses;

    function addLockedAddresses(
        address token,
        address[] calldata wallets
    ) public {
        for (uint i = 0; i < wallets.length; i++) {
            userToTokenToLockedAddresses[msg.sender][token].push(wallets[i]);
        }
        emit addedAddresses(msg.sender, token, wallets.length);
    }

    function removeLockedAddresses(
        address token,
        uint[] calldata walletIndices
    ) public {
        address[] storage lockedAddresses = userToTokenToLockedAddresses[
            msg.sender
        ][token];
        for (uint i = 0; i < walletIndices.length; i++) {
            delete lockedAddresses[walletIndices[i]];
        }
        emit removedAddresses(msg.sender, token, walletIndices.length);
    }

    function getIndices(
        address token,
        address[] calldata wallets
    ) public view returns (uint[] memory indices) {
        indices = new uint[](wallets.length);
        address[] memory lockedAddresses = userToTokenToLockedAddresses[msg.sender][token];

        uint count = 0;
        for (uint i = 0; i < lockedAddresses.length; i++) {
            for (uint j = 0; j < wallets.length; j++) {
                if (lockedAddresses[i] == wallets[j]) {
                    indices[count] = i;
                    count++;
                    if (count == wallets.length) return indices;
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
