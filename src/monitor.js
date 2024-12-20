const puppeteer = require('puppeteer')

async function monitor() {
  // Launch the browser
  const browser = await puppeteer.launch({
    headless: true, // Run in headless mode for efficiency
    args: ['--no-sandbox', '--disable-setuid-sandbox'], // Additional options for stability
  })

  const url = 'https://newroot.org/donate'

  try {
    // Open a new browser page
    const page = await browser.newPage()

    // Navigate to the page
    await page.goto(url, { waitUntil: 'load', timeout: 0 })

    // Wait for the iframe to load
    const iframeSelector =
      'iframe[src="https://fundraise.givesmart.com/events/A22/page/order-form/embed"]'
    await page.waitForSelector(iframeSelector, { timeout: 10000 })

    // Get the iframe element
    const iframeElement = await page.$(iframeSelector)

    if (iframeElement) {
      // Access the iframe content
      const iframe = await iframeElement.contentFrame()

      if (iframe) {
        // Check if the iframe has loaded content
        const bodyContent = await iframe.$('body')
        if (bodyContent) {
          console.log('Iframe is working correctly!')
        } else {
          console.log('Iframe content failed to load.')
        }
      } else {
        console.log('Failed to access iframe content.')
      }
    } else {
      console.log('Iframe not found on the page.')
    }
  } catch (error) {
    console.error(`Monitoring failed: ${error.message}`)
  } finally {
    // Close the browser
    await browser.close()
  }
}

module.exports = monitor
