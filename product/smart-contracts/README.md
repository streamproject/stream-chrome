# Stream smart contracts

This folder contains the initial version of Stream smart contracts. That includes its upgradable ERC20 token and a tokens vesting contract.

## Installation

To install all the dependecies just run `npm install`.

## Truffle and Solc versions

This project is developed using [Truffle](http://truffleframework.com/). Please use the local installation to keep in sync with its version. This is specially important because the version of `truffle` you use also dictates which version of `solc` you use.

Just use [npx](https://github.com/zkat/npx) to run truffle (`npx truffle ...`) and the local version will be used. Note that you don't have to install any extra package, as `npx` is already bundled in `npm`  (`npm@5.2.0` and newer).

## Running the tests

To run the tests just use `npx truffle test`.

## Deployment

To deploy the token and distribute it to all the stake holders edit `scripts/truffle-deploy-script.js` to set the scorrect parameters and run `scripts/deploy.sh`. You should have a node running on `localhost:8545` or set up the net `deploymentNode` in `truffle.js`.

Note that `eth.accounts[0]` account is used to deploy the contracts, so make sure that it has enough funds.

The script will deploy the token, which has a fixed supply, and will send tokens to all the stake holders as configured in `script/truffle-deply-script.js`. All remaining tokens will be sent to the account set as STREAM_COLD_WALLET. After running, the token will be owned by STREAM_MANAGER_WALLET, and the token proxy admin will be STREAM_FROZEN_WALLET.


