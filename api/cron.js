// @vercel/cron "0 0 * * *" // every day

const { sendAlert } = require('../src/mailer')
const monitor = require('../src/monitor')
const fs = require('fs')

module.exports = async (req, res) => {
  // Your cron job logic here
  const result = await monitor()
  fs.appendFileSync(
    '../logs/monitoring.log',
    `${new Date().toISOString()} - ${JSON.stringify(result)}\n`,
  )
  if (result.status !== 200) {
    console.log('sending alert...')
    await sendAlert(result.message)
  }
  res.status(200).send('Cron job executed')
}
