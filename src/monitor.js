import fetch from 'node-fetch'
import { JSDOM } from 'jsdom'

const pages = {
  donate: {
    parent: 'https://newroot.org/donate',
    form: 'https://fundraise.givesmart.com/form/6dSeGQ?utm_source=embed&utm_medium=page&utm_campaign=donation&vid=1gtmvc',
  },
  contact: {
    parent: 'https://newroot.org/contact',
    form: 'https://tfaforms.com/5093636',
  },
}

async function monitor(page) {
  const endpoints = {
    parent: pages[page].parent,
    form: pages[page].form,
  }

  let report = {
    parentUrl: endpoints.parent,
    formUrl: endpoints.form,
    parentStatus: '',
    iframePresent: false,
    message: '',
    error: '',
    debug: {},
  }

  try {
    // Check parent page and look for the iframe
    const parentResponse = await fetch(endpoints.parent, {
      timeout: 10000,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    })

    report.parentStatus = parentResponse.status

    if (parentResponse.status === 200) {
      // Parse the HTML content
      const html = await parentResponse.text()
      const dom = new JSDOM(html)

      // Store the HTML for debugging
      // report.debug.html = html
      report.debug.html =
        html.slice(0, 1000) + ' [...] <!-- truncated for brevity -->' // First 1000 characters

      // Look for various indicators of the donation form
      const indicators = {
        iframe: dom.window.document.querySelector('iframe'),
        lazyFrame: dom.window.document.querySelector(
          'iframe[data-src*="givesmart"]',
        ),
        container: dom.window.document.querySelector(
          '#donation-container, .donation-container, [id*="givesmart"], [class*="givesmart"]',
        ),
        script: dom.window.document.querySelector('script[src*="givesmart"]'),
        scriptContent: Array.from(
          dom.window.document.querySelectorAll('script'),
        ).find((script) => script.textContent.includes('givesmart')),
      }

      report.debug.indicators = {
        hasIframe: !!indicators.iframe,
        hasLazyFrame: !!indicators.lazyFrame,
        hasContainer: !!indicators.container,
        hasScript: !!indicators.script,
        hasGiveSmartInScripts: !!indicators.scriptContent,
      }

      if (indicators.iframe) {
        report.debug.iframeAttributes = {
          src: indicators.iframe.src,
          dataSrc: indicators.iframe.getAttribute('data-src'),
          id: indicators.iframe.id,
          class: indicators.iframe.className,
        }
      }

      if (indicators.container) {
        report.debug.containerHtml = indicators.container.outerHTML
      }

      // Determine status based on indicators
      if (indicators.iframe || indicators.lazyFrame) {
        report.iframePresent = true
        if (indicators.iframe?.src?.includes('data:image')) {
          report.message =
            'Donation form iframe present but not yet loaded (lazy loading detected)'
        } else {
          report.message =
            'Donation form iframe is present and properly configured!'
        }
      } else if (
        indicators.container ||
        indicators.script ||
        indicators.scriptContent
      ) {
        report.message =
          'Donation form configuration detected but iframe not yet initialized'
        report.error = 'Waiting for JavaScript Initialization'
      } else {
        report.message = 'No donation form configuration found'
        report.error = 'Missing Form Configuration'
      }

      // Add page title for context
      report.debug.pageTitle = dom.window.document.title
    } else {
      report.message = `Parent page returned status ${parentResponse.status}`
      report.error = parentResponse.statusText
    }
  } catch (error) {
    report.message = `Monitoring failed: ${error.message}`
    report.error = error.toString()
    console.error('Full error:', error)
  }

  return report
}

export default monitor
