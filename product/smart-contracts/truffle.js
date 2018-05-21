const HDWalletProvider = require("truffle-hdwallet-provider");

const MNEMONIC = process.env.MNEMONIC;
const INFURA_ACCESS_TOKEN = process.env.INFURA_ACCESS_TOKEN;

module.exports = {
  networks: {
    deploymentNode: {
      host: "localhost",
      port: 8545,
      network_id: "*" // Match any network id
    },
    ropsten: {
      provider: new HDWalletProvider(MNEMONIC, `https://ropsten.infura.io/${INFURA_ACCESS_TOKEN}`),
      network_id: 3,
    }
  }
};
