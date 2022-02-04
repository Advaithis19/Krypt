// https://eth-ropsten.alchemyapi.io/v2/_8nh49M-mxQ_ZB4ux7jKJq_Gs8qa_kG-

require("@nomiclabs/hardhat-waffle");

module.exports = {
  solidity: "0.8.0",
  networks: {
    ropsten: {
      url: "https://eth-ropsten.alchemyapi.io/v2/_8nh49M-mxQ_ZB4ux7jKJq_Gs8qa_kG-",
      accounts: [
        "f24cc74b9acb91d2a52f6e2ea9867afd47e1dbff513ddb0ee34231dfc6559ad4",
      ],
    },
  },
};
