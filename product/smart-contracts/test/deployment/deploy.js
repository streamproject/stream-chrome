const addDays = require("date-fns/add_days");
const time = require("../helpers/time");
const deploy = require("../../scripts/deploy");

("use strict");

const BigNumber = web3.BigNumber;

require("chai")
  .use(require("chai-as-promised"))
  .use(require("chai-bignumber")(BigNumber))
  .should();

const STRTokenProxy = artifacts.require("./token/STRTokenProxy.sol");

const LinearDailyVesting = artifacts.require(
  "./vesting/LinearDailyVesting.sol"
);

const TokenTimelock = artifacts.require(
  "zeppelin-solidity/contracts/token/TokenTimelock.sol"
);

const TOTAL_SUPPLY = new BigNumber("10000000000").mul(1e18);

contract(
  "Deployment script",
  (
    [deployerAccount, tokenAdminAccount, coldWalletAccount, ...beneficiaries]
  ) => {
    describe("Token deploy", () => {
      it("Should assign everything correctly", async () => {
        const token = await deploy.deployToken(tokenAdminAccount);

        assert.equal(await token.owner(), deployerAccount);
        (await token.totalSupply()).should.be.bignumber.equal(TOTAL_SUPPLY);
        (await token.balanceOf(deployerAccount)).should.be.bignumber.equal(
          TOTAL_SUPPLY
        );

        const proxy = STRTokenProxy.at(token.address);
        assert.equal(await proxy.admin(), tokenAdminAccount);
      });
    });

    describe("Tokens distribution", () => {
      let token;

      beforeEach(async () => {
        token = await deploy.deployToken(tokenAdminAccount);
      });

      describe("Locked up tokens", () => {
        const beneficiary = beneficiaries[0];
        const amount = 123123123;
        const lockupDays = 123;
        let tokensDestination;
        let nowPlusLockupDaysInSeconds;

        beforeEach(async () => {
          nowPlusLockupDaysInSeconds =
            (await time.getLatestBlockTime()) + lockupDays * 3600 * 24;

          tokensDestination = await deploy.sendTokensShare(
            token,
            beneficiary,
            amount,
            lockupDays,
            0,
            0,
            false,
            "0x0",
            "0x0"
          );
        });

        it("Should deploy a TokenTimelock contract correctly", async () => {
          tokensDestination.should.be.not.equal(beneficiary);
          const lock = TokenTimelock.at(tokensDestination);

          assert.equal(await lock.beneficiary(), beneficiary);
          assert.equal(await lock.token(), token.address);
          (await lock.releaseTime()).should.be.bignumber.gte(
            nowPlusLockupDaysInSeconds - 10
          );
          (await lock.releaseTime()).should.be.bignumber.lte(
            nowPlusLockupDaysInSeconds + 10
          );
        });

        it("Should send the right amount of tokens", async () => {
          (await token.balanceOf(tokensDestination)).should.be.bignumber.equal(
            amount
          );
        });
      });

      describe("Tokens with vesting", () => {
        const beneficiary = beneficiaries[0];
        const amount = 1231123;
        const lockupDays = 13;
        const vestingDays = 2345;
        const cliffDays = 29;
        const isVestingRevocable = true;
        const revoker = beneficiaries[1];
        const revokedTokensDestination = beneficiaries[2];
        const revokedTokensDestinationChanger = beneficiaries[3];

        let tokensDestination;
        let nowPlusLockupDaysInSeconds;

        beforeEach(async () => {
          nowPlusLockupDaysInSeconds =
            (await time.getLatestBlockTime()) + lockupDays * 3600 * 24;

          tokensDestination = await deploy.sendTokensShare(
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
          );
        });

        it("Should deploy a LinearDailyVesting contract correctly", async () => {
          tokensDestination.should.be.not.equal(beneficiary);
          const vesting = LinearDailyVesting.at(tokensDestination);

          assert.equal(await vesting.beneficiary(), beneficiary);
          assert.equal(await vesting.token(), token.address);

          (await vesting.vestingStart()).should.be.bignumber.gte(
            nowPlusLockupDaysInSeconds - 10
          );
          (await vesting.vestingStart()).should.be.bignumber.lte(
            nowPlusLockupDaysInSeconds + 10
          );

          (await vesting.vestingDays()).should.be.bignumber.equal(vestingDays);
          (await vesting.cliffDays()).should.be.bignumber.equal(cliffDays);
          assert.equal(await vesting.revoker(), revoker);
          assert.equal(
            await vesting.revokedTokensDestination(),
            revokedTokensDestination
          );
          assert.equal(
            await vesting.revokedTokensDestinationChanger(),
            revokedTokensDestinationChanger
          );

          (await vesting.revokedTokens()).should.be.bignumber.equal(0);
          (await vesting.relasedTokens()).should.be.bignumber.equal(0);
          assert.equal(await vesting.revoked(), false);
        });

        it("Should send the right amount of tokens", async () => {
          (await token.balanceOf(tokensDestination)).should.be.bignumber.equal(
            amount
          );
        });
      });

      describe("Tokens without vesting nor lockup", () => {
        it("Should send the right amount of tokens directly to the beneficiary", async () => {
          const beneficiary = beneficiaries[0];
          const amount = 1231123;

          const tokensDestination = await deploy.sendTokensShare(
            token,
            beneficiary,
            amount,
            0,
            0,
            0,
            false,
            "0x0",
            "0x0",
            "0x0"
          );

          assert.equal(tokensDestination, beneficiary);
          (await token.balanceOf(tokensDestination)).should.be.bignumber.equal(
            amount
          );
        });
      });

      describe("Multiple benifeciaries distribution", () => {
        const revoker = beneficiaries[3];
        const revokedTokensDestination = beneficiaries[4];
        const revokedTokensDestinationChanger = beneficiaries[5];

        it("Shouldn't accept % <= 0", async () => {
          (() => {
            deploy.distributeTokens(
              token,
              [
                {
                  address: beneficiaries[0],
                  percentage: 0,
                  lockupDays: 0,
                  vestingDays: 0,
                  cliffDays: 0,
                  isVestingRevocable: false
                }
              ],
              revoker,
              revokedTokensDestination,
              revokedTokensDestinationChanger
            );
          }).should.throw;

          (() => {
            deploy.distributeTokens(
              token,
              [
                {
                  address: beneficiaries[0],
                  percentage: -1,
                  lockupDays: 0,
                  vestingDays: 0,
                  cliffDays: 0,
                  isVestingRevocable: false
                }
              ],
              revoker,
              revokedTokensDestination,
              revokedTokensDestinationChanger
            );
          }).should.throw;
        });

        it("Shouldn't accept a total % > 100", async () => {
          (() => {
            deploy.distributeTokens(
              token,
              [
                {
                  address: beneficiaries[0],
                  percentage: 50,
                  lockupDays: 0,
                  vestingDays: 0,
                  cliffDays: 0,
                  isVestingRevocable: false
                },
                {
                  address: beneficiaries[1],
                  percentage: 51,
                  lockupDays: 0,
                  vestingDays: 0,
                  cliffDays: 0,
                  isVestingRevocable: false
                }
              ],
              revoker,
              revokedTokensDestination,
              revokedTokensDestinationChanger
            );
          }).should.throw;
        });

        const beneficiariesData = [
          {
            address: beneficiaries[0],
            percentage: 10,
            lockupDays: 10,
            vestingDays: 0,
            cliffDays: 0,
            isVestingRevocable: false
          },
          {
            address: beneficiaries[1],
            percentage: 20,
            lockupDays: 0,
            vestingDays: 10,
            cliffDays: 0,
            isVestingRevocable: false
          },
          {
            address: beneficiaries[2],
            percentage: 30,
            lockupDays: 0,
            vestingDays: 0,
            cliffDays: 0,
            isVestingRevocable: false
          }
        ];

        it("Should send the right amount of tokens to each benefeciary", async () => {
          const tokenDestinations = await deploy.distributeTokens(
            token,
            beneficiariesData,
            revoker,
            revokedTokensDestination,
            revokedTokensDestinationChanger
          );

          const totalSupply = await token.totalSupply();

          (await token.balanceOf(
            tokenDestinations.get(beneficiariesData[0].address)
          )).should.be.bignumber.equal(
            totalSupply.times(beneficiariesData[0].percentage).divToInt(100)
          );

          (await token.balanceOf(
            tokenDestinations.get(beneficiariesData[1].address)
          )).should.be.bignumber.equal(
            totalSupply.times(beneficiariesData[1].percentage).divToInt(100)
          );

          (await token.balanceOf(
            tokenDestinations.get(beneficiariesData[2].address)
          )).should.be.bignumber.equal(
            totalSupply.times(beneficiariesData[2].percentage).divToInt(100)
          );
        });

        it("Should keep the rest of the tokens on the deployer account", async () => {
          await deploy.distributeTokens(
            token,
            beneficiariesData,
            revoker,
            revokedTokensDestination,
            revokedTokensDestinationChanger
          );

          const totalSupply = await token.totalSupply();

          const percentageDistributed = beneficiariesData
            .map(d => d.percentage)
            .reduce((a, b) => a + b, 0);

          (await token.balanceOf(deployerAccount)).should.be.bignumber.equal(
            totalSupply.times(100 - percentageDistributed).divToInt(100)
          );
        });

        it("Should choose between TokenTimelock, LinearDailyVesting or no contract correctly", async () => {
          const tokenDestinations = await deploy.distributeTokens(
            token,
            beneficiariesData,
            revoker,
            revokedTokensDestination,
            revokedTokensDestinationChanger
          );

          const totalSupply = await token.totalSupply();

          assert.notEqual(
            tokenDestinations.get(beneficiariesData[0].address),
            beneficiariesData[0].address
          );
          assert.notEqual(
            tokenDestinations.get(beneficiariesData[1].address),
            beneficiariesData[1].address
          );
          assert.equal(
            tokenDestinations.get(beneficiariesData[2].address),
            beneficiariesData[2].address
          );

          // The first one should receive a TokenTimelock contract
          const lock = TokenTimelock.at(
            tokenDestinations.get(beneficiariesData[0].address)
          );

          assert.equal(await lock.beneficiary(), beneficiariesData[0].address);
          assert.equal(await lock.token(), token.address);

          // The second one a LinearDailyVesting contract
          const vesting = LinearDailyVesting.at(
            tokenDestinations.get(beneficiariesData[1].address)
          );

          assert.equal(
            await vesting.beneficiary(),
            beneficiariesData[1].address
          );
          assert.equal(await vesting.token(), token.address);

          (await vesting.vestingDays()).should.be.bignumber.equal(
            beneficiariesData[1].vestingDays
          );
          (await vesting.cliffDays()).should.be.bignumber.equal(
            beneficiariesData[1].cliffDays
          );
          assert.equal(await vesting.revoker(), revoker);
          assert.equal(
            await vesting.revokedTokensDestination(),
            revokedTokensDestination
          );
          assert.equal(
            await vesting.revokedTokensDestinationChanger(),
            revokedTokensDestinationChanger
          );

          (await vesting.revokedTokens()).should.be.bignumber.equal(0);
          (await vesting.relasedTokens()).should.be.bignumber.equal(0);
          assert.equal(
            await vesting.revoked(),
            beneficiariesData[1].isVestingRevocable
          );
        });
      });
    });
  }
);
