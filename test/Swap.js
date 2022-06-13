// We import Chai to use its asserting functions here.
const { expect } = require("chai","chai-string");

const { ethers, waffle } = require("hardhat");

// `describe` is a Mocha function that allows you to organize your tests. It's
// not actually needed, but having your tests organized makes debugging them
// easier. All Mocha functions are available in the global scope.

// `describe` receives the name of a section of your test suite, and a callback.
// The callback must define the tests of that section. This callback can't be
// an async function.
describe("NFT Swapper contract", function () {
  // Mocha has four functions that let you hook into the test runner's
  // lifecyle. These are: `before`, `beforeEach`, `after`, `afterEach`.

  // They're very useful to setup the environment for tests, and to clean it
  // up after they run.

  // A common pattern is to declare some variables, and assign them in the
  // `before` and `beforeEach` callbacks.

  const tenMillionTokens = "10000000000000000";
  const nftName = "Founder's Club";
  const symbol = "PAWTHFOUNDER";
  const contractURI = "ipfs://QmZ8pkryYBhbLNkmE52SvoHMbsCrcehvoSSaT2gnCXhxjA/0";
  

  let ErcContract;
  let erc;
  let NftContract;
  let nft;
  let SwapContract;
  let MainnetNFT;
  let mainnetnft;
  let swap;
  let addr1;
  let addr2;
  let addrs;
  let primarySaleRecipient;
  let royaltyRecipient;
  let royaltyBps;
  let platformFeeBps;
  let platformFeeRecipient;
  let i =0;
  // `beforeEach` will run before each test, re-deploying the contract every
  // time. It receives a callback, which can be async.
  beforeEach(async function () {
    // Get the ContractFactory and Signers here.
    ErcContract = await ethers.getContractFactory("contracts/ERC.sol:ERC");
    NftContract = await ethers.getContractFactory("contracts/NFT.sol:NFT");
    SwapContract = await ethers.getContractFactory("contracts/Swap.sol:Swap");
    MainnetNFT = await ethers.getContractFactory("contracts/MainnetNFT.sol:MainnetNFT");
    // addresses
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
    // initialize some variables for the initializer function (basically a second constructor in the contract)
    
    primarySaleRecipient = owner.address;
    royaltyRecipient = owner.address;
    royaltyBps = 250;
    platformFeeBps = 0;
    platformFeeRecipient = owner.address;
    // deploy contracts
    erc = await ErcContract.deploy();
    nft = await NftContract.deploy(addr1.address, addr2.address);
    swap = await SwapContract.deploy(nft.address, erc.address);
    mainnetnft = await MainnetNFT.deploy(owner.address, owner.address,
       nftName, symbol, contractURI, [owner.address],
       owner.address,owner.address,250,0,owner.address);

    // give the swap contract 10M tokens
    await erc.transfer(swap.address, tenMillionTokens)
  });

  describe("Deployment", function () {
    it("Should give the ERC20 an address", async function() {
      expect(erc.address).to.not.be.null;
    });

    it("Should set the right owner", async function () {
      const ownerWallet = "0x8E6a9e6F141BF9bd5A9a4318aD5458D1ad312939";
      expect(await swap.ownerWallet()).to.equal(ownerWallet);
    });
    
    it("Should give mainnet nft a symbol", async function () {
      nftSymbol = await mainnetnft.symbol();
      console.log("mainnet nft symbol is ", nftSymbol);
      expect(nftSymbol).to.equal(symbol);

    });
    it("Should have the right contract URI", async function () {
      URI = await mainnetnft.contractURI();
      console.log("mainnet nft uri is ", URI);
      expect(URI).to.equal(contractURI);

    })
  })

  describe("Variable swap", function () {
    it("Should allow a user to swap nfts for tokens", async function () {
      const ercBalanceBefore = await erc.balanceOf(addr2.address);
      expect(Number(ercBalanceBefore)).to.equal(0);
      await nft.connect(addr2).setApprovalForAll(swap.address,"true");
      await swap.connect(addr2).swapFoundersForPawthVariable(1);
      const ercBalanceAfter = await erc.balanceOf(addr2.address);
      expect(Number(ercBalanceAfter)).to.be.greaterThan(Number(ercBalanceBefore));
    });

    it("Should swap NFT for less tokens on subsequent swaps", async function () {
      // address 1 swaps nft for tokens
      await nft.connect(addr1).setApprovalForAll(swap.address,"true");
      await swap.connect(addr1).swapFoundersForPawthVariable(1);
      const ercAddr1BalanceAfter = await erc.balanceOf(addr1.address);

      console.log("Hello, ", ercAddr1BalanceAfter)


      // address 2 swaps nft for tokens
      await nft.connect(addr2).setApprovalForAll(swap.address,"true");
      await swap.connect(addr2).swapFoundersForPawthVariable(1);
      const ercAddr2BalanceAfter = await erc.balanceOf(addr2.address);

      // address 1 has more tokens than address 2
      expect(Number(ercAddr1BalanceAfter)).to.be.greaterThan(Number(ercAddr2BalanceAfter));
    });
  })
});
