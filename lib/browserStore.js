const browserWrapper = require('./browserWrapper')
let browserPageMap = {}

module.exports.getPageFromBrowser = async (browserName = 'default') => {
  if (!browserPageMap[browserName]) {
    const browser = await browserWrapper.openBrowser()
    const page = await browser.__newPage()
    browserPageMap[browserName] = { browser, page }
  }

  return browserPageMap[browserName].page
}

module.exports.eachBrowserPageEntry = async (cb) => {
  const entries = Object.entries(browserPageMap)
  for (var i = 0; i < entries.length; i += 1) {
    const name = entries[i][0]
    const { browser, page } = entries[i][1]
    await cb(name, browser, page)
  }
}

module.exports.clearStore = () => {
  browserPageMap = {}
}
module.exports.getEntries = () => {
  console.log(Object.entries(browserPageMap))
  return Object.entries(browserPageMap)
}
