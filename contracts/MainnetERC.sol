pragma solidity ^0.8.1;

import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import 'hardhat/console.sol';

contract ERC is ERC20 {

    // You have overridden the number of decimals, such that there are 9 decimals to this erc20
    constructor() ERC20("KevToken","KEV") public {
        // 1 billion tokens
        uint256 initialSupply = 1_000_000_000_000_000_000;
        console.log("initial supply is %s",initialSupply);
        _mint(msg.sender, initialSupply);
    }
}