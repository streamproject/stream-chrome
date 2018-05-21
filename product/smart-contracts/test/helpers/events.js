module.exports = {
  getEvent(transaction, eventName) {
    return transaction.logs.find(e => e.event === eventName);
  }
};
