const ERC = artifacts.require("ERC");
const NFT = artifacts.require("NFT");
const Swap = artifacts.require("Swap");
module.exports = async function(deployer) {

 account_1 = "0xD08e1a16AFAb00691E8DA603546Baf50eE35B3ee";

 account_2 = "0x8E6a9e6F141BF9bd5A9a4318aD5458D1ad312939";

 await deployer.deploy(ERC);

 erc = await ERC.deployed();

 console.log("My contract address is ",erc.address)

 // Check the balance of account 1

 account1Balance = await erc.balanceOf(account_1);

 console.log("Account 1's initial balance is", account1Balance.toString())

 // Check the inital balance of account 2

account2Balance = await erc.balanceOf(account_2);

console.log("Account 2's initial balance is ", account2Balance.toString())


 // check the total supply

 totalSupply = await erc.totalSupply();

 console.log("The erc20 has a total supply of ", totalSupply.toString())

 // transfer about 1000 tokens to account 2 and then check balances again

 one_million_tokens = "1000000000000000"

 // send 5 million tokens to the swap contract

five_million_tokens = "5000000000000000"

 await erc.transfer(account_2, five_million_tokens)

 // Test your ERC 1155 contract

await deployer.deploy(NFT)

nft = await NFT.deployed()

// deploy the swap contract

await deployer.deploy(Swap, nft.address, erc.address)

swap = await Swap.deployed()



await erc.transfer(swap.address,five_million_tokens, {"from":account_1})

console.log("transfer successful")

// send a founder's nft to the swap contract

swapPawthBalance1 = await erc.balanceOf(swap.address)

console.log("The balance of the swap contract prior to the swap is ", swapPawthBalance1.toString())

// approve the swap contract for the transfer

await nft.setApprovalForAll(swap.address,"true", {"from":account_2})

// perform the swap

await swap.swapFoundersForPawthVariable(1,{"from":account_2})
await swap.swapFoundersForPawthVariable(1,{"from":account_2})
await swap.swapFoundersForPawthVariable(1,{"from":account_2})
await swap.swapFoundersForPawthVariable(1,{"from":account_2})
await swap.swapFoundersForPawthVariable(1,{"from":account_2})


swapPawthBalance2 = await erc.balanceOf(swap.address)

console.log("The pawth balance of the swap after 5 swaps is", swapPawthBalance2.toString())

// make sure that account 2 has 3 nfts of id 0 after that swap

account_2_nft_balance1 = await nft.balanceOf(account_2,0)

// console.log("Account 2 should have 3 tokens of id 0. It has ", account_2_nft_balance1.toString())

// make sure that the swap contract has 2 nfts of id 0 after that swap

swap_nft_balance1 = await nft.balanceOf(swap.address,0)

// console.log("Account 2 should have 2 tokens of id 0. It has ", swap_nft_balance1.toString())

// Now, swap in the other direction (Pawth for 1 founders NFT)

// first, approve the contract to take your pawth
await erc.approve(swap.address, five_million_tokens, {"from": account_2})

// next, perform the swap from pawth to a founders

await swap.swapPawthForFoundersVariable(1, {"from": account_2})
await swap.swapPawthForFoundersVariable(1, {"from": account_2})
await swap.swapPawthForFoundersVariable(1, {"from": account_2})
await swap.swapPawthForFoundersVariable(1, {"from": account_2})
await swap.swapPawthForFoundersVariable(1, {"from": account_2})
// check the pawth balance of the founders contract (it should be close to 5 million again)

swapPawthBalance3 = await erc.balanceOf(swap.address)

console.log("The pawth balance after 5 swaps the other way is", swapPawthBalance3.toString())

// check the nft balance of the founders contract (it should be 01)

swap_nft_balance2 = await nft.balanceOf(swap.address,0)

//console.log("The new nft balance should be 0. It is ", swap_nft_balance2.toString())



// perform the swap

await swap.swapFoundersForPawthVariable(1,{"from":account_2})
await swap.swapFoundersForPawthVariable(1,{"from":account_2})
await swap.swapFoundersForPawthVariable(1,{"from":account_2})
await swap.swapFoundersForPawthVariable(1,{"from":account_2})
await swap.swapFoundersForPawthVariable(1,{"from":account_2})


swapPawthBalance2 = await erc.balanceOf(swap.address)

console.log("The pawth balance of the swap after 5 swaps is", swapPawthBalance2.toString())

// first, approve the contract to take your pawth
await erc.approve(swap.address, five_million_tokens, {"from": account_2})

// next, perform the swap from pawth to a founders

await swap.swapPawthForFoundersVariable(1, {"from": account_2})
await swap.swapPawthForFoundersVariable(1, {"from": account_2})
await swap.swapPawthForFoundersVariable(1, {"from": account_2})
await swap.swapPawthForFoundersVariable(1, {"from": account_2})
await swap.swapPawthForFoundersVariable(1, {"from": account_2})
// check the pawth balance of the founders contract (it should be close to 5 million again)

swapPawthBalance3 = await erc.balanceOf(swap.address)

console.log("The pawth balance after 5 swaps the other way is", swapPawthBalance3.toString())

// toggle the swap type

await swap.toggleSwapType(false,{"from":account_2})

// perform the swap

await swap.swapFoundersForPawthFixed(1,{"from":account_2})
await swap.swapFoundersForPawthFixed(1,{"from":account_2})
await swap.swapFoundersForPawthFixed(1,{"from":account_2})
await swap.swapFoundersForPawthFixed(1,{"from":account_2})
await swap.swapFoundersForPawthFixed(1,{"from":account_2})


swapPawthBalance2 = await erc.balanceOf(swap.address)

console.log("The pawth balance of the swap after 5 fixed swaps is", swapPawthBalance2.toString())

// next, perform the swap from pawth to a founders

await swap.swapPawthForFoundersFixed(1, {"from": account_2})
await swap.swapPawthForFoundersFixed(1, {"from": account_2})
await swap.swapPawthForFoundersFixed(1, {"from": account_2})
await swap.swapPawthForFoundersFixed(1, {"from": account_2})
await swap.swapPawthForFoundersFixed(1, {"from": account_2})
// check the pawth balance of the founders contract (it should be close to 5 million again)

swapPawthBalance3 = await erc.balanceOf(swap.address)

console.log("The pawth balance after 5 swaps the other way is", swapPawthBalance3.toString())

exchangeRateFor3PawthForFoundersSwaps = await swap.getCurrentPawthForFoundersRate(3)

console.log("3 founders nfts will cost you ", exchangeRateFor3PawthForFoundersSwaps.toString(), " pawth")

exchangeRateFor3FoundersForPawthSwaps = await swap.getCurrentFoundersForPawthRate(3)

console.log("3 founders nfts will be exchanged for ", exchangeRateFor3FoundersForPawthSwaps.toString(), " pawth")
};