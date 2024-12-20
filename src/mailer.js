const nodemailer = require('nodemailer')

async function sendAlert(message) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'your-email@gmail.com',
      pass: 'your-email-password',
    },
  })

  const mailOptions = {
    from: 'your-email@gmail.com',
    to: 'recipient-email@example.com',
    subject: 'Monitoring Alert',
    text: message,
  }

  await transporter.sendMail(mailOptions)
}

module.exports = {
  sendAlert,
}
