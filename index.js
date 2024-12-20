import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import monitor from './src/monitor.js'

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
        <style>
          body {
            margin: 0;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: #181818;
            color: white;
            font-family: system-ui, sans-serif;
          }
          a {
            color: #BE4F3D;
          }
          img {
            margin-bottom: 1rem;
          }
          h1 {
            margin: 0.5rem 0 1rem;
          }
          p {
            margin: 0.5rem 0;
            color: #999;
          }
        </style>
      </head>
      <body>
        <img width="100" src="https://trentbrew.pockethost.io/api/files/swvnum16u65or8w/1v2hwaoaoxv7fzu/newroot_5KrNw92lxT.png?token=" />
        <h1>NewRoot Status</h1>
        <p>Hosted status page: <a href="https://newroot.org/donate">NewRoot.org</a></p>
        <p>Raw response: <a href="/donate">"/donate" Endpoint</a></p>
        <p>Live donation page: <a href="https://fundraise.givesmart.com/form/6dSeGQ?utm_source=embed&utm_medium=page&utm_campaign=donation&vid=1gtmvc">GiveSmart</a></p>
      </body>
    </html>
  `)
})

app.get('/donate', async (req, res) => {
  try {
    const result = await monitor('donate')
    res.json(result)
  } catch (error) {
    res.status(500).json({
      message: error.message,
    })
  }
})

app.get('/contact', async (req, res) => {
  try {
    const result = await monitor('contact')
    res.json(result)
  } catch (error) {
    res.status(500).json({
      message: error.message,
    })
  }
})

const PORT = process.env.PORT || 3030

app.listen(PORT, () => console.log(`Server is running in port ${PORT}`))
