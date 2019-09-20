## Puppeteer-Jest Starter
-------

A starter-kit quipped with the minimal requirements for Puppeteer + Jest.

## Kicking off:

### Install dependencies:

`$ npm i`

### Run the test:

`$ npm start`

### Run test test in headed Chrome:

`$ npm start:headed`

## What's inside:

### `global.page`

- provide `global.page` instance so that you can start writting your test case immediately.

### Screenshot for each failed test case

- A screenshot will be taken for each failed test case, put in `screenshots` folder. (`/tmp/screenshots` if `env.CI`)
- Each file will be named by the spec description

### Failure details for each failed test case

- A `json` file named by the spec description will be generated for each failed test case. Contents in the file include:
  * The current page url
  * Spec description
  * console messages

### Multiple Browsers

Sometimes, we'd like to manipulate more than on browsers in a test case. For example, testing two sided chat.
We can do that by:

```javascript
const { getPageFromBrowser } = require('lib/browserStore')

describe('Demo', () => {
  it('manipulates multiple browsers', async ()=> {
    const page2 = await getPageFromBrowser('page2')

    // do something with `global.page` here
    // and do some other thing to `page2` here

    await page.goto('...')
    await page2.goto('...')
  })
})
```

where the `getPageFromBrowser` works as a browser store providing multiple browser references by `browserName`:

```javascript
page1 = await getPageFromBrowser('the-name')
page2 = await getPageFromBrowser('the-name')

page1 === page2 // true
```

### Wrapped `global.page` with convenient default options and behaviors which can be overwritten easily when needed

For example, `global.page.goto` is with default option `waitUntil: networkidle0` and fails with readable erorr message if the returning status code is not 200.
To overwrite it, just

```javascript
global.page.goto({
  waitUntil: 'my-other-desired-options',
  myOtherKey: 'my-other-value'
})
```

The default options/overwritten methods can be modified in `lib/pageWrapper`.

#### Default options/behavior in `global.page`

- `page.goto`: `waitUntil: 'networkidle0'`, guard status `200`
- `page.waitForSelector`: `visible: true`
- `page.click`: First `waitForSelector` with `visible: true` then click

### Make it easy to decouple test case with UI detail

In e2e testing, it's easy to scatter css selectors all around the code base. This makes maintainance when UI changes a nightmare.
Here we use UI `driver` layer to mitigate this issue and make the error message more readable at the same time:

**before**

```javascript
it('is nasty', async () => {
  // do payment
  await page.click('.my-first-css-selector')
  await page.click('.my-another-css-selector')
  await page.click('.my-yet-another-css-selector')
  await page.click('.this-drove-me-crazy')
})
```

**after**

```javascript
const { getPageFromBrowser } = require('lib/browserStore')

function createPageDriver (page) {
  return wrapErrorHandler({
    async doPayment() {
      // when UI implementation changed, change here
      await page.click('.my-first-css-selector')
      await page.click('.my-another-css-selector')
      await page.click('.my-yet-another-css-selector')
      await page.click('.this-drove-me-crazy')
    },
  }, 'MyPaymentPage')
}

it('is much better', async () => {
  // when UI implementation changed, this part won't change if the business logic remains the same
  const driver = createPageDriver(page)
  await page.doPayment()
})
```

By adding a layer between business logic and UI details, we can abstract out the UI implementation detail there.
