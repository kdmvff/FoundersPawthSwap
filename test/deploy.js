const hre = require("hardhat");

const multSigAddress = "0x16b1db77b60c8d8b6ecea0fa4e0481e9f53c9ba1"
const ownerWallet = "0x4ADb500025fFe164d7BB2845b669513056b9E6a4"
const pawthContract = "0xAEcc217a749c2405b5ebC9857a16d58Bdc1c367F"
const foundersContract = "0xA9480E2e4bA1Caf3D67e98FeB96e57Caf5Ca7768"

const nftName = "Founder's Club";
const symbol = "PAWTHFOUNDER";
const contractURI = "ipfs://QmZ8pkryYBhbLNkmE52SvoHMbsCrcehvoSSaT2gnCXhxjA/0";
const tenMillionTokens = "10000000000000000";

async function main() {
    const SwapContract = await hre.ethers.getContractFactory("contracts/Swap.sol:Swap")
    const Founders = await hre.ethers.getContractFactory("contracts/NFT.sol:NFT")
    const Pawth = await hre.ethers.getContractFactory("contracts/MainnetERC.sol:ERC")
    owner = await hre.ethers.getSigners();
    erc = await Pawth.deploy()

    await erc.deployed();

    founders = await Founders.deploy()

    await founders.deployed()

    swap = await SwapContract.deploy(founders.address, erc.address);

    await swap.deployed();
    console.log("nft contract deployed to :", founders.address)
    console.log("erc contract deployed to :", erc.address)
    console.log("swap contract deployed to :", swap.address)

    // give the swap contract 10M tokens
    await erc.transfer(swap.address, tenMillionTokens)


    // create the commands for verifying the contracts
    // swap verification command
    console.log(" npx hardhat verify --contract contracts/Swap.sol:Swap --network rinkeby ", swap.address, " ", founders.address, " ", erc.address)
    
    // erc verification command
    console.log("npx hardhat verify --contract contracts/MainnetERC.sol:ERC --network rinkeby ", erc.address)
  
    // mainnet verification command

    console.log("npx hardhat verify --contract contracts/NFT.sol:NFT --network rinkeby ", founders.address)
  }

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });