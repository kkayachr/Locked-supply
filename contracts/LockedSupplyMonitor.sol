// SPDX-License-Identifier: MIT

pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract LockedSupplyMonitor {
    event AddedAddresses(
        address indexed user,
        IERC20 indexed token,
        address[] addresses
    );
    event RemovedAddresses(
        address indexed user,
        IERC20 indexed token,
        address[] addresses
    );

    mapping(address => mapping(IERC20 => address[]))
        private userToTokenToLockedAddresses;

    function addLockedAddresses(
        IERC20 token,
        address[] calldata wallets
    ) external {
        require(
            wallets.length <= 30,
            "Cannot process more than 30 addresses at a time."
        );
        require(isERC20(token), "Token must be ERC20");
        for (uint i = 0; i < wallets.length; i++) {
            if (wallets[i] == address(0)) continue;
            userToTokenToLockedAddresses[msg.sender][token].push(wallets[i]);
        }
        emit AddedAddresses(msg.sender, token, wallets);
    }

    function removeLockedAddresses(
        IERC20 token,
        address[] memory wallets
    ) external {
        require(
            wallets.length <= 30,
            "Cannot process more than 30 addresses at a time."
        );
        require(isERC20(token), "Token must be ERC20");
        address[] storage lockedAddresses = userToTokenToLockedAddresses[
            msg.sender
        ][token];
        for (uint i = 0; i < lockedAddresses.length; i++) {
            for (uint j = 0; j < wallets.length; j++) {
                if (lockedAddresses[i] == wallets[j]) {
                    removeIndex(lockedAddresses,i);
                }
            }
        }
        emit RemovedAddresses(msg.sender, token, wallets);
    }

    function removeLockedAddressesWithIndex(
        IERC20 token,
        uint[] calldata walletIndices
    ) public {
        require(
            walletIndices.length <= 30,
            "Cannot process more than 30 addresses at a time."
        );
        address[] storage lockedAddresses = userToTokenToLockedAddresses[
            msg.sender
        ][token];
        address[] memory removedAddresses = new address[](walletIndices.length);

        for (uint i = 0; i < walletIndices.length; i++) {
            removedAddresses[i] = lockedAddresses[walletIndices[i]];
            removeIndex(lockedAddresses,walletIndices[i]);
        }
        emit RemovedAddresses(msg.sender, token, removedAddresses);
    }
    function removeIndex(
        address[] storage array,
        uint index
    ) private {
        if (array.length > 1) {
            array[index] = array[array.length - 1];
        }
        array.pop();
    }

    function getIndices(
        IERC20 token,
        address[] calldata wallets
    ) public view returns (uint[] memory indices) {
        address[] memory lockedAddresses = userToTokenToLockedAddresses[
            msg.sender
        ][token];

        uint count;
        for (uint i = 0; i < lockedAddresses.length; i++) {
            for (uint j = 0; j < wallets.length; j++) {
                if (lockedAddresses[i] == wallets[j]) {
                    count++;
                }
            }
        }

        if (count == 0) return indices;
        indices = new uint[](count);
        count = 0;
        for (uint i = 0; i < lockedAddresses.length; i++) {
            for (uint j = 0; j < wallets.length; j++) {
                if (lockedAddresses[i] == wallets[j]) {
                    indices[count] = i;
                    count++;
                }
            }
        }
    }

    function getLockedAddresses(
        address user,
        IERC20 token
    ) public view returns (address[] memory addresses) {
        address[] memory lockedAddresses = userToTokenToLockedAddresses[user][
            token
        ];
        uint count;
        for (uint i = 0; i < lockedAddresses.length; i++) {
            bool counted;
            if (lockedAddresses[i] == address(0)) continue;
            for (uint j = 0; j < i; j++) {
                if (lockedAddresses[i] == lockedAddresses[j]) {
                    counted = true;
                    break;
                }
            }
            if (!counted) count++;
        }

        addresses = new address[](count);
        count = 0;
        for (uint i = 0; i < lockedAddresses.length; i++) {
            if (lockedAddresses[i] == address(0)) continue;
            bool skip;
            for (uint j = 0; j < addresses.length; j++) {
                if (lockedAddresses[i] == addresses[j]) {
                    skip = true;
                    break;
                }
            }
            if (!skip) {
                addresses[count] = lockedAddresses[i];
                count++;
            }
        }
    }

    function getLockedSupply(
        address user,
        IERC20 token
    ) public view returns (uint lockedSupply) {
        address[] memory lockedAddresses = getLockedAddresses(user, token);
        for (uint i = 0; i < lockedAddresses.length; i++) {
            if (lockedAddresses[i] == address(0)) continue;
            lockedSupply += IERC20(token).balanceOf(lockedAddresses[i]);
        }
    }

    function getTotalSupply(IERC20 token) public view returns (uint) {
        return token.totalSupply();
    }

    function duplicatesCheck(address user, IERC20 token) external view returns (address[] memory duplicateAddresses,uint[] memory duplicateIndices) {
        address[] memory lockedAddresses = userToTokenToLockedAddresses[user][token];
        uint count;
        for (uint i = 0; i < lockedAddresses.length; i++) {
            bool counted;
            if (lockedAddresses[i] == address(0)) continue;
            for (uint j = 0; j < i; j++) {
                if (lockedAddresses[i] == lockedAddresses[j]) {
                    counted = true;
                    break;
                }
            }
            if (counted) count++;
        }

        duplicateAddresses = new address[](count);
        duplicateIndices = new uint[](count);
        count = 0;
        for (uint i = 0; i < lockedAddresses.length; i++) {
            if (lockedAddresses[i] == address(0)) continue;
            bool duplicate;
            for (uint j = 0; j < i; j++) {
                if (lockedAddresses[i] == lockedAddresses[j]) {
                    duplicate = true;
                    break;
                }
            }
            if (duplicate) {
                duplicateAddresses[count] = lockedAddresses[i];
                duplicateIndices[count] = i;
                count++;
            }
        }
    }

    function getCirculatingSupply(
        address user,
        IERC20 token
    ) public view returns (uint) {
        return (getTotalSupply(token) - getLockedSupply(user, token));
    }

    function getSupplyInformation(
        address user,
        IERC20 token
    ) public view returns (uint, uint, uint) {
        return (
            getTotalSupply(token),
            getLockedSupply(user, token),
            getCirculatingSupply(user, token)
        );
    }

    function isERC20(IERC20 token) private view returns (bool) {
        if (address(token).code.length == 0) {
            return false;
        }
        try token.balanceOf(address(0)) {} catch {
            return false;
        }
        try token.totalSupply() {
            return true;
        } catch {
            return false;
        }
    }
}
