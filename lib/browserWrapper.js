const puppeteer = require('puppeteer')
const headed = !!process.env.HEADED
const wrapPage = require('./pageWrapper')

async function openBrowser() {
  const br = await puppeteer.launch({
    headless: !headed,
    args: ['--window-size=1280,800', '--no-sandbox', '--disable-setuid-sandbox']
  })
  const browser = Object.create(br)

  browser.newPage = async function() {
    const pg = await br.newPage()
    pg.setViewport({ width: 1280, height: 800 })
    return wrapPage(pg)
  }
  browser.__newPage = browser.newPage
  browser.newPage = () => {
    throw new Error('Should not initiate page manually, use `global.page` instead')
  }

  return browser
}

module.exports = {
  openBrowser
}
