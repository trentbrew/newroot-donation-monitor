import chromium from 'chrome-aws-lambda'
import puppeteer from 'puppeteer-core'

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
    // Determine Chrome path based on environment
    const executablePath =
      process.env.CHROME_EXECUTABLE_PATH ||
      (process.env.VERCEL
        ? await chromium.executablePath
        : process.platform === 'win32'
        ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
        : process.platform === 'linux'
        ? '/usr/bin/google-chrome'
        : '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome')

    console.log('Using Chrome at:', executablePath) // Debug log

    // Launch browser with appropriate config
    browser = await puppeteer.launch({
      args: chromium.args || [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu',
      ],
      defaultViewport: chromium.defaultViewport || {
        width: 1280,
        height: 720,
      },
      executablePath,
      headless: true,
      ignoreHTTPSErrors: true,
    })

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
