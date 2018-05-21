global.artifacts = artifacts;
const deploy = require("./deploy");
const util = require("util");

const MAINNET_NETWORK_ID = 1;

function getNetowrkId(web3) {
  return new Promise((resolve, reject) => {
    web3.version.getNetwork((err, id) => {
      if (err) {
        return reject(err);
      }

      resolve(id);
    });
  });
}

function getAccounts(web3) {
  return new Promise((resolve, reject) => {
    web3.eth.getAccounts((err, accounts) => {
      if (err) {
        return reject(err);
      }

      resolve(accounts);
    });
  });
}

async function deployAndDistributeToken() {
  const accounts = await getAccounts(web3);

  /**
   * CONFIG: Set this constants before deploying the contract.
   */
  const STREAM_COLD_WALLET = accounts[0];
  const STREAM_FROZEN_WALLET = accounts[0];

  const beneficiariesData = [
    {
      address: accounts[0],
      percentage: 10,
      lockupDays: 10,
      vestingDays: 0,
      cliffDays: 0,
      isVestingRevocable: false
    }
  ];

  const networkId = await getNetowrkId(web3);
  if (networkId == MAINNET_NETWORK_ID) {
    const notConfigured =
      accounts.includes(STREAM_FROZEN_WALLET) ||
      accounts.includes(STREAM_COLD_WALLET);

    if (notConfigured) {
      console.error(
        "Edit scripts/truffle-deploy-script.sh to configure it before deploying" +
          " the contract to mainnet."
      );
      return;
    }
  }

  console.log("Deploying token...");

  const token = await deploy.deployToken(STREAM_FROZEN_WALLET);
  console.log("Token address: " + token.address);

  await deploy.distributeTokens(
    token,
    beneficiariesData,
    STREAM_COLD_WALLET,
    STREAM_COLD_WALLET,
    STREAM_FROZEN_WALLET
  );

  console.log("Sending any remaining token to STREAM_COLD_WALLET...");

  const remainingTokens = await token.balanceOf(accounts[0]);
  await token.transfer(STREAM_COLD_WALLET, remainingTokens);

  console.log("Setting token ownership to STREAM_FROZEN_WALLET...");
  await token.transferOwnership(STREAM_FROZEN_WALLET);
}

module.exports = function(callback) {
  deployAndDistributeToken()
    .then(callback)
    .catch(error => {
      console.error(error);
      callback();
    });
};
