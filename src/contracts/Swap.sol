pragma solidity ^0.8.0;

import '@openzeppelin/contracts/utils/math/SafeMath.sol';
import '@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol';
import '@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';

contract Swap is ERC1155Holder {
    using SafeMath for uint256;
    ERC1155Supply public founders;
    IERC20 public pawth;
    uint256 public foundersId = 0;
    string public tokenURI = "ipfs://QmfF1YwwSvV5veD1MysGBAaDds6nBgTUqs3r6hCUsb4XmR/0";
    bytes public tokenURIBytes = bytes("ipfs://QmfF1YwwSvV5veD1MysGBAaDds6nBgTUqs3r6hCUsb4XmR/0");
    // set a 10% claim tax (100 = 0% tax, and 125 = 25% tax, you can't set a tax below 0% or above 25%)
    uint256 public pawthClaimTax = 110;
    address public ownerWallet = 0x8E6a9e6F141BF9bd5A9a4318aD5458D1ad312939;
    address public multiSigWallet = 0xA1924006401CaBEcC4EF4AB7542EeaA357449ed6;

    // the totalSupply() from the founder's nft contract cannot be accessed. Hence, it will need to be manually updated every so often
    //uint256 public manualNFTSupply = 30;

    // Create two types of swaps: Variable and Fixed
    // If variable is set to "true", the contract is designed to accumulate pawth over time
    // If variable is set to "fixed", the contract has a fixed swap rate
    bool public variableSwapRateOn = true;

    // if a fixed swap rate is being used, specify the fixed swap rate
    uint256 public fixedPawthSwapRate = 300000000000000;

    // Can add a fixed swap rate tax
    bool public fixedClaimTax = true;

    constructor(ERC1155Supply _founders, IERC20 _pawth) public {
        founders = _founders;
        pawth = _pawth;
    }

    // sets the founders claim tax for a variableSwap
    function setVariableClaimTax(uint256 tax) public {
        require(msg.sender == ownerWallet || msg.sender == multiSigWallet, "You are not permitted to change the tax");
        require(tax < 130, "You cannot set a tax above 30%");
        require(tax >=100, "You cannot set a tax below 0%");
        pawthClaimTax = tax;
    }

    // if set to true, contract designed to favor Pawth accumulation. if false, fixed swap rate is used.
    function toggleSwapType(bool variableSwapIsOn) public {
        require(msg.sender == ownerWallet || msg.sender == multiSigWallet, "You are not permitted to call this function.");
        variableSwapRateOn = variableSwapIsOn;
    }


    // Change wallet addresses that have admin rights (can only be called by multisig)
    function changeWalletAddresses(address newOwnerWallet, address newMultiSigWallet) public {
        require(msg.sender == multiSigWallet, "Only the multiSigWallet can change admin addresses");
        ownerWallet = newOwnerWallet;
        multiSigWallet = newMultiSigWallet;
    }

    // transfer pawth out of the contract to the multiSigWallet (can only be called by multisig)
    function transferPawthOut(uint256 pawthAmount) public {
        require(msg.sender == multiSigWallet, "Only the multiSigWallet can remove Pawth.");
        pawth.transfer(multiSigWallet, pawthAmount);
    }

    // transfer eth out in the event that there is eth stuck in the contract (can only be called by multisig)
    function transferEthOut(bool sent, uint256 ethAmount) public payable {
        require(msg.sender == multiSigWallet, "Only the multiSigWallet can remove Eth.");
        multiSigWallet.call{value:ethAmount}("");
        require(sent, "Transaction failed.");
    }

    // create a function to transfer out founders nfts

    // change the fixedPawthSwapRate
    function toggleFixedSwapTax( bool fixedSwapTaxOn) public {
        require(msg.sender == ownerWallet || msg.sender == multiSigWallet, "Not permitted to change fixed Swap Rate.");
        fixedClaimTax = fixedSwapTaxOn;
    }

    function getCurrentFoundersForPawthRate(uint256 numberOfFoundersToSwap) public view returns(uint256) {

        if (variableSwapRateOn == true) {
        uint256 swapDivider = founders.totalSupply(foundersId).add(founders.balanceOf(address(this),0));

        // calculate the amount of Pawth that they will receive
        uint256 pawthAmountToSwap = numberOfFoundersToSwap.mul(pawth.balanceOf(address(this))).div(swapDivider);

        return pawthAmountToSwap;

        }

        else {
            uint256 pawthAmountToSwap = numberOfFoundersToSwap.mul(pawth.balanceOf(address(this))).div(founders.totalSupply(foundersId));
            return pawthAmountToSwap;
        }
    }

    function getCurrentPawthForFoundersRate(uint256 numberOfFoundersToSwap) public view returns(uint256) {

        if (variableSwapRateOn == true) {
            // calculate the exchange rate of Pawth for a founders
        uint256 amountOfPawthRequired = numberOfFoundersToSwap.mul(pawth.balanceOf(address(this))).mul(pawthClaimTax).div(100).div(founders.totalSupply(foundersId));
        
        return amountOfPawthRequired;
        }
        else {
            
            if(fixedClaimTax == true) {
                uint256 amountOfPawthToSend = numberOfFoundersToSwap.mul(pawth.balanceOf(address(this))).div(founders.totalSupply(foundersId)).mul(pawthClaimTax).div(100);
                return amountOfPawthToSend;
            }
            else {
                uint256 amountOfPawthToSend = numberOfFoundersToSwap.mul(pawth.balanceOf(address(this))).div(founders.totalSupply(foundersId));
                return amountOfPawthToSend;
            }
        }
    }

    function swapFoundersForPawthVariable(uint256 numberOfFoundersToSwap) public {
        // make sure variable swaps are enabled
        require(variableSwapRateOn == true, "Variable swaps are not enabled.");


        // make sure that the msg.sender has enough founders to swap
        uint256 numberOfFoundersHeldBySender = founders.balanceOf(msg.sender,foundersId);

        // require that the sender has enough founders tokens to swap
        require(numberOfFoundersHeldBySender >= numberOfFoundersToSwap, "You don't have enough founders tokens");

        // require that the number of founders entered is greater than 0 and less than 4
        require(numberOfFoundersToSwap >0 && numberOfFoundersToSwap <4, "You can swap more than 0 and less than 4 founders nfts");

        // the amount of pawth that can be withdrawn goes down as the number of nfts in the swap contract increases
        // To do this, the swapDivider variable adds the number of founders NFTs in the contract to the denominator

        uint256 totalSupply = founders.totalSupply(foundersId);

        uint256 swapDivider = totalSupply.add(founders.balanceOf(address(this),foundersId));

        // calculate the amount of Pawth that they will receive
        uint256 pawthAmountToSwap = numberOfFoundersToSwap.mul(pawth.balanceOf(address(this))).div(swapDivider);

        // make sure the pawth contract has enough tokens
        require(pawth.balanceOf(address(this)) >= pawthAmountToSwap,"The swap contract doesn't have enough Pawth");

        // transfer the founders token to the swap contact
        founders.safeTransferFrom(msg.sender,address(this),foundersId,numberOfFoundersToSwap, tokenURIBytes);

        // send the Pawth tokens to the msg.sender
        pawth.transfer(msg.sender,pawthAmountToSwap);

    }

    function swapPawthForFoundersVariable(uint256 numberOfFoundersToClaim) public {

        require(variableSwapRateOn == true, "Variable swaps are not enabled.");
        // get the amount of pawth held by the sender
        uint256 amountOfPawthHeldBySender = pawth.balanceOf(msg.sender);

        // calculate the exchange rate of Pawth for a founders
        uint256 amountOfPawthRequired = numberOfFoundersToClaim.mul(pawth.balanceOf(address(this))).mul(pawthClaimTax).div(100).div(founders.totalSupply(foundersId));

        // make sure the msg.sender has enough pawth
        require(amountOfPawthHeldBySender >= amountOfPawthRequired, "You don't have enough Pawth");

        // make sure the contract has enough founders nfts
        require(founders.balanceOf(address(this),foundersId)>= numberOfFoundersToClaim, "The swap contract does not have enough founders NFTs");

        // make sure the person is trying to claim at least 1 founders nft

        require(numberOfFoundersToClaim >0 && numberOfFoundersToClaim <4, "You can claim more than 0 and less than 4 founders nfts");

        // send the pawth tokens to the swap contract

        pawth.transferFrom(msg.sender,address(this),amountOfPawthRequired);

        // send the founder's nfts to the sender

        founders.safeTransferFrom(address(this),msg.sender, foundersId, numberOfFoundersToClaim, tokenURIBytes);
    }

    function swapFoundersForPawthFixed(uint256 numberOfFoundersToSwap) public {
        require(variableSwapRateOn == false, "Fixed swap rates are not enabled");

        // make sure that the msg.sender has enough founders to swap
        uint256 numberOfFoundersHeldBySender = founders.balanceOf(msg.sender,foundersId);

        // require that the sender has enough founders tokens to swap
        require(numberOfFoundersHeldBySender >= numberOfFoundersToSwap, "You don't have enough founders tokens");

        // require that the number of founders entered is greater than 0
        require(numberOfFoundersToSwap >0 && numberOfFoundersToSwap < 4, "You can swap more than 0 and up to 3 founders nfts");

        // calculate the amount of Pawth to send
        uint256 amountOfPawthToSend = numberOfFoundersToSwap.mul(pawth.balanceOf(address(this))).div(founders.totalSupply(foundersId));

        // make sure the pawth contract has enough tokens
        require(pawth.balanceOf(address(this)) >= amountOfPawthToSend,"The swap contract doesn't have enough Pawth");

        // transfer the founders token to the swap contact
        founders.safeTransferFrom(msg.sender,address(this),foundersId,numberOfFoundersToSwap, tokenURIBytes);

        // send the Pawth tokens to the msg.sender
        pawth.transfer(msg.sender,amountOfPawthToSend);
    
    }

    function swapPawthForFoundersFixed(uint256 numberOfFoundersToClaim) public {

        require(variableSwapRateOn == false, "Fixed swaps are not enabled.");
        // get the amount of pawth held by the sender
        uint256 amountOfPawthHeldBySender = pawth.balanceOf(msg.sender);

        // calculate the amount of Pawth to send
        uint256 amountOfPawthToSend = numberOfFoundersToClaim.mul(pawth.balanceOf(address(this))).div(founders.totalSupply(foundersId));

        // of fixedClaimTax == true, add a tax such that the Pawth contract accumulates Pawth

        if (fixedClaimTax == true) {
            amountOfPawthToSend = amountOfPawthToSend.mul(pawthClaimTax).div(100);
        }

        // make sure the msg.sender has enough pawth
        require(amountOfPawthHeldBySender >= amountOfPawthToSend, "You don't have enough Pawth");

        // make sure the contract has enough founders nfts
        require(founders.balanceOf(address(this),foundersId)>= numberOfFoundersToClaim, "The swap contract does not have enough founders NFTs");

        // make sure the person is trying to claim at least 1 founders nft

        require(numberOfFoundersToClaim > 0 && numberOfFoundersToClaim < 4, "You can swap more than 0 and up to 3 founders nfts");

        // send the pawth tokens to the swap contract

        pawth.transferFrom(msg.sender,address(this),amountOfPawthToSend);

        // send the founder's nfts to the sender

        founders.safeTransferFrom(address(this),msg.sender, foundersId, numberOfFoundersToClaim, tokenURIBytes);
    }

}