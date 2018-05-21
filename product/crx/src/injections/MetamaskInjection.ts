import { BigNumber } from 'bignumber.js'
import { StrTokenUtils } from 'shared/dist/str'
import { ISTRTokenImplementation } from 'shared/dist/str/StrTokenUtils'
import Web3 = require('web3')
import { EventLog } from 'web3/types'
import * as StrTokenActions from '../actions/StrTokenActions'
import { STR_TOKEN_ADDRESS } from '../constants/config'
import { injectionToContent } from '../utils/ContentProxyUtils'
import * as MetamaskUtils from '../utils/MetamaskUtils'

let web3: Web3
let strToken: ISTRTokenImplementation
let address: string

// TODO: Only store/request these from the crx for better perf.
let from: EventLog[] = []
let to: EventLog[] = []
let latest: number = 0
let lastBlockNumber: number = 0

const WEB3_POLLING_INTERVAL = 500

// Web3 only loads once, on page load. If the user changes the web3 provider
// via metamask, it'll reload the page. So no need to poll (or listen for)
// changes.
function fetchAndUpdateWeb3() {
  try {
    web3 = MetamaskUtils.getMetaMaskWeb3()
    strToken = StrTokenUtils.getStrToken(web3, STR_TOKEN_ADDRESS)
    injectionToContent(StrTokenActions.fromInjectionMessageCreators.updateWeb3Exists(true))
  } catch (e) {
    injectionToContent(StrTokenActions.fromInjectionMessageCreators.updateWeb3Exists(false))
  }

}

async function fetchAndUpdateAddress(): Promise<boolean> {
  const accounts = await web3.eth.getAccounts()
  if (accounts[0] !== address) {
    address = accounts[0]
    return true
  } else if (accounts.length === 0) {
    injectionToContent(StrTokenActions.fromInjectionMessageCreators.updateWallet('', null))
    return false
  }

  return false
}

async function fetchAndUpdateWallet() {
  const balance = address ? new BigNumber(await strToken.methods.balanceOf(address).call()) : new BigNumber(0)
  injectionToContent(StrTokenActions.fromInjectionMessageCreators.updateWallet(address, balance))
  return
}

async function fetchAndUpdateTxs(fromBlock: number, toBlock: number) {
  const fromTxs = strToken.getPastEvents('Transfer', { fromBlock, toBlock, filter: { from: address } })
  const toTxs = strToken.getPastEvents('Transfer', { fromBlock, toBlock, filter: { to: address } })

  // race condition?
  from = [...from, ...(await fromTxs)]
  to = [...to, ...(await toTxs)]

  injectionToContent(StrTokenActions.fromInjectionMessageCreators.updateTxEvents(from, to))
}

async function initialize() {
  await fetchAndUpdateAddress()
  await fetchAndUpdateWallet()

  from = []
  to = []
  latest = await web3.eth.getBlockNumber()

  await fetchAndUpdateTxs(0, latest)
  lastBlockNumber = latest + 1
}

async function setupPollingUpdaters() {
  // Once metamask supports websockets, we can set up a proper eventEmitter listener instead...
  // https://github.com/MetaMask/metamask-extension/issues/1645
  setInterval(async () => {
    if (document.hidden) { return }

    const addressChanged = await fetchAndUpdateAddress()
    await fetchAndUpdateWallet()

    latest = await web3.eth.getBlockNumber()
    if (addressChanged) {
      from = []
      to = []
      await fetchAndUpdateTxs(0, latest)
      lastBlockNumber = latest + 1
    } else if (latest >= lastBlockNumber) {
      await fetchAndUpdateTxs(lastBlockNumber, latest)
      lastBlockNumber = latest + 1
    }
 }, WEB3_POLLING_INTERVAL)
}

function setup() {
  fetchAndUpdateWeb3()

  if (web3) {
    initialize()
    setupPollingUpdaters()
  }
}

setup()
