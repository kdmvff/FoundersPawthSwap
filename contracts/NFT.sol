pragma solidity ^0.8.1;

import '@openzeppelin/contracts/token/ERC1155/ERC1155.sol';

contract NFT is ERC1155 {

    string public name;
    string public symbol;
    address public account2 = 0x8E6a9e6F141BF9bd5A9a4318aD5458D1ad312939;
    string public tokenURI = "ipfs://QmfF1YwwSvV5veD1MysGBAaDds6nBgTUqs3r6hCUsb4XmR/0";
    bytes public tokenURIBytes = bytes("ipfs://QmfF1YwwSvV5veD1MysGBAaDds6nBgTUqs3r6hCUsb4XmR/0");

    constructor() ERC1155("") {
        // mint 3 tokens to the deployer of id 0
        _mint(msg.sender, 0, 3, "");
        // mint 5 tokens to account 2 on ganache of id 1
        _mint(account2, 0,5,"");        
        name = "Kevin";
        symbol = "KEV";
    }
}