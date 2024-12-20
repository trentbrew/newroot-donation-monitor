const puppeteer = require('puppeteer')

async function monitor() {
  const url =
    'https://fundraise.givesmart.com/form/6dSeGQ?utm_source=embed&utm_medium=page&utm_campaign=donation&vid=1gtmvc'

  // Launch the headless browser
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--no-proxy-server',
      '--dns-prefetch-disable',
    ],
  })

  // Define the report schema
  let report = {
    url,
    status: '',
    formLoaded: false,
    message: '',
  }

  try {
    // Create a new page
    const page = await browser.newPage()

    // Set a realistic user agent
    const userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Safari/605.1.15',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1',
    ]

    // Set a random user agent
    const randomIndex = Math.floor(Math.random() * userAgents.length)
    await page.setUserAgent(userAgents[randomIndex])

    // Navigate to the URL
    const response = await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    })

    // Check HTTP response status
    report.status = response.status()
    if (response.status() !== 200) {
      report.message = `Failed to load form. HTTP status: ${response.status()}`
      return report
    }

    // Verify if the form exists
    const formSelector = 'form'
    const formExists = await page.$(formSelector)
    if (formExists) {
      report.formLoaded = true
      report.message = 'Form is accessible and loaded successfully!'
    } else {
      report.message = 'Form content failed to load.'
    }
  } catch (error) {
    report.message = `Monitoring failed: ${error.message}`
  } finally {
    await browser.close()
  }

  return report
}

module.exports = monitor
