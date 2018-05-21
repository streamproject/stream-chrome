"use strict";

const BigNumber = web3.BigNumber;

require("chai")
  .use(require("chai-as-promised"))
  .use(require("chai-bignumber")(BigNumber))
  .should();

const time = require("../helpers/time");

const LinearDailyVesting = artifacts.require(
  "../../contracts/vesting/LinearDailyVesting.sol"
);
const STRToken = artifacts.require("../../contracts/token/STRToken.sol");
const STRTokenImplementation = artifacts.require(
  "../../contracts/token/STRTokenImplementation.sol"
);
const STRTokenProxy = artifacts.require(
  "../../contracts/token/STRTokenProxy.sol"
);

async function assertTokenBalanceEqualsTo(token, address, expectedValue) {
  const balance = await token.balanceOf(address);
  balance.should.be.bignumber.equal(expectedValue);
}

async function assertTotalTokensEqualsTo(vesting, expectedValue) {
  const totalTokens = await vesting.totalTokens();
  totalTokens.should.be.bignumber.equal(expectedValue);
}

async function assertLockedTokensEqualsTo(vesting, expectedValue) {
  const lockedTokens = await vesting.lockedTokens();
  lockedTokens.should.be.bignumber.equal(expectedValue);
}

async function assertReleaseableTokensEqualsTo(vesting, expectedValue) {
  const releasableTokens = await vesting.releasableTokens();
  releasableTokens.should.be.bignumber.equal(expectedValue);
}

async function assertDaysSinVestingStartEqualsTo(vesting, expectedValue) {
  const daysSinceVestingStart = await vesting.daysSinceVestingStart();
  daysSinceVestingStart.should.be.bignumber.equal(expectedValue);
}

async function assertVestedTokensEqualsTo(vesting, expectedValue) {
  const vestedTokens = await vesting.vestedTokens();
  vestedTokens.should.be.bignumber.equal(expectedValue);
}

async function assertReleaseEmitsTokensReleasedWithAmount(
  vesting,
  expectedValue
) {
  const { logs } = await vesting.release().should.be.fulfilled;
  assert.notEqual(logs.legth, 0);

  const event = logs.find(e => e.event === "TokensReleased");
  assert.notEqual(event, undefined);

  event.args.amount.should.be.bignumber.equal(expectedValue);
}

contract(
  "LinearDailyVesting",
  (
    [
      deployerAccount,
      beneficiaryAccount,
      revokerAccount,
      revokedTokensDestinationAccount,
      revokedTokensDestinationChangerAccount,
      otherAccount
    ]
  ) => {
    let token;

    beforeEach(async () => {
      // We use the proxy here to also test their integration
      const tokenImplementation = await STRTokenImplementation.new();
      const proxy = await STRTokenProxy.new(
        deployerAccount,
        tokenImplementation.address
      );
      token = STRToken.at(proxy.address);
    });

    describe("Construction", () => {
      it("shouldn't accept 0x0 as token", async () => {
        await LinearDailyVesting.new(
          "0x0",
          beneficiaryAccount,
          await time.getLatestBlockTime(),
          1,
          0,
          true,
          revokerAccount,
          revokedTokensDestinationAccount,
          revokedTokensDestinationChangerAccount
        ).should.be.rejected;
      });

      it("shouldn't accept 0x0 as beneficiaryAccount", async () => {
        await LinearDailyVesting.new(
          token.address,
          "0x0",
          await time.getLatestBlockTime(),
          1,
          0,
          true,
          revokerAccount,
          revokedTokensDestinationAccount,
          revokedTokensDestinationChangerAccount
        ).should.be.rejected;
      });

      it("shouldn't accept a vesting period duration of 0 days", async () => {
        await LinearDailyVesting.new(
          token.address,
          beneficiaryAccount,
          await time.getLatestBlockTime(),
          0,
          0,
          true,
          revokerAccount,
          revokedTokensDestinationAccount,
          revokedTokensDestinationChangerAccount
        ).should.be.rejected;
      });

      it("should accept 0 as cliff days", async () => {
        await LinearDailyVesting.new(
          token.address,
          beneficiaryAccount,
          await time.getLatestBlockTime(),
          1,
          0,
          true,
          revokerAccount,
          revokedTokensDestinationAccount,
          revokedTokensDestinationChangerAccount
        ).should.be.fulfilled;
      });

      it("should accept cliff shorter to the entire vesting period", async () => {
        await LinearDailyVesting.new(
          token.address,
          beneficiaryAccount,
          await time.getLatestBlockTime(),
          2,
          1,
          true,
          revokerAccount,
          revokedTokensDestinationAccount,
          revokedTokensDestinationChangerAccount
        ).should.be.fulfilled;
      });

      it("should accept cliff equal to the entire vesting period", async () => {
        await LinearDailyVesting.new(
          token.address,
          beneficiaryAccount,
          await time.getLatestBlockTime(),
          1,
          1,
          true,
          revokerAccount,
          revokedTokensDestinationAccount,
          revokedTokensDestinationChangerAccount
        ).should.be.fulfilled;
      });

      it("shouldn't accept a cliff longer than the entire vesting period", async () => {
        await LinearDailyVesting.new(
          token.address,
          beneficiaryAccount,
          await time.getLatestBlockTime(),
          1,
          2,
          true,
          revokerAccount,
          revokedTokensDestinationAccount,
          revokedTokensDestinationChangerAccount
        ).should.be.rejected;
      });

      it("shouldn't accept 0x0 as revoker address if revocable", async () => {
        await LinearDailyVesting.new(
          token.address,
          beneficiaryAccount,
          await time.getLatestBlockTime(),
          1,
          0,
          true,
          "0x0",
          revokedTokensDestinationAccount,
          revokedTokensDestinationChangerAccount
        ).should.be.rejected;
      });

      it("shouldn't accept 0x0 as revoked tokens destination address if revocable", async () => {
        await LinearDailyVesting.new(
          token.address,
          beneficiaryAccount,
          await time.getLatestBlockTime(),
          1,
          0,
          true,
          revokerAccount,
          "0x0",
          revokedTokensDestinationChangerAccount
        ).should.be.rejected;
      });

      it("shouldn't accept 0x0 as revoked tokens destination changer address if revocable", async () => {
        await LinearDailyVesting.new(
          token.address,
          beneficiaryAccount,
          await time.getLatestBlockTime(),
          1,
          0,
          true,
          revokerAccount,
          revokedTokensDestinationAccount,
          "0x0"
        ).should.be.rejected;
      });

      it("should accept 0x0 as revoker address if not revocable", async () => {
        await LinearDailyVesting.new(
          token.address,
          beneficiaryAccount,
          await time.getLatestBlockTime(),
          1,
          0,
          false,
          "0x0",
          revokedTokensDestinationAccount,
          revokedTokensDestinationChangerAccount
        ).should.be.fulfilled;
      });

      it("should accept 0x0 as revoked tokens destination address if not revocable", async () => {
        await LinearDailyVesting.new(
          token.address,
          beneficiaryAccount,
          await time.getLatestBlockTime(),
          1,
          0,
          false,
          revokerAccount,
          "0x0",
          revokedTokensDestinationChangerAccount
        ).should.be.fulfilled;
      });

      it("should accept 0x0 as revoked tokens destination changer address if not revocable", async () => {
        await LinearDailyVesting.new(
          token.address,
          beneficiaryAccount,
          await time.getLatestBlockTime(),
          1,
          0,
          false,
          revokerAccount,
          revokedTokensDestinationAccount,
          "0x0"
        ).should.be.fulfilled;
      });

      it("should construct a correct vesting contract", async () => {
        const vesting = await LinearDailyVesting.new(
          token.address,
          beneficiaryAccount,
          123456789,
          123,
          12,
          true,
          revokerAccount,
          revokedTokensDestinationAccount,
          revokedTokensDestinationChangerAccount
        );

        assert.equal(await vesting.token(), token.address);
        assert.equal(await vesting.beneficiary(), beneficiaryAccount);

        const releasedTokens = await vesting.relasedTokens();
        releasedTokens.should.be.bignumber.equal(0);

        const vestingStart = await vesting.vestingStart();
        vestingStart.should.be.bignumber.equal(123456789);

        const vestingDays = await vesting.vestingDays();
        vestingDays.should.be.bignumber.equal(123);

        const cliffDays = await vesting.cliffDays();
        cliffDays.should.be.bignumber.equal(12);

        assert.equal(await vesting.revocable(), true);

        assert.equal(await vesting.revoked(), false);

        assert.equal(await vesting.revoker(), revokerAccount);

        assert.equal(
          await vesting.revokedTokensDestination(),
          revokedTokensDestinationAccount
        );

        assert.equal(
          await vesting.revokedTokensDestinationChanger(),
          revokedTokensDestinationChangerAccount
        );
      });
    });

    describe("TotalTokens calculation", () => {
      let vesting;

      beforeEach(async () => {
        vesting = await LinearDailyVesting.new(
          token.address,
          beneficiaryAccount,
          await time.getLatestBlockTime(),
          4,
          0,
          true,
          revokerAccount,
          revokedTokensDestinationAccount,
          revokedTokensDestinationChangerAccount
        ).should.be.fulfilled;
      });

      it("should be 0 before receiving tokens", async () => {
        await assertTotalTokensEqualsTo(vesting, 0);
      });

      it("should be right after receiving tokens one or more times", async () => {
        await token.transfer(vesting.address, 1000);
        await assertTotalTokensEqualsTo(vesting, 1000);

        await token.transfer(vesting.address, 1000);
        await assertTotalTokensEqualsTo(vesting, 2000);
      });

      it("should be right after some tokens vested", async () => {
        await token.transfer(vesting.address, 1000);
        await time.advanceTimeByDays(2);

        await assertTotalTokensEqualsTo(vesting, 1000);
      });

      it("should count all tokens received, even if some have been released", async () => {
        await token.transfer(vesting.address, 1000);
        await time.advanceTimeByDays(2);
        await vesting.release().should.be.fulfilled;

        await assertTotalTokensEqualsTo(vesting, 1000);
      });

      it("should be right after the vesting period ended", async () => {
        await token.transfer(vesting.address, 1000);
        await time.advanceTimeByDays(1000);

        await assertTotalTokensEqualsTo(vesting, 1000);
      });

      it("should count all tokens received, even if some have already vested before the last transfer", async () => {
        await token.transfer(vesting.address, 1000);
        await time.advanceTimeByDays(1);

        await token.transfer(vesting.address, 1000);
        await assertTotalTokensEqualsTo(vesting, 2000);
      });

      it("should count all tokens received, even if some have already been released before the last transfer", async () => {
        await token.transfer(vesting.address, 1000);
        await time.advanceTimeByDays(2);
        await vesting.release().should.be.fulfilled;

        await token.transfer(vesting.address, 1000);
        await assertTotalTokensEqualsTo(vesting, 2000);
      });

      it("should count all tokens received, even if the vesting period ended before the last transfer", async () => {
        await token.transfer(vesting.address, 1000);
        await time.advanceTimeByDays(10);

        await token.transfer(vesting.address, 1000);
        await assertTotalTokensEqualsTo(vesting, 2000);
      });

      it("should be right before contract revokation", async () => {
        await assertTotalTokensEqualsTo(vesting, 0);

        await token.transfer(vesting.address, 1000);

        await assertTotalTokensEqualsTo(vesting, 1000);

        await time.advanceTimeByDays(1);
        await assertTotalTokensEqualsTo(vesting, 1000);
      });

      it("should be right after contract revokation with 0 vested tokens", async () => {
        await token.transfer(vesting.address, 1000);
        await vesting.revoke({ from: revokerAccount }).should.be.fulfilled;

        await assertTotalTokensEqualsTo(vesting, 1000);
      });

      it("should be right after contract revokation with some vested non-released tokens", async () => {
        await token.transfer(vesting.address, 1000);
        await time.advanceTimeByDays(1);
        await vesting.revoke({ from: revokerAccount }).should.be.fulfilled;

        await assertTotalTokensEqualsTo(vesting, 1000);
      });

      it("should be right after contract revokation with some released tokens", async () => {
        await token.transfer(vesting.address, 1000);
        await time.advanceTimeByDays(1);
        await vesting.release().should.be.fulfilled;
        await vesting.revoke({ from: revokerAccount }).should.be.fulfilled;

        await assertTotalTokensEqualsTo(vesting, 1000);
      });
    });

    describe("VestedTokens calculation", () => {
      let vesting;

      beforeEach(async () => {
        vesting = await LinearDailyVesting.new(
          token.address,
          beneficiaryAccount,
          await time.getLatestBlockTime(),
          4,
          0,
          true,
          revokerAccount,
          revokedTokensDestinationAccount,
          revokedTokensDestinationChangerAccount
        ).should.be.fulfilled;
      });

      it("should start in 0", async () => {
        await assertVestedTokensEqualsTo(vesting, 0);

        await token.transfer(vesting.address, 1000);
        await assertVestedTokensEqualsTo(vesting, 0);
      });

      it("should be 0 before the start date", async () => {
        const vesting = await LinearDailyVesting.new(
          token.address,
          beneficiaryAccount,
          (await time.getLatestBlockTime()) + 1000000,
          4,
          0,
          true,
          revokerAccount,
          revokedTokensDestinationAccount,
          revokedTokensDestinationChangerAccount
        ).should.be.fulfilled;
        await token.transfer(vesting.address, 1000);

        await assertVestedTokensEqualsTo(vesting, 0);
      });

      it("should be 0 before the cliff ends", async () => {
        const vesting = await LinearDailyVesting.new(
          token.address,
          beneficiaryAccount,
          await time.getLatestBlockTime(),
          4,
          2,
          true,
          revokerAccount,
          revokedTokensDestinationAccount,
          revokedTokensDestinationChangerAccount
        ).should.be.fulfilled;

        await token.transfer(vesting.address, 1000);
        await assertVestedTokensEqualsTo(vesting, 0);

        await time.advanceTimeByDays(1);
        await assertVestedTokensEqualsTo(vesting, 0);
      });

      it("should be all the tokens after the vesting period", async () => {
        await token.transfer(vesting.address, 1000);

        await time.advanceTimeByDays(4);
        await assertVestedTokensEqualsTo(vesting, 1000);

        await time.advanceTimeByDays(1000);
        await assertVestedTokensEqualsTo(vesting, 1000);
      });

      it("should be all the tokens after the vesting period, even if received tokens after it finished", async () => {
        await token.transfer(vesting.address, 500);
        await time.advanceTimeByDays(4);
        await token.transfer(vesting.address, 500);

        await assertVestedTokensEqualsTo(vesting, 1000);

        await time.advanceTimeByDays(1000);
        await assertVestedTokensEqualsTo(vesting, 1000);
      });

      it("shouldn't change more than once per day", async () => {
        await token.transfer(vesting.address, 1000);
        await time.advanceTimeByDays(1);
        await assertVestedTokensEqualsTo(vesting, 250);

        await time.advanceTimeByHours(1);
        await assertVestedTokensEqualsTo(vesting, 250);

        await time.advanceTimeByHours(3);
        await assertVestedTokensEqualsTo(vesting, 250);

        await time.advanceTimeByHours(10);
        await assertVestedTokensEqualsTo(vesting, 250);

        await time.advanceTimeByHours(15);
        await assertVestedTokensEqualsTo(vesting, 500);
      });

      it("should be linear with a respect to the days after the start, with 0 cliff", async () => {
        await token.transfer(vesting.address, 1000);
        await assertVestedTokensEqualsTo(vesting, 0);

        await time.advanceTimeByDays(1);
        await assertVestedTokensEqualsTo(vesting, 250);

        await time.advanceTimeByDays(1);
        await assertVestedTokensEqualsTo(vesting, 500);

        await time.advanceTimeByDays(1);
        await assertVestedTokensEqualsTo(vesting, 750);

        await time.advanceTimeByDays(1);
        await assertVestedTokensEqualsTo(vesting, 1000);
      });

      it("should be linear with a respect to the days after the start, with cliff", async () => {
        const vesting = await LinearDailyVesting.new(
          token.address,
          beneficiaryAccount,
          await time.getLatestBlockTime(),
          5,
          2,
          true,
          revokerAccount,
          revokedTokensDestinationAccount,
          revokedTokensDestinationChangerAccount
        ).should.be.fulfilled;

        await token.transfer(vesting.address, 1000);
        await assertVestedTokensEqualsTo(vesting, 0);

        await time.advanceTimeByDays(1);
        await assertVestedTokensEqualsTo(vesting, 0);

        await time.advanceTimeByDays(1);
        await assertVestedTokensEqualsTo(vesting, 400);

        await time.advanceTimeByDays(1);
        await assertVestedTokensEqualsTo(vesting, 600);

        await time.advanceTimeByDays(1);
        await assertVestedTokensEqualsTo(vesting, 800);

        await time.advanceTimeByDays(1);
        await assertVestedTokensEqualsTo(vesting, 1000);
      });

      it("shouldn't be affected by releases of tokens", async () => {
        await token.transfer(vesting.address, 1000);
        await time.advanceTimeByDays(1);

        await assertVestedTokensEqualsTo(vesting, 250);

        await vesting.release().should.be.fulfilled;

        await assertVestedTokensEqualsTo(vesting, 250);

        await time.advanceTimeByDays(100);

        await assertVestedTokensEqualsTo(vesting, 1000);

        await vesting.release().should.be.fulfilled;

        await assertVestedTokensEqualsTo(vesting, 1000);
      });

      it("should count all tokens, even if some of them are received in the middle of the vesting period", async () => {
        await token.transfer(vesting.address, 1000);
        await time.advanceTimeByDays(1);

        await assertVestedTokensEqualsTo(vesting, 250);

        await token.transfer(vesting.address, 1000);

        await assertVestedTokensEqualsTo(vesting, 500);

        await time.advanceTimeByDays(1);
        await assertVestedTokensEqualsTo(vesting, 1000);

        await time.advanceTimeByDays(1);
        await assertVestedTokensEqualsTo(vesting, 1500);

        await time.advanceTimeByDays(1);
        await assertVestedTokensEqualsTo(vesting, 2000);
      });

      it("should remain the same after revokation, without vested tokens", async () => {
        await token.transfer(vesting.address, 1000);
        await assertVestedTokensEqualsTo(vesting, 0);

        await vesting.revoke({ from: revokerAccount }).should.be.fulfilled;
        await assertVestedTokensEqualsTo(vesting, 0);
      });

      it("should remain the same after revokation, with vested tokens", async () => {
        await token.transfer(vesting.address, 1000);
        await time.advanceTimeByDays(1);

        await assertVestedTokensEqualsTo(vesting, 250);

        await vesting.revoke({ from: revokerAccount }).should.be.fulfilled;
        await assertVestedTokensEqualsTo(vesting, 250);
      });
    });

    describe("LockedTokens calculation", () => {
      let vesting;

      beforeEach(async () => {
        vesting = await LinearDailyVesting.new(
          token.address,
          beneficiaryAccount,
          await time.getLatestBlockTime(),
          5,
          2,
          true,
          revokerAccount,
          revokedTokensDestinationAccount,
          revokedTokensDestinationChangerAccount
        ).should.be.fulfilled;

        await token.transfer(vesting.address, 1000);
      });

      it("should be all tokens before the vesting", async () => {
        const vesting = await LinearDailyVesting.new(
          token.address,
          beneficiaryAccount,
          (await time.getLatestBlockTime()) + 1000000000,
          5,
          0,
          true,
          revokerAccount,
          revokedTokensDestinationAccount,
          revokedTokensDestinationChangerAccount
        ).should.be.fulfilled;

        await token.transfer(vesting.address, 1000);

        await assertLockedTokensEqualsTo(vesting, 1000);

        await time.advanceTimeByDays(1);
        await assertLockedTokensEqualsTo(vesting, 1000);
      });

      it("should be 0 after the vesting period", async () => {
        await time.advanceTimeByDays(10000);
        await assertLockedTokensEqualsTo(vesting, 0);
      });

      it("should be totalTokens before cliff", async () => {
        await assertLockedTokensEqualsTo(vesting, 1000);

        await time.advanceTimeByDays(1);
        await assertLockedTokensEqualsTo(vesting, 1000);
      });

      it("should be totalTokens - vestedTokens, after cliff", async () => {
        await time.advanceTimeByDays(2);
        await assertLockedTokensEqualsTo(vesting, 600);

        await time.advanceTimeByDays(1);
        await assertLockedTokensEqualsTo(vesting, 400);

        await time.advanceTimeByDays(1);
        await assertLockedTokensEqualsTo(vesting, 200);

        await time.advanceTimeByDays(1);
        await assertLockedTokensEqualsTo(vesting, 0);
      });

      it("should be totalTokens - vestedTokens, without cliff", async () => {
        const vesting = await LinearDailyVesting.new(
          token.address,
          beneficiaryAccount,
          await time.getLatestBlockTime(),
          5,
          0,
          true,
          revokerAccount,
          revokedTokensDestinationAccount,
          revokedTokensDestinationChangerAccount
        ).should.be.fulfilled;

        await token.transfer(vesting.address, 1000);

        await assertLockedTokensEqualsTo(vesting, 1000);

        await time.advanceTimeByDays(1);
        await assertLockedTokensEqualsTo(vesting, 800);

        await time.advanceTimeByDays(1);
        await assertLockedTokensEqualsTo(vesting, 600);

        await time.advanceTimeByDays(1);
        await assertLockedTokensEqualsTo(vesting, 400);

        await time.advanceTimeByDays(1);
        await assertLockedTokensEqualsTo(vesting, 200);

        await time.advanceTimeByDays(1);
        await assertLockedTokensEqualsTo(vesting, 0);
      });

      it("should count all tokens, event if sent later", async () => {
        await assertLockedTokensEqualsTo(vesting, 1000);

        await time.advanceTimeByDays(1);
        await assertLockedTokensEqualsTo(vesting, 1000);

        await token.transfer(vesting.address, 1000);
        await assertLockedTokensEqualsTo(vesting, 2000);

        await time.advanceTimeByDays(1);
        await assertLockedTokensEqualsTo(vesting, 1200);

        await time.advanceTimeByDays(1);
        await assertLockedTokensEqualsTo(vesting, 800);

        await time.advanceTimeByDays(1);
        await assertLockedTokensEqualsTo(vesting, 400);

        await time.advanceTimeByDays(1);
        await assertLockedTokensEqualsTo(vesting, 0);

        await time.advanceTimeByDays(1);
        await assertLockedTokensEqualsTo(vesting, 0);
      });

      it("shouldn't be affected by releases of tokens", async () => {
        await time.advanceTimeByDays(2);

        await assertLockedTokensEqualsTo(vesting, 600);

        await vesting.release().should.be.fulfilled;

        await assertLockedTokensEqualsTo(vesting, 600);
      });

      it("should be 0 after revokation when no token vested", async () => {
        await vesting.revoke({
          from: revokerAccount
        }).should.be.fulfilled;

        await assertLockedTokensEqualsTo(vesting, 0);
      });

      it("should be 0 after revokation when some tokens vested and haven't been released", async () => {
        await time.advanceTimeByDays(2);
        await vesting.revoke({
          from: revokerAccount
        }).should.be.fulfilled;

        await assertLockedTokensEqualsTo(vesting, 0);
      });

      it("should be 0 after revokation when some tokens have vested and been released", async () => {
        await time.advanceTimeByDays(2);
        await vesting.release().should.be.fulfilled;
        await vesting.revoke({
          from: revokerAccount
        }).should.be.fulfilled;

        await assertLockedTokensEqualsTo(vesting, 0);
      });

      it("should be 0 after revokation when there are some unreleased vested tokens, buy some tokens have vested and been released", async () => {
        await time.advanceTimeByDays(2);
        await vesting.release().should.be.fulfilled;
        await time.advanceTimeByDays(2);
        await vesting.revoke({
          from: revokerAccount
        }).should.be.fulfilled;

        await assertLockedTokensEqualsTo(vesting, 0);
      });
    });

    describe("ReleasableTokens calculation", () => {
      let vesting;

      beforeEach(async () => {
        vesting = await LinearDailyVesting.new(
          token.address,
          beneficiaryAccount,
          await time.getLatestBlockTime(),
          5,
          2,
          true,
          revokerAccount,
          revokedTokensDestinationAccount,
          revokedTokensDestinationChangerAccount
        ).should.be.fulfilled;

        await token.transfer(vesting.address, 1000);
      });

      it("should be vestedTokens if release hasn't been called, with cliff", async () => {
        await assertReleaseableTokensEqualsTo(
          vesting,
          await vesting.vestedTokens()
        );

        await time.advanceTimeByDays(1);
        await assertReleaseableTokensEqualsTo(
          vesting,
          await vesting.vestedTokens()
        );

        await time.advanceTimeByDays(1);
        await assertReleaseableTokensEqualsTo(
          vesting,
          await vesting.vestedTokens()
        );

        await time.advanceTimeByDays(1);
        await assertReleaseableTokensEqualsTo(
          vesting,
          await vesting.vestedTokens()
        );

        await time.advanceTimeByDays(1);
        await assertReleaseableTokensEqualsTo(
          vesting,
          await vesting.vestedTokens()
        );

        await time.advanceTimeByDays(1);
        await assertReleaseableTokensEqualsTo(
          vesting,
          await vesting.vestedTokens()
        );

        await time.advanceTimeByDays(1);
        await assertReleaseableTokensEqualsTo(
          vesting,
          await vesting.vestedTokens()
        );

        await time.advanceTimeByDays(1);
        await assertReleaseableTokensEqualsTo(
          vesting,
          await vesting.vestedTokens()
        );
      });

      it("should be vestedTokens if release hasn't been called, without cliff", async () => {
        const vesting = await LinearDailyVesting.new(
          token.address,
          beneficiaryAccount,
          await time.getLatestBlockTime(),
          5,
          0,
          true,
          revokerAccount,
          revokedTokensDestinationAccount,
          revokedTokensDestinationChangerAccount
        ).should.be.fulfilled;

        await token.transfer(vesting.address, 1000);

        await assertReleaseableTokensEqualsTo(
          vesting,
          await vesting.vestedTokens()
        );

        await time.advanceTimeByDays(1);
        await assertReleaseableTokensEqualsTo(
          vesting,
          await vesting.vestedTokens()
        );

        await time.advanceTimeByDays(1);
        await assertReleaseableTokensEqualsTo(
          vesting,
          await vesting.vestedTokens()
        );

        await time.advanceTimeByDays(1);
        await assertReleaseableTokensEqualsTo(
          vesting,
          await vesting.vestedTokens()
        );

        await time.advanceTimeByDays(1);
        await assertReleaseableTokensEqualsTo(
          vesting,
          await vesting.vestedTokens()
        );

        await time.advanceTimeByDays(1);
        await assertReleaseableTokensEqualsTo(
          vesting,
          await vesting.vestedTokens()
        );

        await time.advanceTimeByDays(1);
        await assertReleaseableTokensEqualsTo(
          vesting,
          await vesting.vestedTokens()
        );

        await time.advanceTimeByDays(1);
        await assertReleaseableTokensEqualsTo(
          vesting,
          await vesting.vestedTokens()
        );
      });

      it("should be vestedTokens if release hasn't been called, even if tokens are added later", async () => {
        await assertReleaseableTokensEqualsTo(
          vesting,
          await vesting.vestedTokens()
        );

        await time.advanceTimeByDays(1);
        await assertReleaseableTokensEqualsTo(
          vesting,
          await vesting.vestedTokens()
        );

        await token.transfer(vesting.address, 1000);
        await assertReleaseableTokensEqualsTo(
          vesting,
          await vesting.vestedTokens()
        );

        await time.advanceTimeByDays(1);
        await assertReleaseableTokensEqualsTo(
          vesting,
          await vesting.vestedTokens()
        );

        await time.advanceTimeByDays(1);
        await assertReleaseableTokensEqualsTo(
          vesting,
          await vesting.vestedTokens()
        );

        await time.advanceTimeByDays(1);
        await assertReleaseableTokensEqualsTo(
          vesting,
          await vesting.vestedTokens()
        );

        await token.transfer(vesting.address, 1000);
        await assertReleaseableTokensEqualsTo(
          vesting,
          await vesting.vestedTokens()
        );

        await time.advanceTimeByDays(1);
        await assertReleaseableTokensEqualsTo(
          vesting,
          await vesting.vestedTokens()
        );
      });

      it("shouldn't include already released tokens", async () => {
        await assertReleaseableTokensEqualsTo(vesting, 0);

        await time.advanceTimeByDays(2);
        await assertReleaseableTokensEqualsTo(vesting, 400);

        await vesting.release().should.be.fulfilled;
        await assertReleaseableTokensEqualsTo(vesting, 0);

        await time.advanceTimeByDays(1);
        await assertReleaseableTokensEqualsTo(vesting, 200);

        await time.advanceTimeByDays(1);
        await assertReleaseableTokensEqualsTo(vesting, 400);

        await vesting.release().should.be.fulfilled;
        await assertReleaseableTokensEqualsTo(vesting, 0);

        await time.advanceTimeByDays(1);
        await assertReleaseableTokensEqualsTo(vesting, 200);

        await time.advanceTimeByDays(1);
        await assertReleaseableTokensEqualsTo(vesting, 200);

        await vesting.release().should.be.fulfilled;
        await assertReleaseableTokensEqualsTo(vesting, 0);

        await time.advanceTimeByDays(1);
        await assertReleaseableTokensEqualsTo(vesting, 0);
      });

      it("should include a linear proportion of any token received after a release, without cliff", async () => {
        const vesting = await LinearDailyVesting.new(
          token.address,
          beneficiaryAccount,
          await time.getLatestBlockTime(),
          5,
          0,
          true,
          revokerAccount,
          revokedTokensDestinationAccount,
          revokedTokensDestinationChangerAccount
        ).should.be.fulfilled;

        await token.transfer(vesting.address, 1000);

        await assertReleaseableTokensEqualsTo(vesting, 0);

        await time.advanceTimeByDays(1);
        await assertReleaseableTokensEqualsTo(vesting, 200);

        await time.advanceTimeByDays(1);
        await assertReleaseableTokensEqualsTo(vesting, 400);

        await vesting.release().should.be.fulfilled;
        await assertReleaseableTokensEqualsTo(vesting, 0);

        await token.transfer(vesting.address, 1000);
        await assertReleaseableTokensEqualsTo(vesting, 400);

        await vesting.release().should.be.fulfilled;
        await assertReleaseableTokensEqualsTo(vesting, 0);

        await time.advanceTimeByDays(1);
        await assertReleaseableTokensEqualsTo(vesting, 400);

        await time.advanceTimeByDays(1);
        await assertReleaseableTokensEqualsTo(vesting, 800);

        await token.transfer(vesting.address, 1000);
        await assertReleaseableTokensEqualsTo(vesting, 1600);

        await vesting.release().should.be.fulfilled;
        await assertReleaseableTokensEqualsTo(vesting, 0);

        await time.advanceTimeByDays(1);

        await assertReleaseableTokensEqualsTo(vesting, 600);

        await vesting.release().should.be.fulfilled;
        await assertReleaseableTokensEqualsTo(vesting, 0);

        await token.transfer(vesting.address, 1000);
        await assertReleaseableTokensEqualsTo(vesting, 1000);
      });

      it("should include a linear proportion of any token received after a release, without cliff", async () => {
        const vesting = await LinearDailyVesting.new(
          token.address,
          beneficiaryAccount,
          await time.getLatestBlockTime(),
          4,
          0,
          true,
          revokerAccount,
          revokedTokensDestinationAccount,
          revokedTokensDestinationChangerAccount
        ).should.be.fulfilled;

        await token.transfer(vesting.address, 1000);
        await assertReleaseableTokensEqualsTo(vesting, 0);

        await time.advanceTimeByDays(1);
        await assertReleaseableTokensEqualsTo(vesting, 250);

        await vesting.release().should.be.fulfilled;
        await assertReleaseableTokensEqualsTo(vesting, 0);

        await token.transfer(vesting.address, 1000);
        await assertReleaseableTokensEqualsTo(vesting, 250);

        await time.advanceTimeByDays(1);
        await assertReleaseableTokensEqualsTo(vesting, 750);

        await vesting.release().should.be.fulfilled;
        await assertReleaseableTokensEqualsTo(vesting, 0);

        await time.advanceTimeByDays(1);
        await assertReleaseableTokensEqualsTo(vesting, 500);

        await time.advanceTimeByDays(1);
        await assertReleaseableTokensEqualsTo(vesting, 1000);

        await token.transfer(vesting.address, 1000);
        await assertReleaseableTokensEqualsTo(vesting, 2000);

        await vesting.release().should.be.fulfilled;
        await assertReleaseableTokensEqualsTo(vesting, 0);

        await token.transfer(vesting.address, 1000);
        await assertReleaseableTokensEqualsTo(vesting, 1000);
      });

      it("should be 0 after revokation if it already was 0 because no token vested", async () => {
        await vesting.revoke({
          from: revokerAccount
        }).should.be.fulfilled;

        await time.advanceTimeByDays(1);

        await assertReleaseableTokensEqualsTo(vesting, 0);
      });

      it("should be 0 after revokation if it already was 0 because all vested tokens where released", async () => {
        await time.advanceTimeByDays(2);
        await vesting.release().should.be.fulfilled;
        await vesting.revoke({
          from: revokerAccount
        }).should.be.fulfilled;

        await assertReleaseableTokensEqualsTo(vesting, 0);
      });

      it("should be 0 after revokation if it wasn't already 0 and no token was released ever", async () => {
        await time.advanceTimeByDays(2);
        await vesting.revoke({
          from: revokerAccount
        }).should.be.fulfilled;

        await assertReleaseableTokensEqualsTo(vesting, 0);
      });

      it("should be 0 after revokation if it wasn't already 0 but some tokens were released before", async () => {
        await time.advanceTimeByDays(2);
        await vesting.release().should.be.fulfilled;
        await time.advanceTimeByDays(2);
        await vesting.revoke({
          from: revokerAccount
        }).should.be.fulfilled;

        await assertReleaseableTokensEqualsTo(vesting, 0);
      });
    });

    describe("Tokens release", () => {
      let vesting;

      beforeEach(async () => {
        vesting = await LinearDailyVesting.new(
          token.address,
          beneficiaryAccount,
          await time.getLatestBlockTime(),
          4,
          0,
          true,
          revokerAccount,
          revokedTokensDestinationAccount,
          revokedTokensDestinationChangerAccount
        ).should.be.fulfilled;
      });

      it("shouldn't let you release when there's 0 vested tokens, without cliff", async () => {
        await vesting.release().should.be.rejected;

        await token.transfer(vesting.address, 1000);
        await vesting.release().should.be.rejected;
      });

      it("shouldn't let you release when there's 0 vested tokens, with cliff", async () => {
        const vesting = await LinearDailyVesting.new(
          token.address,
          beneficiaryAccount,
          await time.getLatestBlockTime(),
          4,
          2,
          true,
          revokerAccount,
          revokedTokensDestinationAccount,
          revokedTokensDestinationChangerAccount
        ).should.be.fulfilled;

        await vesting.release().should.be.rejected;

        await token.transfer(vesting.address, 1000);
        await vesting.release().should.be.rejected;

        await time.advanceTimeByDays(1);
        await vesting.release().should.be.rejected;

        await time.advanceTimeByDays(1);
        await vesting.release().should.be.fulfilled;
      });

      it("shouldn't let you release right after a previous release", async () => {
        await token.transfer(vesting.address, 1000);

        await time.advanceTimeByDays(1);
        await vesting.release().should.be.fulfilled;

        await vesting.release().should.be.rejected;
      });

      it("shouldn't let you release after a previous release without waiting to the next day", async () => {
        await token.transfer(vesting.address, 1000);

        await time.advanceTimeByDays(1);
        await vesting.release().should.be.fulfilled;

        await time.advanceTimeByMinutes(20);

        await vesting.release().should.be.rejected;
      });

      it("shouldn't let you release if the vesting period has already ended and all tokens have been released", async () => {
        await token.transfer(vesting.address, 1000);

        await time.advanceTimeByDays(4);
        await vesting.release().should.be.fulfilled;

        await vesting.release().should.be.rejected;

        await time.advanceTimeByDays(1);
        await vesting.release().should.be.rejected;
      });

      it("should let anyone call it", async () => {
        await token.transfer(vesting.address, 1000);

        await time.advanceTimeByDays(1);
        await vesting.release({ from: otherAccount }).should.be.fulfilled;
      });

      it("should let you release more than once, after at least a day", async () => {
        await token.transfer(vesting.address, 1000);

        await time.advanceTimeByDays(1);
        await vesting.release().should.be.fulfilled;

        await time.advanceTimeByDays(2);
        await vesting.release().should.be.fulfilled;
      });

      it("should emit the right event, without cliff", async () => {
        await token.transfer(vesting.address, 1000);

        await time.advanceTimeByDays(1);
        await assertReleaseEmitsTokensReleasedWithAmount(vesting, 250);

        await token.transfer(vesting.address, 1000);
        await assertReleaseEmitsTokensReleasedWithAmount(vesting, 250);

        await time.advanceTimeByDays(1);
        await assertReleaseEmitsTokensReleasedWithAmount(vesting, 500);

        await time.advanceTimeByDays(10);
        await assertReleaseEmitsTokensReleasedWithAmount(vesting, 1000);

        await token.transfer(vesting.address, 1000);
        await assertReleaseEmitsTokensReleasedWithAmount(vesting, 1000);
      });

      it("should emit the right event, with cliff", async () => {
        const vesting = await LinearDailyVesting.new(
          token.address,
          beneficiaryAccount,
          await time.getLatestBlockTime(),
          4,
          2,
          true,
          revokerAccount,
          revokedTokensDestinationAccount,
          revokedTokensDestinationChangerAccount
        ).should.be.fulfilled;

        await token.transfer(vesting.address, 1000);

        await time.advanceTimeByDays(1);

        await token.transfer(vesting.address, 1000);

        await time.advanceTimeByDays(1);
        await assertReleaseEmitsTokensReleasedWithAmount(vesting, 1000);

        await time.advanceTimeByDays(10);
        await assertReleaseEmitsTokensReleasedWithAmount(vesting, 1000);

        await token.transfer(vesting.address, 1000);
        await assertReleaseEmitsTokensReleasedWithAmount(vesting, 1000);
      });

      it("should update balances on the token, without cliff", async () => {
        await assertTokenBalanceEqualsTo(token, vesting.address, 0);
        await assertTokenBalanceEqualsTo(token, beneficiaryAccount, 0);

        await token.transfer(vesting.address, 1000);

        await assertTokenBalanceEqualsTo(token, vesting.address, 1000);
        await assertTokenBalanceEqualsTo(token, beneficiaryAccount, 0);

        await time.advanceTimeByDays(1);
        await vesting.release().should.be.fulfilled;

        await assertTokenBalanceEqualsTo(token, vesting.address, 750);
        await assertTokenBalanceEqualsTo(token, beneficiaryAccount, 250);

        await token.transfer(vesting.address, 1000);

        await assertTokenBalanceEqualsTo(token, vesting.address, 1750);
        await assertTokenBalanceEqualsTo(token, beneficiaryAccount, 250);

        await vesting.release().should.be.fulfilled;

        await assertTokenBalanceEqualsTo(token, vesting.address, 1500);
        await assertTokenBalanceEqualsTo(token, beneficiaryAccount, 500);

        await time.advanceTimeByDays(1);
        await vesting.release().should.be.fulfilled;

        await assertTokenBalanceEqualsTo(token, vesting.address, 1000);
        await assertTokenBalanceEqualsTo(token, beneficiaryAccount, 1000);

        await time.advanceTimeByDays(10);
        await vesting.release().should.be.fulfilled;

        await assertTokenBalanceEqualsTo(token, vesting.address, 0);
        await assertTokenBalanceEqualsTo(token, beneficiaryAccount, 2000);

        await token.transfer(vesting.address, 1000);

        await assertTokenBalanceEqualsTo(token, vesting.address, 1000);
        await assertTokenBalanceEqualsTo(token, beneficiaryAccount, 2000);

        await vesting.release().should.be.fulfilled;

        await assertTokenBalanceEqualsTo(token, vesting.address, 0);
        await assertTokenBalanceEqualsTo(token, beneficiaryAccount, 3000);
      });

      it("should update balances on the token, with cliff", async () => {
        const vesting = await LinearDailyVesting.new(
          token.address,
          beneficiaryAccount,
          await time.getLatestBlockTime(),
          4,
          2,
          true,
          revokerAccount,
          revokedTokensDestinationAccount,
          revokedTokensDestinationChangerAccount
        ).should.be.fulfilled;

        await assertTokenBalanceEqualsTo(token, vesting.address, 0);
        await assertTokenBalanceEqualsTo(token, beneficiaryAccount, 0);

        await token.transfer(vesting.address, 2000);

        await assertTokenBalanceEqualsTo(token, vesting.address, 2000);
        await assertTokenBalanceEqualsTo(token, beneficiaryAccount, 0);

        await time.advanceTimeByDays(2);
        await vesting.release().should.be.fulfilled;

        await assertTokenBalanceEqualsTo(token, vesting.address, 1000);
        await assertTokenBalanceEqualsTo(token, beneficiaryAccount, 1000);

        await time.advanceTimeByDays(10);
        await vesting.release().should.be.fulfilled;

        await assertTokenBalanceEqualsTo(token, vesting.address, 0);
        await assertTokenBalanceEqualsTo(token, beneficiaryAccount, 2000);

        await token.transfer(vesting.address, 1000);

        await assertTokenBalanceEqualsTo(token, vesting.address, 1000);
        await assertTokenBalanceEqualsTo(token, beneficiaryAccount, 2000);

        await vesting.release().should.be.fulfilled;

        await assertTokenBalanceEqualsTo(token, vesting.address, 0);
        await assertTokenBalanceEqualsTo(token, beneficiaryAccount, 3000);
      });

      it("should work before the contract is revoked", async () => {
        await token.transfer(vesting.address, 1000);
        await time.advanceTimeByDays(1);

        await vesting.release().should.be.fulfilled;
      });

      it("shouldn't work right after the contract is revoked", async () => {
        await token.transfer(vesting.address, 1000);
        await time.advanceTimeByDays(1);

        await vesting.revoke({ from: revokerAccount }).should.be.fulfilled;

        await vesting.release().should.be.rejected;
      });

      it("shouldn't work after the contract is revoked, even if time passes", async () => {
        await token.transfer(vesting.address, 1000);
        await vesting.revoke({ from: revokerAccount }).should.be.fulfilled;
        await time.advanceTimeByDays(10);

        await vesting.release().should.be.rejected;
      });
    });

    describe("revokedTokensDestination changes", () => {
      let vesting;

      beforeEach(async () => {
        vesting = await LinearDailyVesting.new(
          token.address,
          beneficiaryAccount,
          await time.getLatestBlockTime(),
          5,
          2,
          true,
          revokerAccount,
          revokedTokensDestinationAccount,
          revokedTokensDestinationChangerAccount
        ).should.be.fulfilled;
      });

      it("shouldn't be changable by accounts different to the changer", async () => {
        await vesting.changeRevokedTokensDestination(otherAccount, {
          from: otherAccount
        }).should.be.rejected;

        await vesting.changeRevokedTokensDestination(otherAccount, {
          from: deployerAccount
        }).should.be.rejected;

        await vesting.changeRevokedTokensDestination(otherAccount, {
          from: beneficiaryAccount
        }).should.be.rejected;

        await vesting.changeRevokedTokensDestination(otherAccount, {
          from: revokerAccount
        }).should.be.rejected;

        await vesting.changeRevokedTokensDestination(otherAccount, {
          from: revokedTokensDestinationAccount
        }).should.be.rejected;
      });

      it("shouldn't be changable after revokation", async () => {
        await token.transfer(vesting.address, 1000);
        await vesting.revoke({ from: revokerAccount }).should.be.fulfilled;

        await vesting.changeRevokedTokensDestination(otherAccount, {
          from: revokedTokensDestinationChangerAccount
        }).should.be.rejected;
      });

      it("shouldn't accept '0x0' as address", async () => {
        await vesting.changeRevokedTokensDestination("0x0", {
          from: revokedTokensDestinationChangerAccount
        }).should.be.rejected;
      });

      it("shouldn't accept the current address", async () => {
        await vesting.changeRevokedTokensDestination(
          revokedTokensDestinationAccount,
          {
            from: revokedTokensDestinationChangerAccount
          }
        ).should.be.rejected;
      });

      it("should be changable by the revokedTokensDestinationChanger", async () => {
        await vesting.changeRevokedTokensDestination(otherAccount, {
          from: revokedTokensDestinationChangerAccount
        }).should.be.fulfilled;
      });

      it("should set the right address revokedTokensDestination", async () => {
        await vesting.changeRevokedTokensDestination(otherAccount, {
          from: revokedTokensDestinationChangerAccount
        }).should.be.fulfilled;

        assert.equal(await vesting.revokedTokensDestination(), otherAccount);
      });

      it("should emit the right event", async () => {
        const {
          logs
        } = await vesting.changeRevokedTokensDestination(otherAccount, {
          from: revokedTokensDestinationChangerAccount
        }).should.be.fulfilled;

        assert.notEqual(logs.legth, 0);

        const event = logs.find(
          e => e.event === "RevokedTokensDestinationChanged"
        );
        assert.notEqual(event, undefined);

        assert.equal(event.args.previous, revokedTokensDestinationAccount);
        assert.equal(event.args.current, otherAccount);
      });
    });

    describe("revokedTokensDestinationChanger changes", () => {
      let vesting;

      beforeEach(async () => {
        vesting = await LinearDailyVesting.new(
          token.address,
          beneficiaryAccount,
          await time.getLatestBlockTime(),
          5,
          2,
          true,
          revokerAccount,
          revokedTokensDestinationAccount,
          revokedTokensDestinationChangerAccount
        ).should.be.fulfilled;
      });

      it("shouldn't be changable by accounts different to the changer", async () => {
        await vesting.changeRevokedTokensDestinationChanger(otherAccount, {
          from: otherAccount
        }).should.be.rejected;

        await vesting.changeRevokedTokensDestinationChanger(otherAccount, {
          from: deployerAccount
        }).should.be.rejected;

        await vesting.changeRevokedTokensDestinationChanger(otherAccount, {
          from: beneficiaryAccount
        }).should.be.rejected;

        await vesting.changeRevokedTokensDestinationChanger(otherAccount, {
          from: revokerAccount
        }).should.be.rejected;

        await vesting.changeRevokedTokensDestinationChanger(otherAccount, {
          from: revokedTokensDestinationAccount
        }).should.be.rejected;
      });

      it("shouldn't be changable after revokation", async () => {
        await token.transfer(vesting.address, 1000);
        await vesting.revoke({ from: revokerAccount }).should.be.fulfilled;

        await vesting.changeRevokedTokensDestinationChanger(otherAccount, {
          from: revokedTokensDestinationChangerAccount
        }).should.be.rejected;
      });

      it("shouldn't accept '0x0' as address", async () => {
        await vesting.changeRevokedTokensDestinationChanger("0x0", {
          from: revokedTokensDestinationChangerAccount
        }).should.be.rejected;
      });

      it("shouldn't accept the current address", async () => {
        await vesting.changeRevokedTokensDestinationChanger(
          revokedTokensDestinationChangerAccount,
          {
            from: revokedTokensDestinationChangerAccount
          }
        ).should.be.rejected;
      });

      it("should be changable by the revokedTokensDestinationChanger", async () => {
        await vesting.changeRevokedTokensDestinationChanger(otherAccount, {
          from: revokedTokensDestinationChangerAccount
        }).should.be.fulfilled;
      });

      it("should set the right address revokedTokensDestination", async () => {
        await vesting.changeRevokedTokensDestinationChanger(otherAccount, {
          from: revokedTokensDestinationChangerAccount
        }).should.be.fulfilled;

        assert.equal(
          await vesting.revokedTokensDestinationChanger(),
          otherAccount
        );
      });

      it("should emit the right event", async () => {
        const {
          logs
        } = await vesting.changeRevokedTokensDestinationChanger(otherAccount, {
          from: revokedTokensDestinationChangerAccount
        }).should.be.fulfilled;

        assert.notEqual(logs.legth, 0);

        const event = logs.find(
          e => e.event === "RevokedTokensDestinationChangerChanged"
        );
        assert.notEqual(event, undefined);

        assert.equal(
          event.args.previous,
          revokedTokensDestinationChangerAccount
        );
        assert.equal(event.args.current, otherAccount);
      });
    });

    describe("Revoke", () => {
      let vesting;

      beforeEach(async () => {
        vesting = await LinearDailyVesting.new(
          token.address,
          beneficiaryAccount,
          await time.getLatestBlockTime(),
          5,
          2,
          true,
          revokerAccount,
          revokedTokensDestinationAccount,
          revokedTokensDestinationChangerAccount
        ).should.be.fulfilled;

        await token.transfer(vesting.address, 1000);
      });

      it("shouldn't by callable by accounts distinct than the revoker", async () => {
        await vesting.revoke({
          from: deployerAccount
        }).should.be.rejected;

        await vesting.revoke({
          from: revokedTokensDestinationAccount
        }).should.be.rejected;

        await vesting.revoke({
          from: revokedTokensDestinationChangerAccount
        }).should.be.rejected;

        await vesting.revoke({
          from: otherAccount
        }).should.be.rejected;
      });

      it("should be callable by the revoker", async () => {
        await vesting.revoke({
          from: revokerAccount
        }).should.be.fulfilled;
      });

      it("shouldn't be callable twice", async () => {
        await vesting.revoke({
          from: revokerAccount
        }).should.be.fulfilled;

        await vesting.revoke({
          from: revokerAccount
        }).should.be.rejected;
      });

      it("shouldn't be callable if there aren't tokens in the contract", async () => {
        const otherVesting = await LinearDailyVesting.new(
          token.address,
          beneficiaryAccount,
          await time.getLatestBlockTime(),
          5,
          2,
          true,
          revokerAccount,
          revokedTokensDestinationAccount,
          revokedTokensDestinationChangerAccount
        ).should.be.fulfilled;

        await otherVesting.revoke({
          from: revokerAccount
        }).should.be.rejected;
      });

      it("shouldn't be callable after the vesting period", async () => {
        await time.advanceTimeByDays(5);

        await vesting.revoke({
          from: revokerAccount
        }).should.be.rejected;
      });

      it("should set revoker to true", async () => {
        await vesting.revoke({
          from: revokerAccount
        }).should.be.fulfilled;

        assert.equal(await vesting.revoked(), true);
      });

      it("should be callable after some tokens have been released", async () => {
        await time.advanceTimeByDays(2);

        await vesting.release().should.be.fulfilled;

        await vesting.revoke({
          from: revokerAccount
        }).should.be.fulfilled;
      });

      it("should set revoked tokens to the previous locked tokens", async () => {
        let previousLockedTokens = await vesting.lockedTokens();

        await vesting.revoke({
          from: revokerAccount
        }).should.be.fulfilled;

        previousLockedTokens.should.be.bignumber.equal(
          await vesting.revokedTokens()
        );

        vesting = await LinearDailyVesting.new(
          token.address,
          beneficiaryAccount,
          await time.getLatestBlockTime(),
          5,
          2,
          true,
          revokerAccount,
          revokedTokensDestinationAccount,
          revokedTokensDestinationChangerAccount
        ).should.be.fulfilled;
        await token.transfer(vesting.address, 1000);

        await time.advanceTimeByDays(3);

        previousLockedTokens = await vesting.lockedTokens();

        await vesting.revoke({
          from: revokerAccount
        }).should.be.fulfilled;

        previousLockedTokens.should.be.bignumber.equal(
          await vesting.revokedTokens()
        );

        vesting = await LinearDailyVesting.new(
          token.address,
          beneficiaryAccount,
          await time.getLatestBlockTime(),
          5,
          2,
          true,
          revokerAccount,
          revokedTokensDestinationAccount,
          revokedTokensDestinationChangerAccount
        ).should.be.fulfilled;
        await token.transfer(vesting.address, 1000);

        await time.advanceTimeByDays(3);
        await vesting.release().should.be.fulfilled;

        previousLockedTokens = await vesting.lockedTokens();

        await vesting.revoke({
          from: revokerAccount
        }).should.be.fulfilled;

        previousLockedTokens.should.be.bignumber.equal(
          await vesting.revokedTokens()
        );
      });
    });

    describe("Balances updates after revokation", () => {
      let vesting;

      beforeEach(async () => {
        vesting = await LinearDailyVesting.new(
          token.address,
          beneficiaryAccount,
          await time.getLatestBlockTime(),
          5,
          2,
          true,
          revokerAccount,
          revokedTokensDestinationAccount,
          revokedTokensDestinationChangerAccount
        ).should.be.fulfilled;

        await token.transfer(vesting.address, 1000);
      });

      it("should send everything to the revokedTokensDestinationAccount if nothing vested", async () => {
        await assertTokenBalanceEqualsTo(token, vesting.address, 1000);

        await vesting.revoke({
          from: revokerAccount
        }).should.be.fulfilled;

        await assertTokenBalanceEqualsTo(token, vesting.address, 0);

        await assertTokenBalanceEqualsTo(token, beneficiaryAccount, 0);

        await assertTokenBalanceEqualsTo(
          token,
          revokedTokensDestinationAccount,
          1000
        );
      });

      it("should send non-released vested tokens to the beneficiaryAccount", async () => {
        await assertTokenBalanceEqualsTo(token, vesting.address, 1000);

        await time.advanceTimeByDays(2);
        await vesting.revoke({
          from: revokerAccount
        }).should.be.fulfilled;

        await assertTokenBalanceEqualsTo(token, vesting.address, 0);

        await assertTokenBalanceEqualsTo(token, beneficiaryAccount, 400);

        await assertTokenBalanceEqualsTo(
          token,
          revokedTokensDestinationAccount,
          600
        );
      });

      it("should send non-released vested tokens to the beneficiaryAccount, without sending vested tokens twice", async () => {
        await assertTokenBalanceEqualsTo(token, vesting.address, 1000);

        await time.advanceTimeByDays(2);

        await vesting.release().should.be.fulfilled;

        await assertTokenBalanceEqualsTo(token, beneficiaryAccount, 400);

        await assertTokenBalanceEqualsTo(token, vesting.address, 600);

        await time.advanceTimeByDays(1);

        await vesting.revoke({
          from: revokerAccount
        }).should.be.fulfilled;

        await assertTokenBalanceEqualsTo(token, vesting.address, 0);

        await assertTokenBalanceEqualsTo(token, beneficiaryAccount, 600);

        await assertTokenBalanceEqualsTo(
          token,
          revokedTokensDestinationAccount,
          400
        );
      });

      it("shouldn't send tokens to the beneficiaryAccount after a release", async () => {
        await assertTokenBalanceEqualsTo(token, vesting.address, 1000);

        await time.advanceTimeByDays(2);

        await vesting.release().should.be.fulfilled;

        await assertTokenBalanceEqualsTo(token, beneficiaryAccount, 400);

        await assertTokenBalanceEqualsTo(token, vesting.address, 600);

        await vesting.revoke({
          from: revokerAccount
        }).should.be.fulfilled;

        await assertTokenBalanceEqualsTo(token, vesting.address, 0);

        await assertTokenBalanceEqualsTo(token, beneficiaryAccount, 400);

        await assertTokenBalanceEqualsTo(
          token,
          revokedTokensDestinationAccount,
          600
        );
      });

      it("should be aware of changes to revokedTokensDestination", async () => {
        await assertTokenBalanceEqualsTo(token, vesting.address, 1000);

        await vesting.changeRevokedTokensDestination(otherAccount, {
          from: revokedTokensDestinationChangerAccount
        }).should.be.fulfilled;

        await vesting.revoke({
          from: revokerAccount
        }).should.be.fulfilled;

        await assertTokenBalanceEqualsTo(token, vesting.address, 0);

        await assertTokenBalanceEqualsTo(token, beneficiaryAccount, 0);

        await assertTokenBalanceEqualsTo(
          token,
          revokedTokensDestinationAccount,
          0
        );

        await assertTokenBalanceEqualsTo(token, otherAccount, 1000);
      });
    });

    describe("Revokation events", () => {
      let vesting;

      async function assertRevokationEventValues(
        totalTokens,
        revokedTokens,
        revokedTokensDestination
      ) {
        const { logs } = await vesting.revoke({
          from: revokerAccount
        }).should.be.fulfilled;
        assert.notEqual(logs.legth, 0);

        const event = logs.find(e => e.event === "Revoked");
        assert.notEqual(event, undefined);

        event.args.totalTokens.should.be.bignumber.equal(totalTokens);
        event.args.revokedTokens.should.be.bignumber.equal(revokedTokens);
        assert.equal(
          event.args.revokedTokensDestination,
          revokedTokensDestination
        );
      }

      beforeEach(async () => {
        vesting = await LinearDailyVesting.new(
          token.address,
          beneficiaryAccount,
          await time.getLatestBlockTime(),
          5,
          2,
          true,
          revokerAccount,
          revokedTokensDestinationAccount,
          revokedTokensDestinationChangerAccount
        ).should.be.fulfilled;

        await token.transfer(vesting.address, 1000);
      });

      it("should have everything as revoked tokens if nothing vested", async () => {
        await time.advanceTimeByDays(1);

        await assertRevokationEventValues(
          1000,
          1000,
          revokedTokensDestinationAccount
        );
      });

      it("shouldn't count non-released vested tokens as revoked", async () => {
        await time.advanceTimeByDays(2);
        await assertRevokationEventValues(
          1000,
          600,
          revokedTokensDestinationAccount
        );
      });

      it("shouldn't count non-released vested tokens as revoked tokens, with previous release", async () => {
        await time.advanceTimeByDays(2);
        await vesting.release().should.be.fulfilled;
        await time.advanceTimeByDays(1);

        await assertRevokationEventValues(
          1000,
          400,
          revokedTokensDestinationAccount
        );
      });

      it("shouldn't count inmediatly previous releaed tokens as revoked", async () => {
        await time.advanceTimeByDays(2);
        await vesting.release().should.be.fulfilled;

        await assertRevokationEventValues(
          1000,
          600,
          revokedTokensDestinationAccount
        );
      });

      it("should be aware of changes to revokedTokensDestination", async () => {
        await vesting.changeRevokedTokensDestination(otherAccount, {
          from: revokedTokensDestinationChangerAccount
        }).should.be.fulfilled;

        await assertRevokationEventValues(1000, 1000, otherAccount);
      });
    });

    describe("Non revokable contracts", () => {
      let vesting;

      beforeEach(async () => {
        vesting = await LinearDailyVesting.new(
          token.address,
          beneficiaryAccount,
          await time.getLatestBlockTime(),
          5,
          0,
          false,
          revokerAccount,
          revokedTokensDestinationAccount,
          revokedTokensDestinationChangerAccount
        ).should.be.fulfilled;

        await token.transfer(vesting.address, 1000);
      });

      it("shouldn't be able to revoke it", async () => {
        await vesting.revoke({
          from: revokerAccount
        }).should.be.rejected;
      });

      it("shouldn't be able to change the destionation of revoked tokens", async () => {
        await vesting.changeRevokedTokensDestination(otherAccount, {
          from: revokedTokensDestinationChangerAccount
        }).should.be.rejected;
      });

      it("shouldn't be able to change the destionation of revoked tokens's changer", async () => {
        await vesting.changeRevokedTokensDestinationChanger(otherAccount, {
          from: revokedTokensDestinationChangerAccount
        }).should.be.rejected;
      });
    });
  }
);
