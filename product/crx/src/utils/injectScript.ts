// https://stackoverflow.com/questions/15730869/my-injected-script-runs-after-the-target-pages-javascript-despite-using-run
// TODO: Use textContext for faster loading https://github.com/MetaMask/metamask-extension/blob/master/app/scripts/contentscript.js#L30
// For now, if scripts are loaded via filePath, it'll execute async, i.e. much later than metamask.
export const injectScript = (script: {filePath?: string, code?: string}) => {
  const s = document.createElement('script')

  if (script.filePath) {
    s.setAttribute('type', 'text/javascript')
    s.setAttribute('src', script.filePath)
  } else if (script.code) {
    s.textContent = script.code
  }

  const container = document.head || document.documentElement
  container.appendChild(s)

  s.onload = () => s.parentNode.removeChild(s)
}
