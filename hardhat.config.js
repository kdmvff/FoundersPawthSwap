require("@nomiclabs/hardhat-waffle");
require('dotenv').config();
require("@nomiclabs/hardhat-etherscan");
require('@symblox/hardhat-abi-gen');
const secret =require("./secret.json")

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
    // },
    rinkeby: {
      url: secret.rinkebyUrl,
      accounts: [secret.key]
    },
    
  },
  etherscan: {
    apiKey: "XZUPHA25SS23BSDVQZTAGJ1WASF7ANFITZ"
  },
  abiExporter: {
    path: './data/abi',
    clear: true,
    flat: true,
    only: [],
    spacing: 2
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
      },
      // replace this with the version of solidity that you need
      {
        version: "0.8.11",
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