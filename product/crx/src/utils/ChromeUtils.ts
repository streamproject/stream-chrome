export async function getCurrentTab() {
  const tab = new Promise<chrome.tabs.Tab>((resolve, reject) => {
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
      resolve(tabs[0])
    })
  })

  return tab
}
