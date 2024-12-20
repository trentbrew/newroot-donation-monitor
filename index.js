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
  res.json({
    message: '👋🏾',
  })
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
