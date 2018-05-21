const { promisify } = require("util");

module.exports = {
  getLatestBlockTime() {
    return new Promise((resolve, reject) => {
      web3.eth.getBlock("latest", (err, block) => {
        if (err) {
          return reject(err);
        }

        resolve(block.timestamp);
      });
    });
  },

  advanceTimeBySeconds(seconds) {
    return new Promise((resolve, reject) => {
      web3.currentProvider.sendAsync(
        {
          id: 99999,
          jsonrpc: "2.0",
          method: "evm_increaseTime",
          params: [seconds]
        },
        err => {
          if (err) {
            return reject(err);
          }

          web3.currentProvider.sendAsync(
            {
              id: 100000,
              jsonrpc: "2.0",
              method: "evm_mine"
            },
            err2 => {
              if (err2) {
                return reject(err2);
              }

              resolve();
            }
          );
        }
      );
    });
  },

  async advanceTimeByMinutes(minutes) {
    return await this.advanceTimeBySeconds(minutes * 60);
  },

  async advanceTimeByHours(hours) {
    return await this.advanceTimeByMinutes(hours * 60);
  },

  async advanceTimeByDays(days) {
    return await this.advanceTimeByHours(days * 24);
  },

  async goToNextDay() {
    const currentTime = await this.getLatestBlockTime();
    const today = Math.ceil(currentTime / (24 * 3600));
    const tomorrow = today + 1;
    const tomorrowInSeconds = tomorrow * 24 * 3600;

    await this.advanceTimeBySeconds(tomorrowInSeconds - currentTime);
  }
};
