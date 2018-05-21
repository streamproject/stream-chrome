"use strict";

const BigNumber = web3.BigNumber;

require("chai")
  .use(require("chai-as-promised"))
  .use(require("chai-bignumber")(BigNumber))
  .should();

const STRToken = artifacts.require("../../contracts/token/STRToken.sol");
const STRTokenImplementation = artifacts.require(
  "../../contracts/token/STRTokenImplementation.sol"
);
const STRTokenProxy = artifacts.require(
  "../../contracts/token/STRTokenProxy.sol"
);

const TOTAL_SUPPLY = new BigNumber("10000000000").mul(1e18);

/**
 * This test file import's Open Zeppelin relevant tests to be sure that the
 * proxy doesn't break the token implementation.
 *
 * Note: assertJumps are commented out because they check that a throw generates
 * an invalid opcode. That's not true anymore. Byzantium changed it.
 */
contract("STRTokenProxy -- Imported tests", accounts => {
  describe("BasicToken tests", () => {
    let token;

    beforeEach(async () => {
      const tokenImplementation = await STRTokenImplementation.new();
      const proxy = await STRTokenProxy.new(
        accounts[0],
        tokenImplementation.address
      );
      token = STRToken.at(proxy.address);
    });

    it("should return the correct totalSupply after construction", async () => {
      let totalSupply = await token.totalSupply();

      totalSupply.should.be.bignumber.equal(TOTAL_SUPPLY);
    });

    it("should return correct balances after transfer", async () => {
      let transfer = await token.transfer(accounts[1], TOTAL_SUPPLY);

      let firstAccountBalance = await token.balanceOf(accounts[0]);
      assert.equal(firstAccountBalance, 0);

      let secondAccountBalance = await token.balanceOf(accounts[1]);
      secondAccountBalance.should.be.bignumber.equal(TOTAL_SUPPLY);
    });

    it("should throw an error when trying to transfer more than balance", async () => {
      try {
        let transfer = await token.transfer(accounts[1], TOTAL_SUPPLY.plus(1));
        assert.fail("should have thrown before");
      } catch (error) {
        //assertJump(error);
      }
    });

    it("should throw an error when trying to transfer to 0x0", async () => {
      try {
        let transfer = await token.transfer(0x0, TOTAL_SUPPLY);
        assert.fail("should have thrown before");
      } catch (error) {
        //assertJump(error);
      }
    });
  });

  describe("Ownable tests", () => {
    let ownable;

    beforeEach(async () => {
      const tokenImplementation = await STRTokenImplementation.new();
      const proxy = await STRTokenProxy.new(
        accounts[0],
        tokenImplementation.address
      );
      ownable = STRToken.at(proxy.address);
    });

    it("should have an owner", async () => {
      let owner = await ownable.owner();
      assert.isTrue(owner !== 0);
    });

    it("changes owner after transfer", async () => {
      let other = accounts[1];
      await ownable.transferOwnership(other);
      let owner = await ownable.owner();

      assert.isTrue(owner === other);
    });

    it("should prevent non-owners from transfering", async () => {
      const other = accounts[2];
      const owner = await ownable.owner.call();
      assert.isTrue(owner !== other);
      try {
        await ownable.transferOwnership(other, { from: other });
        assert.fail("should have thrown before");
      } catch (error) {
        //assertJump(error);
      }
    });

    it("should guard ownership against stuck state", async () => {
      let originalOwner = await ownable.owner();
      try {
        await ownable.transferOwnership(null, { from: originalOwner });
        assert.fail();
      } catch (error) {
        //assertJump(error);
      }
    });
  });

  describe("PausableToken tests", () => {
    let token;

    beforeEach(async () => {
      const tokenImplementation = await STRTokenImplementation.new();
      const proxy = await STRTokenProxy.new(
        accounts[0],
        tokenImplementation.address
      );
      token = STRToken.at(proxy.address);
    });

    it("should return paused false after construction", async () => {
      let paused = await token.paused();

      assert.equal(paused, false);
    });

    it("should return paused true after pause", async () => {
      await token.pause();
      let paused = await token.paused();

      assert.equal(paused, true);
    });

    it("should return paused false after pause and unpause", async () => {
      await token.pause();
      await token.unpause();
      let paused = await token.paused();

      assert.equal(paused, false);
    });

    it("should be able to transfer if transfers are unpaused", async () => {
      await token.transfer(accounts[1], TOTAL_SUPPLY);
      let balance0 = await token.balanceOf(accounts[0]);
      assert.equal(balance0, 0);

      let balance1 = await token.balanceOf(accounts[1]);
      balance1.should.be.bignumber.equal(TOTAL_SUPPLY);
    });

    it("should be able to transfer after transfers are paused and unpaused", async () => {
      await token.pause();
      await token.unpause();
      await token.transfer(accounts[1], TOTAL_SUPPLY);
      let balance0 = await token.balanceOf(accounts[0]);
      assert.equal(balance0, 0);

      let balance1 = await token.balanceOf(accounts[1]);
      balance1.should.be.bignumber.equal(TOTAL_SUPPLY);
    });

    it("should throw an error trying to transfer while transactions are paused", async () => {
      await token.pause();
      try {
        await token.transfer(accounts[1], TOTAL_SUPPLY);
        assert.fail("should have thrown before");
      } catch (error) {
        //assertJump(error);
      }
    });

    it("should throw an error trying to transfer from another account while transactions are paused", async () => {
      await token.pause();
      try {
        await token.transferFrom(accounts[0], accounts[1], TOTAL_SUPPLY);
        assert.fail("should have thrown before");
      } catch (error) {
        //assertJump(error);
      }
    });
  });

  describe("StandardToken tests", () => {
    let token;

    beforeEach(async () => {
      const tokenImplementation = await STRTokenImplementation.new();
      const proxy = await STRTokenProxy.new(
        accounts[0],
        tokenImplementation.address
      );
      token = STRToken.at(proxy.address);
    });

    it("should return the correct totalSupply after construction", async () => {
      let totalSupply = await token.totalSupply();

      totalSupply.should.be.bignumber.equal(TOTAL_SUPPLY);
    });

    it("should return the correct allowance amount after approval", async () => {
      await token.approve(accounts[1], TOTAL_SUPPLY);
      let allowance = await token.allowance(accounts[0], accounts[1]);

      allowance.should.be.bignumber.equal(TOTAL_SUPPLY);
    });

    it("should return correct balances after transfer", async () => {
      await token.transfer(accounts[1], TOTAL_SUPPLY);
      let balance0 = await token.balanceOf(accounts[0]);
      assert.equal(balance0, 0);

      let balance1 = await token.balanceOf(accounts[1]);
      balance1.should.be.bignumber.equal(TOTAL_SUPPLY);
    });

    it("should throw an error when trying to transfer more than balance", async () => {
      try {
        await token.transfer(accounts[1], TOTAL_SUPPLY.plus(1));
        assert.fail("should have thrown before");
      } catch (error) {
        //assertJump(error);
      }
    });

    it("should return correct balances after transfering from another account", async () => {
      await token.approve(accounts[1], TOTAL_SUPPLY);
      await token.transferFrom(accounts[0], accounts[2], TOTAL_SUPPLY, {
        from: accounts[1]
      });

      let balance0 = await token.balanceOf(accounts[0]);
      assert.equal(balance0, 0);

      let balance1 = await token.balanceOf(accounts[2]);
      balance1.should.be.bignumber.equal(TOTAL_SUPPLY);

      let balance2 = await token.balanceOf(accounts[1]);
      assert.equal(balance2, 0);
    });

    it("should throw an error when trying to transfer more than allowed", async () => {
      await token.approve(accounts[1], TOTAL_SUPPLY.sub(1));
      try {
        await token.transferFrom(accounts[0], accounts[2], TOTAL_SUPPLY, {
          from: accounts[1]
        });
        assert.fail("should have thrown before");
      } catch (error) {
        //assertJump(error);
      }
    });

    describe("validating allowance updates to spender", function() {
      let preApproved;

      it("should start with zero", async () => {
        preApproved = await token.allowance(accounts[0], accounts[1]);
        assert.equal(preApproved, 0);
      });

      it("should increase by 50 then decrease by 10", async () => {
        await token.increaseApproval(accounts[1], 50);
        let postIncrease = await token.allowance(accounts[0], accounts[1]);
        preApproved.plus(50).should.be.bignumber.equal(postIncrease);
        await token.decreaseApproval(accounts[1], 10);
        let postDecrease = await token.allowance(accounts[0], accounts[1]);
        postIncrease.minus(10).should.be.bignumber.equal(postDecrease);
      });
    });

    it("should throw an error when trying to transfer to 0x0", async () => {
      try {
        let transfer = await token.transfer(0x0, TOTAL_SUPPLY);
        assert.fail("should have thrown before");
      } catch (error) {
        //assertJump(error);
      }
    });

    it("should throw an error when trying to transferFrom to 0x0", async () => {
      await token.approve(accounts[1], TOTAL_SUPPLY);
      try {
        let transfer = await token.transferFrom(
          accounts[0],
          0x0,
          TOTAL_SUPPLY,
          {
            from: accounts[1]
          }
        );
        assert.fail("should have thrown before");
      } catch (error) {
        //assertJump(error);
      }
    });
  });
});
