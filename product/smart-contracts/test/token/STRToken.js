"use strict";

const BigNumber = web3.BigNumber;

require("chai")
  .use(require("chai-as-promised"))
  .use(require("chai-bignumber")(BigNumber))
  .should();

const STRTokenImplementation = artifacts.require(
  "../../contracts/token/STRTokenImplementation.sol"
);
const NormalToken = artifacts.require("./mocks/NormalToken.sol");

contract("STRToken", ([owner, other]) => {
  let token;

  beforeEach(async () => {
    token = await STRTokenImplementation.new();
  });

  describe("token description", () => {
    it("should have the right values", async () => {
      assert.equal(await token.name(), "Stream Token");
      assert.equal(await token.symbol(), "STR");
      assert.equal(await token.decimals(), 18);
    });

    it("should work with an abi from another contract", async () => {
      const asNormalToken = NormalToken.at(token.address);

      assert.equal(await asNormalToken.name(), "Stream Token");
      assert.equal(await asNormalToken.symbol(), "STR");
      assert.equal(await asNormalToken.decimals(), 18);
    });
  });

  describe("proxy changes", () => {
    it("shouldn't let anyone call migrateStorage, its for the proxy", async () => {
      await token.migrateStorage([], { from: owner }).should.be.rejected;
      await token.migrateStorage([], { from: other }).should.be.rejected;
    });
  });
});
