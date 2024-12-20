require('dotenv').config()

const express = require('express')
const cors = require('cors')
const monitor = require('./src/monitor')

const app = express()

app.set('view engine', 'ejs')
app.set('views', './views')

app.use(express.static('public'))
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cors())

app.get('/', async (req, res) => {
  res.send(`
    <html>
      <head>
        <title>NewRoot Status</title>
      </head>
      <body>
        <h1>NewRoot Status</h1>

        <p>Donate directly: <a href="https://fundraise.givesmart.com/form/6dSeGQ?utm_source=embed&utm_medium=page&utm_campaign=donation&vid=1gtmvc">GiveSmart</a></p>
        <p>Visit our main donation page: <a href="https://newroot.org/donate">NewRoot.org</a></p>
      </body>
    </html>
  `)
})

app.get('/monitor', async (req, res) => {
  try {
    const result = await monitor()
    res.json(result)
  } catch (error) {
    res.status(500).json({
      message: error.message,
    })
  }
})

const PORT = process.env.PORT || 3030

app.listen(PORT, () => console.log(`Server is running in port ${PORT}`))
