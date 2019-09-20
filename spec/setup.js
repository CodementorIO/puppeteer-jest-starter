const browserStore = require('../lib/browserStore')
const mkdirp = require('util').promisify(require('mkdirp'))
const fs = require('fs')

/* eslint-env jest */
jest.setTimeout(120 * 1000)

beforeEach(async () => {
  browserStore.clearStore()
  global.page = await browserStore.getPageFromBrowser('default')
})
afterEach(async () => {
  await browserStore.eachBrowserPageEntry(async (name, browser, page) => {
    await browser.close()
  })
})

const orgIt = global.it
global.it = (description, test, timeout) => {
  orgIt(
    description,
    async () => {
      try {
        return await test()
      } catch (e) {
        await browserStore.eachBrowserPageEntry(async (name, browser, page) => {
          await screenshot(page, description, name)
          await failedDetail(page, description, name)
        })
        throw e
      }
    },
    timeout
  )
}
global.it.skip = orgIt.skip

async function screenshot(page, description, browserName) {
  try {
    const path = await imagePath(description, browserName)
    await page.screenshot({
      fullPage: true,
      type: 'jpeg',
      path
    })
  } catch (e) {
    console.log('taking screen shot failed')
    console.log(e)
  }
}

async function failedDetail(page, description, browserName) {
  try {
    const path = await detailPath(description, browserName)
    const details = {
      url: page.url(),
      description: description,
      consoleMessages: global.page.__getConsoleMessages()
    }
    fs.writeFileSync(path, JSON.stringify(details))
  } catch (e) {
    console.log('save detail json failed')
    console.log(e)
  }
}

async function imagePath(description, browserName) {
  const folderName = process.env.CI ? '/tmp/screenshots' : 'screenshots'
  await mkdirp(folderName)
  const fileName = kebabString(description)

  return `${folderName}/${fileName}-${browserName}.jpg`
}

async function detailPath(description, browserName) {
  const folderName = process.env.CI ? '/tmp/failedDetails' : 'failedDetails'
  await mkdirp(folderName)
  const fileName = kebabString(description)

  return `${folderName}/${fileName}-${browserName}.json`
}

function kebabString(str) {
  return str.replace(/\W+/g, '-')
}
