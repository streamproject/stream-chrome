"use strict";

const BigNumber = web3.BigNumber;

require("chai")
  .use(require("chai-as-promised"))
  .use(require("chai-bignumber")(BigNumber))
  .should();

var keythereum = require("keythereum");
const ethUtil = require("ethereumjs-util");

const time = require("../helpers/time");
const events = require("../helpers/events");

const STRTokenImplementation = artifacts.require(
  "../../contracts/token/STRTokenImplementation.sol"
);

contract("STRTokenImplementation", ([owner, remoteAccount, remoteAccount2]) => {
  let token;
  let currentTime;
  let localPrivateKey;
  let localAddress;
  let nextNonce = 0;

  /**
   * This function returns increasing nonces to make the tests predictable. This
   * is not recommended for actual usage if there's more than one source of
   * signed transfers, as race conditions can be triggered. Note however that
   * this already happens with actual Ethereum transactions.
   */
  function getNonce() {
    return nextNonce++;
  }

  function sendSignedTransaction() {}

  beforeEach(async () => {
    token = await STRTokenImplementation.new();

    await token.transfer(remoteAccount, 1000000);

    localPrivateKey = keythereum.create().privateKey;
    localAddress = ethUtil.bufferToHex(
      ethUtil.privateToAddress(localPrivateKey)
    );

    await token.transfer(localAddress, 2000000);

    currentTime = await time.getLatestBlockTime();
  });

  describe("Signed transfer", () => {
    it("should work with an unused nonce and the right signature", async () => {
      (await token.balanceOf(remoteAccount)).should.be.bignumber.equal(1000000);
      (await token.balanceOf(localAddress)).should.be.bignumber.equal(2000000);

      const nonce = getNonce();

      const messageToSign = await token.getSignableTransfer(
        localAddress,
        remoteAccount,
        123,
        currentTime + 1000,
        nonce
      );

      const signature = ethUtil.ecsign(
        ethUtil.toBuffer(messageToSign),
        localPrivateKey
      );

      const transaction = await token.signedTransfer(
        localAddress,
        remoteAccount,
        123,
        currentTime + 1000,
        nonce,
        signature.v,
        ethUtil.bufferToHex(signature.r),
        ethUtil.bufferToHex(signature.s)
      ).should.be.fulfilled;

      const event = events.getEvent(transaction, "Transfer");
      assert.notEqual(event, undefined);

      assert.equal(event.args.from, localAddress);
      assert.equal(event.args.to, remoteAccount);
      event.args.value.should.be.bignumber.equal(123);

      (await token.balanceOf(remoteAccount)).should.be.bignumber.equal(1000123);
      (await token.balanceOf(localAddress)).should.be.bignumber.equal(1999877);
    });

    it("shouldn't work with an invalid signature", async () => {
      const nonce = getNonce();

      const messageToSign = await token.getSignableTransfer(
        localAddress,
        remoteAccount,
        123,
        currentTime + 1000,
        nonce
      );

      const signature = ethUtil.ecsign(
        ethUtil.toBuffer(messageToSign),
        localPrivateKey
      );

      await token.signedTransfer(
        localAddress,
        remoteAccount,
        123,
        currentTime + 1000,
        nonce,
        10000, // THIS IS WRONG
        ethUtil.bufferToHex(signature.r),
        ethUtil.bufferToHex(signature.s)
      ).should.be.rejected;
    });

    it("shouldn't work with invalid params and the right signature", async () => {
      const nonce = getNonce();

      const messageToSign = await token.getSignableTransfer(
        localAddress,
        remoteAccount,
        123,
        currentTime + 1000,
        nonce
      );

      const signature = ethUtil.ecsign(
        ethUtil.toBuffer(messageToSign),
        localPrivateKey
      );

      await token.signedTransfer(
        // The next two params have been swapped
        remoteAccount,
        localAddress,
        123,
        currentTime + 1000,
        nonce,
        signature.v,
        ethUtil.bufferToHex(signature.r),
        ethUtil.bufferToHex(signature.s)
      ).should.be.rejected;
    });

    it("shouldn't work after expiration", async () => {
      const nonce = getNonce();

      const messageToSign = await token.getSignableTransfer(
        localAddress,
        remoteAccount,
        123,
        currentTime + 1000,
        nonce
      );

      const signature = ethUtil.ecsign(
        ethUtil.toBuffer(messageToSign),
        localPrivateKey
      );

      await time.advanceTimeBySeconds(1100);

      await token.signedTransfer(
        localAddress,
        remoteAccount,
        123,
        currentTime + 1000,
        nonce,
        signature.v,
        ethUtil.bufferToHex(signature.r),
        ethUtil.bufferToHex(signature.s)
      ).should.be.rejected;
    });

    it("shouldn't accept the same signed transfer more than once", async () => {
      const nonce = getNonce();

      const messageToSign = await token.getSignableTransfer(
        localAddress,
        remoteAccount,
        123,
        currentTime + 1000,
        nonce
      );

      const signature = ethUtil.ecsign(
        ethUtil.toBuffer(messageToSign),
        localPrivateKey
      );

      await token.signedTransfer(
        localAddress,
        remoteAccount,
        123,
        currentTime + 1000,
        nonce,
        signature.v,
        ethUtil.bufferToHex(signature.r),
        ethUtil.bufferToHex(signature.s)
      ).should.be.fulfilled;

      await token.signedTransfer(
        localAddress,
        remoteAccount,
        123,
        currentTime + 1000,
        nonce,
        signature.v,
        ethUtil.bufferToHex(signature.r),
        ethUtil.bufferToHex(signature.s)
      ).should.be.rejected;

      await token.signedTransfer(
        localAddress,
        remoteAccount,
        123,
        currentTime + 1000,
        nonce,
        signature.v,
        ethUtil.bufferToHex(signature.r),
        ethUtil.bufferToHex(signature.s)
      ).should.be.rejected;
    });

    it("shouldn't work with an used nonce", async () => {
      const nonce = getNonce();

      const messageToSign = await token.getSignableTransfer(
        localAddress,
        remoteAccount,
        123,
        currentTime + 1000,
        nonce
      );

      const signature = ethUtil.ecsign(
        ethUtil.toBuffer(messageToSign),
        localPrivateKey
      );

      await token.signedTransfer(
        localAddress,
        remoteAccount,
        123,
        currentTime + 1000,
        nonce,
        signature.v,
        ethUtil.bufferToHex(signature.r),
        ethUtil.bufferToHex(signature.s)
      ).should.be.fulfilled;

      currentTime = await time.getLatestBlockTime();

      const messageToSign2 = await token.getSignableTransfer(
        localAddress,
        remoteAccount2,
        1000,
        currentTime + 100,
        nonce
      );

      const signature2 = ethUtil.ecsign(
        ethUtil.toBuffer(messageToSign2),
        localPrivateKey
      );

      await token.signedTransfer(
        localAddress,
        remoteAccount2,
        1000,
        currentTime + 100,
        nonce,
        signature2.v,
        ethUtil.bufferToHex(signature2.r),
        ethUtil.bufferToHex(signature2.s)
      ).should.be.rejected;
    });
  });
});
