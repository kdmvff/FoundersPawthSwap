pragma solidity ^0.8.0;

import '@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol';

contract NFT is ERC1155Supply {

    string public name;
    string public symbol;
    string public tokenURI = "ipfs://QmfF1YwwSvV5veD1MysGBAaDds6nBgTUqs3r6hCUsb4XmR/0";
    bytes public tokenURIBytes = bytes("ipfs://QmfF1YwwSvV5veD1MysGBAaDds6nBgTUqs3r6hCUsb4XmR/0");

    constructor(address _addr1, address _addr2) ERC1155("") {
        // mint 3 tokens to the deployer of id 0
        _mint(msg.sender, 0, 3, "");
        // mint 4 tokens to account 1
        _mint(_addr1, 0, 5, "");    
        // mint 5 tokens to account 2
        _mint(_addr2, 0, 5, "");        
        name = "Kevin";
        symbol = "KEV";
    }
}