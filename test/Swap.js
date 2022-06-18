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
      const ownerWallet = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";
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
    it("Should allow a user to do variable swaps in either direction", async function () {

      // prior to the swap, address 2 should have 0 Pawth      
      const ercBalanceBefore = await erc.balanceOf(addr2.address);
      expect(Number(ercBalanceBefore)).to.equal(0);
      await nft.connect(addr2).setApprovalForAll(swap.address,"true");

      // get the current rate for swapping founders for pawth
      const pawthThatSwapperWillReceive = await swap.connect(addr2).getCurrentFoundersForPawthRate(2);

      await swap.connect(addr2).swapFoundersForPawthVariable(2);
      const ercBalanceAfter = await erc.balanceOf(addr2.address);

      // check to make sure that address 2's pawth balance increased

      expect(Number(ercBalanceAfter)).to.be.greaterThan(Number(ercBalanceBefore));

      // did address 2's pawth balance increase by the correct amount
      const amountSwapped1 = ercBalanceAfter - ercBalanceBefore
      expect(Number(amountSwapped1)).to.be.equal(pawthThatSwapperWillReceive)

      // swap contract should now have 2 founders
      const swapNFTBalance1 = await nft.balanceOf(swap.address,0);
      expect(Number(swapNFTBalance1)).to.be.equal(2);
      console.log("address 2 balance after first swap is ",ercBalanceAfter.toString())

      // swap contract should be able to go the other way
      // give address 2 enough tokens to swap
      await erc.transfer(addr2.address, tenMillionTokens)
      await erc.connect(addr2).approve(swap.address,tenMillionTokens)


      // swap contract should be able to tell us how much pawth is needed to swap
      const pawthNeededToSwapOneFounders = await swap.connect(addr2).getCurrentPawthForFoundersRate(2);
      console.log("The current Pawth for Founders rate is ", pawthNeededToSwapOneFounders.toString())

      // get the balance of address 2 prior to the swap
      const ercBalanceBefore2 = await erc.balanceOf(addr2.address)

      await swap.connect(addr2).swapPawthForFoundersVariable(2);

      const ercBalanceAfter2 = await erc.balanceOf(addr2.address)

      // get the difference between these two numbers. it should equal the quote from the read only function
      // for some reason, the number is off by 0.000000001 tokens (the smallest possible diff). probably difference between safemath and javascript
      const amountSwapped2 = ercBalanceBefore2 - ercBalanceAfter2 

      expect(Number(pawthNeededToSwapOneFounders)).to.be.equal(amountSwapped2)

      // swap contract should now have 0 NFTs
      const swapNFTBalance2 = await nft.balanceOf(swap.address, 0);
      console.log("The swap contract now has 0 nfts")
      expect(Number(swapNFTBalance2)).to.be.equal(0);

      // check the swap pawth balance. It should have increased above 10 million tokens
      
      const swapPawthBalance = await erc.balanceOf(swap.address)

      console.log("Swap balance should be greater than 10 million tokens. it has ", swapPawthBalance.toString())

    });


    it("Should swap NFT for less tokens on subsequent swaps", async function () {
      // address 1 swaps nft for tokens
      await nft.connect(addr1).setApprovalForAll(swap.address,"true");
      await swap.connect(addr1).swapFoundersForPawthVariable(1);
      const ercAddr1BalanceAfter = await erc.balanceOf(addr1.address);

      console.log("Address 1's ", ercAddr1BalanceAfter)


      // address 2 swaps nft for tokens
      await nft.connect(addr2).setApprovalForAll(swap.address,"true");
      await swap.connect(addr2).swapFoundersForPawthVariable(1);
      const ercAddr2BalanceAfter = await erc.balanceOf(addr2.address);

      // address 1 has more tokens than address 2
      expect(Number(ercAddr1BalanceAfter)).to.be.greaterThan(Number(ercAddr2BalanceAfter));
    });
  })

  describe("Fixed swap", function () {
    it("Should allow a user to do fixed swaps in either direction", async function () {
      // set fixed swaps to true
      await swap.connect(owner).toggleFixedSwapTax(true)

      // toggle the swap type
      await swap.connect(owner).toggleSwapType(false)

      // prior to the swap, address 2 should have 0 Pawth      
      const ercBalanceBefore = await erc.balanceOf(addr2.address);
      expect(Number(ercBalanceBefore)).to.equal(0);
      await nft.connect(addr2).setApprovalForAll(swap.address,"true");
      await swap.connect(addr2).swapFoundersForPawthFixed(2);
      const ercBalanceAfter = await erc.balanceOf(addr2.address);
      expect(Number(ercBalanceAfter)).to.be.greaterThan(Number(ercBalanceBefore));

      // swap contract should now have 1 founders
      const swapNFTBalance1 = await nft.balanceOf(swap.address,0);
      expect(Number(swapNFTBalance1)).to.be.equal(2);
      console.log("address 2 balance after first swap is ",ercBalanceAfter.toString())
      // swap contract should be able to go the other way
      // give address 2 enough tokens to swap
      await erc.transfer(addr2.address, tenMillionTokens)
      await erc.connect(addr2).approve(swap.address,tenMillionTokens)


      // swap contract should be able to tell us how much pawth is needed to swap
      pawthNeededToSwapOneFounders = await swap.connect(addr2).getCurrentPawthForFoundersRate(2);
      console.log("The current Pawth for Founders rate is ", pawthNeededToSwapOneFounders.toString())


      await swap.connect(addr2).swapPawthForFoundersFixed(2);

      // swap contract should now have 0 NFTs
      const swapNFTBalance2 = await nft.balanceOf(swap.address, 0);
      expect(Number(swapNFTBalance2)).to.be.equal(0);

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

  describe("Fixed swap", function () {
    it("Should allow a user to do fixed swaps in either direction", async function () {
      // set fixed swaps to true
      await swap.connect(owner).toggleFixedSwapTax(true)

      // toggle the swap type
      await swap.connect(owner).toggleSwapType(false)

      // prior to the swap, address 2 should have 0 Pawth      
      const ercBalanceBefore = await erc.balanceOf(addr2.address);
      expect(Number(ercBalanceBefore)).to.equal(0);
      await nft.connect(addr2).setApprovalForAll(swap.address,"true");
      await swap.connect(addr2).swapFoundersForPawthFixed(2);
      const ercBalanceAfter = await erc.balanceOf(addr2.address);
      expect(Number(ercBalanceAfter)).to.be.greaterThan(Number(ercBalanceBefore));

      // swap contract should now have 1 founders
      const swapNFTBalance1 = await nft.balanceOf(swap.address,0);
      expect(Number(swapNFTBalance1)).to.be.equal(2);
      console.log("address 2 balance after first swap is ",ercBalanceAfter.toString())
      // swap contract should be able to go the other way
      // give address 2 enough tokens to swap
      await erc.transfer(addr2.address, tenMillionTokens)
      await erc.connect(addr2).approve(swap.address,tenMillionTokens)


      // swap contract should be able to tell us how much pawth is needed to swap
      pawthNeededToSwapOneFounders = await swap.connect(addr2).getCurrentPawthForFoundersRate(2);
      console.log("The current Pawth for Founders rate is ", pawthNeededToSwapOneFounders.toString())


      await swap.connect(addr2).swapPawthForFoundersFixed(2);

      // swap contract should now have 0 NFTs
      const swapNFTBalance2 = await nft.balanceOf(swap.address, 0);
      expect(Number(swapNFTBalance2)).to.be.equal(0);

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

  describe("Direct withdrawals to multisig", function () {
    it("Should allow the ownerwallet and multisig to transfer", async function () {
        // first give the swap contract some Pawth and founders to withdrawal
        await erc.connect(owner).transfer(swap.address, tenMillionTokens)
        await nft.connect(addr1).setApprovalForAll(swap.address,"true");
        await swap.connect(addr1).swapFoundersForPawthVariable(3);
        await swap.connect(addr1).swapFoundersForPawthVariable(2);
        const swapFoundersAmount = await nft.balanceOf(swap.address,0)

        // swap contract should have 3 nfts
        expect(swapFoundersAmount).to.be.equal(5)

        // swap contract should have pawth
        const swapPawthBalance2 = await erc.balanceOf(swap.address)
        console.log("The swap balance is ",swapPawthBalance2)

        // transfer some pawth to the multisig

        await swap.connect(owner).transferPawthOut(tenMillionTokens)

        const swapPawthBalance3 = await erc.balanceOf(swap.address)

        console.log("after transferring out Pawth, the new swap balance is ", swapPawthBalance3)

        // check the multisig's pawth balance. It should be 10 million

        const multiSigPawthBalance = await erc.balanceOf(addr1.address)

        console.log("MultiSigWallet should have more than 10 million tokens. it has ", multiSigPawthBalance)

        // send founders nfts to the multisig

        await swap.connect(owner).transferFoundersOut(5)

        const swapFoundersAmount2 = await nft.balanceOf(swap.address,0)

        expect(swapFoundersAmount2).to.be.equal(0);

        const multiSigFoundersBalance = await nft.balanceOf(addr1.address,0)

        expect(multiSigFoundersBalance).to.be.equal(5)

        // // check the eth balance of address 1

        // const swapEthBalanceBefore = await waffle.provider.getBalance(swap.address)

        // const myEther = ethers.utils.parseEther("1")

        // console.log("Ether amount is ", myEther)

        // await owner.sendTransaction({to: swap.address, value: myEther})

        // console.log("Swap eth balance of multisig before transfer out is ", swapEthBalanceBefore)

        // await swap.connect(addr1).transferEthOut(true,"10000000000000000000000000000000")

        // const ethBalanceAfter = await waffle.provider.getBalance(addr1.address)

        // console.log("Eth balance of multisig after transfer out is ", ethBalanceAfter)
    });


  })
  
});
