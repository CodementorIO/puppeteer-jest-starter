const { wrapErrorHandler } = require('lib/driverUtils')
const { getPageFromBrowser } = require('lib/browserStore')

describe('Demo', () => {
  it('goes to google', async () => {
    const driver = createPageDriver(page)
    await driver.goToPage()
  })
  it('manipulates multiple browsers', async ()=> {
    const page2 = await getPageFromBrowser('page2')
    const driver1 = createPageDriver(page)
    const driver2 = createPageDriver(page2)

    await driver1.goToPage()
    await driver2.goToPage()
  })
  xit('fails with proper error message', async ()=> {
    const driver = createPageDriver(page)
    await driver.goToPage()
    await driver.clickNonExistingSignupButton()
  })
})

function createPageDriver (page) {
  return wrapErrorHandler({
    goToPage() {
      return page.goto('https://google.com')
    },
    clickNonExistingSignupButton() {
      return page.click('.non-existing-signup-btn')
    }
  }, 'GooglePage')
}
