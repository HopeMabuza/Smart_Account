// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;


import "@account-abstraction/contracts/core/EntryPoint.sol";
import "@account-abstraction/contracts/interfaces/IAccount.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/Create2.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "hardhat/console.sol";


contract Test {
    constructor (bytes memory sig){
    address recovered = ECDSA.recover(ECDSA.toEthSignedMessageHash(keccak256("hello")), sig);
    console.log(recovered);

    }

}

contract TestTarget {
    uint256 public x;

    function setX(uint256 _x) public {
        x = _x;
    }
}
