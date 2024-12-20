```js
// schedule a job to run every 10 seconds
cron.schedule('*/10 * * * * *', async () => {
  console.log('running monitor job...')
  const result = await monitor()
  console.log(result)
  fs.appendFileSync(
    'monitoring.log',
    `${new Date().toISOString()} - ${JSON.stringify(result)}\n`,
  )
  if (result.status !== 200) {
    console.log('sending alert...')
    // await sendAlert(result.message)
  }
})
```
