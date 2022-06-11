require("@nomiclabs/hardhat-waffle");
require('dotenv').config();
const privateKey = process.env.PRIVATE_KEY;

module.exports = {
  networks: {
    hardhat: {
      chainId: 1337,
      // mining: {
      //   auto: false,
      //   interval: 1000
      // }
    },
    // bscTestnet: {
    //   url: `https://data-seed-prebsc-2-s1.binance.org:8545/`,
    //   accounts: [`${privateKey}`]
    // }
  },
  solidity: {
    compilers: [
      {
        version: "0.8.1",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200
          }
        }
      }
    ]
  }
}