"use strict";

const BigNumber = web3.BigNumber;

require("chai")
  .use(require("chai-as-promised"))
  .use(require("chai-bignumber")(BigNumber))
  .should();

const { getEvent } = require("../helpers/events");

const STRToken = artifacts.require("../../contracts/token/STRToken.sol");
const STRTokenImplementation = artifacts.require(
  "../../contracts/token/STRTokenImplementation.sol"
);
const STRTokenProxy = artifacts.require(
  "../../contracts/token/STRTokenProxy.sol"
);
const TokenMock = artifacts.require("./mocks/TokenMock.sol");
const EmptyContract = artifacts.require("./mocks/EmptyContract.sol");

const TOTAL_SUPPLY = new BigNumber("10000000000").mul(1e18);

contract("STRTokenProxy", ([deployerAccount, adminAccount, otherAccount]) => {
  let token;

  beforeEach(async () => {
    token = await STRTokenImplementation.new();
  });

  describe("constructor", () => {
    it("should copy the state of the implementation on construction", async () => {
      const proxy = await STRTokenProxy.new(deployerAccount, token.address);
      const proxiedToken = STRToken.at(proxy.address);

      const realOwner = await token.owner();
      const owner = await proxiedToken.owner();
      assert.equal(owner, realOwner);

      const realPaused = await token.paused();
      const paused = await proxiedToken.paused();
      assert.equal(paused, realPaused);

      const realTotalSupply = await token.totalSupply();
      const totalSupply = await token.totalSupply();
      totalSupply.should.be.bignumber.equal(realTotalSupply);

      const realOwnerBalance = await token.balanceOf(owner);
      const ownerBalance = await token.balanceOf(owner);
      ownerBalance.should.be.bignumber.equal(realOwnerBalance);

      //Note: this test can get outdated easily, but the proxy will only be
      //deployed using the current version of the token.
    });

    it("should set the admin and implementation on construction", async () => {
      const proxy = await STRTokenProxy.new(adminAccount, token.address);

      assert.equal(await proxy.admin(), adminAccount);
      assert.equal(await proxy.implementation(), token.address);
    });

    it("should be possible to construct it with an admin different from the owner", async () => {
      const proxy = await STRTokenProxy.new(adminAccount, token.address);
      const proxiedToken = STRToken.at(proxy.address);

      const owner = await proxiedToken.owner();
      const admin = await proxy.admin();

      assert.notEqual(owner, admin);
    });

    it("should be possible to construct it with an admin equal to the owner", async () => {
      const proxy = await STRTokenProxy.new(deployerAccount, token.address);
      const proxiedToken = STRToken.at(proxy.address);

      const owner = await proxiedToken.owner();
      const admin = await proxy.admin();

      assert.equal(owner, admin);
    });

    it("shouldn't be possible to construct it with 0 as admin", async () => {
      await STRTokenProxy.new("0x0", token.address).should.be.rejected;
    });

    it("shouldn't be possible to construct it with 0 as implementation", async () => {
      await STRTokenProxy.new(adminAccount, "0x0").should.be.rejected;
    });

    it("shouldn't be possible to construct it with an account without code as implementation", async () => {
      await STRTokenProxy.new(adminAccount, otherAccount).should.be.rejected;
    });
  });

  describe("proxy functionality", () => {
    it("should be possible to call the proxy's own functions", async () => {
      const proxy = await STRTokenProxy.new(adminAccount, token.address);
      const admin = await proxy.admin();

      assert.equal(admin, adminAccount);
    });

    it("should be possible to call the proxied token's functions", async () => {
      const proxy = await STRTokenProxy.new(adminAccount, token.address);
      const proxiedToken = STRToken.at(proxy.address);
      const owner = await proxiedToken.owner();

      assert.equal(owner, deployerAccount);
    });

    it("should be possible to call the proxied token's fallback function", async () => {
      const token = await TokenMock.new();
      const proxy = await STRTokenProxy.new(adminAccount, token.address);
      const proxiedToken = TokenMock.at(proxy.address);

      assert.equal(await proxiedToken.fallbackFunctionCalled(), false);

      await proxiedToken.send(0).should.be.fulfilled;
      assert.equal(await proxiedToken.fallbackFunctionCalled(), true);
    });
  });

  describe("admin settings", () => {
    it("shouldn't let the admin assign other account as admin", async () => {
      const proxy = await STRTokenProxy.new(adminAccount, token.address);

      assert.equal(await proxy.admin(), adminAccount);

      await proxy.changeAdmin(otherAccount, { from: adminAccount }).should.be
        .fulfilled;

      assert.equal(await proxy.admin(), otherAccount);
    });

    it("shouldn't let non-admins change the admin", async () => {
      const proxy = await STRTokenProxy.new(adminAccount, token.address);
      await proxy.changeAdmin(otherAccount).should.be.rejected;
    });

    it("shouldn't accept 0 as a new admin", async () => {
      const proxy = await STRTokenProxy.new(adminAccount, token.address);
      await proxy.changeAdmin("0x0", { from: adminAccount }).should.be.rejected;
    });

    it("shouldn't change the owner when changing the admin", async () => {
      const proxy = await STRTokenProxy.new(adminAccount, token.address);
      const proxiedToken = STRToken.at(proxy.address);

      assert.equal(await proxiedToken.owner(), deployerAccount);
      assert.equal(await proxy.admin(), adminAccount);

      await proxy.changeAdmin(otherAccount, { from: adminAccount }).should.be
        .fulfilled;

      assert.equal(await proxiedToken.owner(), deployerAccount);
      assert.equal(await proxy.admin(), otherAccount);
    });

    it("shouldn't change the admin when changing the owner", async () => {
      const proxy = await STRTokenProxy.new(adminAccount, token.address);
      const proxiedToken = STRToken.at(proxy.address);

      assert.equal(await proxiedToken.owner(), deployerAccount);
      assert.equal(await proxy.admin(), adminAccount);

      await proxiedToken.transferOwnership(otherAccount).should.be.fulfilled;

      assert.equal(await proxiedToken.owner(), otherAccount);
      assert.equal(await proxy.admin(), adminAccount);
    });

    it("should emit an AdminChanged event when its changed", async () => {
      const proxy = await STRTokenProxy.new(adminAccount, token.address);
      const proxiedToken = STRToken.at(proxy.address);

      const transaction = await proxy.changeAdmin(otherAccount, {
        from: adminAccount
      }).should.be.fulfilled;

      const event = getEvent(transaction, "AdminChanged");

      assert.notEqual(event, undefined);
      assert.equal(event.args.previous, adminAccount);
      assert.equal(event.args.current, otherAccount);
    });
  });

  describe("Token upgrades", () => {
    it("shouldn't let non-admins change the implementation", async () => {
      const proxy = await STRTokenProxy.new(adminAccount, token.address);
      const tokenMock = await TokenMock.new();
      await proxy.changeTokenImplementation(tokenMock.address, "0x00").should.be
        .rejected;
    });

    it("should let the admin change the implementation", async () => {
      const proxy = await STRTokenProxy.new(adminAccount, token.address);
      const tokenMock = await TokenMock.new();
      await proxy.changeTokenImplementation(tokenMock.address, "0x00", {
        from: adminAccount
      }).should.be.fulfilled;
    });

    it("should pass the migration data to the implementation's migrateSorage", async () => {
      const proxy = await STRTokenProxy.new(adminAccount, token.address);
      const tokenMock = await TokenMock.new();

      const data =
        "0x0102030405060708091011121314151617181920212223242526272829303132";

      await proxy.changeTokenImplementation(tokenMock.address, data, {
        from: adminAccount
      }).should.be.fulfilled;

      const asTokenMock = TokenMock.at(proxy.address);

      assert.equal(await asTokenMock.dataFromMigration(), data);
    });

    it("shouldn't let 0 be as a new implementation", async () => {
      const proxy = await STRTokenProxy.new(adminAccount, token.address);
      await proxy.changeTokenImplementation("0x0", "0x00", {
        from: adminAccount
      }).should.be.rejected;
    });

    it("shouldn't let non-contract addresses be as a new implementation", async () => {
      const proxy = await STRTokenProxy.new(adminAccount, token.address);
      await proxy.changeTokenImplementation(otherAccount, "0x00", {
        from: adminAccount
      }).should.be.rejected;
    });

    it("should fail if trying to upgrade to the same implementation more than once", async () => {
      const proxy = await STRTokenProxy.new(adminAccount, token.address);
      await proxy.changeTokenImplementation(token.address, "0x00", {
        from: adminAccount
      }).should.be.rejected;
    });

    it("should call migrateStorage after an upgrade", async () => {
      const proxy = await STRTokenProxy.new(adminAccount, token.address);

      const tokenMock = await TokenMock.new();

      await proxy.changeTokenImplementation(tokenMock.address, "0x00", {
        from: adminAccount
      }).should.be.fulfilled;

      const proxiedToken = TokenMock.at(proxy.address);
      assert.equal(await proxiedToken.storageInitialized(), true);
    });

    it("should let the admin change functions' logic", async () => {
      const proxy = await STRTokenProxy.new(adminAccount, token.address);
      let proxiedToken = STRToken.at(proxy.address);

      assert.equal(await proxiedToken.paused(), false);

      await proxiedToken.pause().should.be.fulfilled;
      assert.equal(await proxiedToken.paused(), true);

      await proxiedToken.unpause().should.be.fulfilled;
      assert.equal(await proxiedToken.paused(), false);

      const tokenMock = await TokenMock.new();

      await proxy.changeTokenImplementation(tokenMock.address, "0x00", {
        from: adminAccount
      }).should.be.fulfilled;

      proxiedToken = TokenMock.at(proxy.address);

      assert.equal(await proxiedToken.overriddenPauseCalled(), false);
      await proxiedToken.pause().should.be.fulfilled;

      assert.equal(await proxiedToken.overriddenPauseCalled(), true);
      assert.equal(await proxiedToken.paused(), false);
    });

    it("should let the admin add functions", async () => {
      const proxy = await STRTokenProxy.new(adminAccount, token.address);
      let proxiedToken = STRToken.at(proxy.address);

      const tokenMock = await TokenMock.new();

      await proxy.changeTokenImplementation(tokenMock.address, "0x00", {
        from: adminAccount
      }).should.be.fulfilled;

      proxiedToken = TokenMock.at(proxy.address);

      assert.equal(await proxiedToken.newFunctionCalled(), false);
      await proxiedToken.newFunction().should.be.fulfilled;
      assert.equal(await proxiedToken.newFunctionCalled(), true);
    });

    it("should let the admin redefine the fallback function", async () => {
      const proxy = await STRTokenProxy.new(adminAccount, token.address);
      let proxiedToken = STRToken.at(proxy.address);

      // The STRToken doesn't have a payable fallback function
      await proxiedToken.send(0).should.be.rejected;

      const tokenMock = await TokenMock.new();

      await proxy.changeTokenImplementation(tokenMock.address, "0x00", {
        from: adminAccount
      }).should.be.fulfilled;

      proxiedToken = TokenMock.at(proxy.address);

      assert.equal(await proxiedToken.fallbackFunctionCalled(), false);

      await proxiedToken.send(0).should.be.fulfilled;
      assert.equal(await proxiedToken.fallbackFunctionCalled(), true);
    });

    it("should let the admin remove a function", async () => {
      const proxy = await STRTokenProxy.new(adminAccount, token.address);
      let proxiedToken = STRToken.at(proxy.address);

      assert.equal(await proxiedToken.paused(), false);

      const emptyContract = await EmptyContract.new();

      await proxy.changeTokenImplementation(emptyContract.address, "0x00", {
        from: adminAccount
      }).should.be.fulfilled;

      await proxiedToken.pause().should.be.rejected;
    });

    it("should let the admin upgrade the token multiple times", async () => {
      const proxy = await STRTokenProxy.new(adminAccount, token.address);
      let proxiedToken = STRToken.at(proxy.address);

      assert.equal(await proxiedToken.paused(), false);

      const emptyContract = await EmptyContract.new();

      await proxy.changeTokenImplementation(emptyContract.address, "0x00", {
        from: adminAccount
      }).should.be.fulfilled;

      await proxiedToken.pause().should.be.rejected;

      const tokenMock = await TokenMock.new();

      await proxy.changeTokenImplementation(tokenMock.address, "0x00", {
        from: adminAccount
      }).should.be.fulfilled;

      proxiedToken = TokenMock.at(proxy.address);

      await proxiedToken.send(0).should.be.fulfilled;
      assert.equal(await proxiedToken.fallbackFunctionCalled(), true);
    });

    it("should preserve the state between upgrades", async () => {
      const proxy = await STRTokenProxy.new(adminAccount, token.address);
      let proxiedToken = STRToken.at(proxy.address);

      await proxiedToken.transfer("0x1", 1).should.be.fulfilled;
      await proxiedToken.approve("0x1", 1).should.be.fulfilled;

      assert.equal(await proxy.admin(), adminAccount);

      let totalSupply = await proxiedToken.totalSupply();
      totalSupply.should.be.bignumber.equal(TOTAL_SUPPLY);

      let balanceOf1 = await proxiedToken.balanceOf("0x1");
      balanceOf1.should.be.bignumber.equal(1);

      let balanceOfOwner = await proxiedToken.balanceOf(deployerAccount);
      balanceOfOwner.should.be.bignumber.equal(TOTAL_SUPPLY.sub(1));

      let allowance = await proxiedToken.allowance(deployerAccount, "0x1");
      allowance.should.be.bignumber.equal(1);

      assert.equal(await proxiedToken.owner(), deployerAccount);

      assert.equal(await proxiedToken.paused(), false);

      const tokenMock = await TokenMock.new();

      await proxy.changeTokenImplementation(tokenMock.address, "0x00", {
        from: adminAccount
      }).should.be.fulfilled;

      proxiedToken = TokenMock.at(proxy.address);

      assert.equal(await proxy.admin(), adminAccount);

      totalSupply = await proxiedToken.totalSupply();
      totalSupply.should.be.bignumber.equal(TOTAL_SUPPLY);

      balanceOf1 = await proxiedToken.balanceOf("0x1");
      balanceOf1.should.be.bignumber.equal(1);

      balanceOfOwner = await proxiedToken.balanceOf(deployerAccount);
      balanceOfOwner.should.be.bignumber.equal(TOTAL_SUPPLY.sub(1));

      allowance = await proxiedToken.allowance(deployerAccount, "0x1");
      allowance.should.be.bignumber.equal(1);

      assert.equal(await proxiedToken.owner(), deployerAccount);

      assert.equal(await proxiedToken.paused(), false);
    });

    it("should emit an ImplementationChanged event when its changed", async () => {
      const proxy = await STRTokenProxy.new(adminAccount, token.address);
      const proxiedToken = STRToken.at(proxy.address);

      const tokenMock = await TokenMock.new();

      const transaction = await proxy.changeTokenImplementation(
        tokenMock.address,
        "0x00",
        {
          from: adminAccount
        }
      ).should.be.fulfilled;

      const event = getEvent(transaction, "ImplementationChanged");

      assert.notEqual(event, undefined);
      assert.equal(event.args.previous, token.address);
      assert.equal(event.args.current, tokenMock.address);
    });
  });
});
