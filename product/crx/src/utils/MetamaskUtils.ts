import { CrxErrors } from 'shared/dist/models/Errors'
import Web3 = require('web3')

let myWeb3: Web3

export function getMetaMaskWeb3() {
  if (myWeb3) {
    return myWeb3
  } else {
    const metaMaskWeb3Instance = (window as any).web3

    if (metaMaskWeb3Instance) {
      myWeb3 = new Web3(metaMaskWeb3Instance.currentProvider)
      return myWeb3
    }
  }

  throw new Error(CrxErrors.METAMASK_OFF)
}
