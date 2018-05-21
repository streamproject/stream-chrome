export const RFERESH_TOKEN = 'REFRESH_TOKEN'
export const ACCESS_TOKEN = 'ACCESS_TOKEN'

export type tokenTypes = typeof RFERESH_TOKEN | typeof ACCESS_TOKEN

export function getToken(token: tokenTypes) {
  return new Promise(async (resolve, reject) => {
    await chrome.storage.local.get(token, (results) => { resolve(results[token]) })
  })
}

export function setToken(token: tokenTypes, value: string) {
  return new Promise(async (resolve, reject) => {
    await chrome.storage.local.set({ [token]: value }, () => { resolve() })
  })
}

export function removeToken(token: tokenTypes) {
  return new Promise(async (resolve, reject) => {
    await chrome.storage.local.remove(token, () => { resolve() })
  })
}
