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
            for (
                uint j = 0;
                j < userToTokenToLockedAddresses[msg.sender][token].length;
                j++
            ) {
                if (
                    wallets[i] ==
                    userToTokenToLockedAddresses[msg.sender][token][j]
                ) {
                    revert("Address already in locked addresses");
                }
            }
            userToTokenToLockedAddresses[msg.sender][token].push(wallets[i]);
        }
        emit AddedAddresses(msg.sender, token, wallets);
    }

    function isERC20(IERC20 token) private view returns (bool) {
        if (address(token).code.length == 0) {
            return false;
        }
        try token.balanceOf(address(0)) {} 
        catch {
            return false;
        }
        try token.totalSupply() {
            return true;
        } catch {
            return false;
        }
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
        for (uint i = lockedAddresses.length - 1; i >= 0; i--) {
            for (uint j = 0; j < wallets.length; j++) {
                if (lockedAddresses[i] == wallets[j]) {
                    lockedAddresses = removeIndex(lockedAddresses, i);
                    delete wallets[j];
                    break;
                }
            }
            if (i == 0) break;
        }
        emit RemovedAddresses(msg.sender, token, wallets);
    }

    function removeIndex(
        address[] storage array,
        uint index
    ) private returns (address[] storage) {
        if (array.length > 1) {
            array[index] = array[array.length - 1];
        }
        array.pop();
        return array;
    }

    function getLockedAddresses(
        address user,
        IERC20 token
    ) public view returns (address[] memory) {
        return userToTokenToLockedAddresses[user][token];
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
}
