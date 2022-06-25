export default [
  {
    "inputs": [],
    "name": "getPlatformFeeInfo",
    "outputs": [
      {
        "internalType": "address",
        "name": "platformFeeRecipient",
        "type": "address"
      },
      {
        "internalType": "uint16",
        "name": "platformFeeBps",
        "type": "uint16"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "_platformFeeRecipient",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "_platformFeeBps",
        "type": "uint256"
      }
    ],
    "name": "setPlatformFeeInfo",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];
