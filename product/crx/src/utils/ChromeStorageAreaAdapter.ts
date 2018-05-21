import { AdapterCallback, StorageAdapter } from 'redux-localstorage'

export default (storage: chrome.storage.StorageArea): StorageAdapter<chrome.storage.StorageArea> => ({
  0: storage,

  put(key: string, value: any, callback: AdapterCallback) {
    storage.set({ [key]: value }, callback)
  },

  get(key: string, callback: AdapterCallback) {
    try {
      storage.get(key, (items) => { callback(null, items[key]) })
    } catch (e) {
      callback(e)
    }
  },

  del(key: string, callback: AdapterCallback) {
    storage.remove(key, callback)
  },
})
