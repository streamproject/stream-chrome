const addDays = require("date-fns/add_days");

const STRTokenImplementation = artifacts.require(
  "./token/STRTokenImplementation.sol"
);

const STRTokenProxy = artifacts.require("./token/STRTokenProxy.sol");

const LinearDailyVesting = artifacts.require(
  "./vesting/LinearDailyVesting.sol"
);

const TokenTimelock = artifacts.require(
  "zeppelin-solidity/contracts/token/TokenTimelock.sol"
);

function getUnixTimestimeNDaysInTheFuture(days) {
  return Math.ceil(addDays(new Date(), days).valueOf() / 1000);
}

async function deployToken(proxyAdmin) {
  const token = await STRTokenImplementation.new();
  const proxy = await STRTokenProxy.new(proxyAdmin, token.address);
  const proxiedToken = STRTokenImplementation.at(proxy.address);

  return proxiedToken;
}

async function deployTimelockContract(beneficiary, tokenAddress, lockupDays) {
  return await TokenTimelock.new(
    tokenAddress,
    beneficiary,
    getUnixTimestimeNDaysInTheFuture(lockupDays)
  );
}

async function deployLinearDailyVesting(
  beneficiary,
  tokenAddress,
  lockupDays,
  vestingDays,
  cliffDays,
  revocable,
  revoker,
  revokedTokensDestination,
  revokedTokensDestinationChanger
) {
  return await LinearDailyVesting.new(
    tokenAddress,
    beneficiary,
    getUnixTimestimeNDaysInTheFuture(lockupDays),
    vestingDays,
    cliffDays,
    revocable,
    revoker,
    revokedTokensDestination,
    revokedTokensDestinationChanger
  );
}

async function sendTokensShare(
  token,
  beneficiary,
  amount,
  lockupDays,
  vestingDays,
  cliffDays,
  isVestingRevocable,
  revoker,
  revokedTokensDestination,
  revokedTokensDestinationChanger
) {
  let tokensDestination;

  if (vestingDays > 0) {
    tokensDestination = (await deployLinearDailyVesting(
      beneficiary,
      token.address,
      lockupDays,
      vestingDays,
      cliffDays,
      isVestingRevocable,
      revoker,
      revokedTokensDestination,
      revokedTokensDestinationChanger
    )).address;
  } else if (lockupDays > 0) {
    tokensDestination = (await deployTimelockContract(
      beneficiary,
      token.address,
      lockupDays
    )).address;
  } else {
    tokensDestination = beneficiary;
  }

  await token.transfer(tokensDestination, amount);

  return tokensDestination;
}

/**
 * Distributes the token to all the beneficiaries.
 *
 * beneficiariesData must be an array of object with these keys:
 *  address : string
 *  percentage : number
 *  lockupDays : number
 *  vestingDays : number
 *  cliffDays : number
 *  isVestingRevocable : boolean
 */
async function distributeTokens(
  token,
  beneficiariesData,
  vestingRevoker,
  revokedTokensDestination,
  revokedTokensDestinationChanger
) {
  const totalSupply = await token.totalSupply();

  const totalPercentage = beneficiariesData
    .map(data => data.percentage)
    .reduce((a, b) => a + b, 0);

  if (totalPercentage > 100) {
    throw Error("Invalid sum of percentages (> 100%) of tokens to distribute");
  }

  if (beneficiariesData.find(data => data.percentage <= 0)) {
    throw Error("Invalid percentage (<= 0%) of tokens to distribute");
  }

  const destinations = new Map();

  for (const beneficiaryData of beneficiariesData) {
    const amount = totalSupply.times(beneficiaryData.percentage).divToInt(100);

    const tokensDestination = await sendTokensShare(
      token,
      beneficiaryData.address,
      amount,
      beneficiaryData.lockupDays,
      beneficiaryData.vestingDays,
      beneficiaryData.cliffDays,
      beneficiaryData.isVestingRevocable,
      vestingRevoker,
      revokedTokensDestination,
      revokedTokensDestinationChanger
    );

    // We print this here so it's easier to debug any failure.
    console.log(
      `Sent tokens (${beneficiaryData.percentage}%) of ${beneficiaryData.address} to ${tokensDestination}`
    );

    destinations.set(beneficiaryData.address, tokensDestination);
  }

  return destinations;
}

module.exports = { deployToken, sendTokensShare, distributeTokens };
