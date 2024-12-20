import chromium from 'chrome-aws-lambda'
import puppeteerCore from 'puppeteer-core'
import puppeteer from 'puppeteer'

async function monitor() {
  const url =
    'https://fundraise.givesmart.com/form/6dSeGQ?utm_source=embed&utm_medium=page&utm_campaign=donation&vid=1gtmvc'

  let report = {
    url,
    status: '',
    formLoaded: false,
    message: '',
  }

  let browser
  try {
    // Determine if we're in development or production
    const isDev = process.env.NODE_ENV !== 'production'
    console.log('Environment:', isDev ? 'development' : 'production')

    if (isDev) {
      // Local development - use full Puppeteer
      browser = await puppeteer.launch({
        headless: 'new',
      })
    } else {
      // Vercel production - use puppeteer-core with chrome-aws-lambda
      browser = await puppeteerCore.launch({
        args: chromium.args,
        executablePath: await chromium.executablePath,
        headless: chromium.headless,
        defaultViewport: chromium.defaultViewport,
      })
    }

    const page = await browser.newPage()

    // Set user agent
    await page.setUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    )

    // Navigate to page and wait for network to be idle
    const response = await page.goto(url, {
      waitUntil: 'networkidle0',
      timeout: 30000,
    })

    report.status = response.status()

    if (response.status() !== 200) {
      report.message = `Failed to load form. HTTP status: ${response.status()}`
      return report
    }

    // Wait for and check if form exists
    const formExists = await page.$('form')

    if (formExists) {
      report.formLoaded = true
      report.message = 'Form is accessible and loaded successfully!'
    } else {
      report.message = 'Form content failed to load.'
    }
  } catch (error) {
    report.message = `Monitoring failed: ${error.message}`
    console.error('Full error:', error)
  } finally {
    if (browser) {
      await browser.close()
    }
  }

  return report
}

export default monitor
