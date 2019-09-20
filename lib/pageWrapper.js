module.exports = function(pg) {
  const page = Object.create(pg)
  const consoleMessages = []

  page.on('console', (msg) => consoleMessages.push(msg.text()))
  page.on('response', (response) => {
    const firstDigitOfStatusCode = Math.floor(response.status() / 100)
    const request = response.request()
    if (firstDigitOfStatusCode === 4 || firstDigitOfStatusCode === 5) {
      consoleMessages.push(
        `Request Faield: [${request.method()}] ${response.url()}, Status: ${response.status()}, Body: ${request.postData()}`
      )
    }
  })

  page.goto = async function(url, opt = {}) {
    const res = await pg.goto(
      url,
      Object.assign(
        {
          waitUntil: 'networkidle0'
        },
        opt
      )
    )
    const status = res.status()
    if (status !== 200) {
      throw new Error(`page.goto ${url} failed, status was: ${status}`)
    }

    return res
  }

  page.click = async function(selector, opt = {}) {
    await pg.waitForSelector(selector, {
      visible: true
    })
    return pg.click(selector, opt)
  }

  page.waitForSelector = function(selector, opt = {}) {
    return pg.waitForSelector(selector, Object.assign({ visible: true }, opt))
  }

  page.__getConsoleMessages = () => {
    return consoleMessages
  }

  return page
}
