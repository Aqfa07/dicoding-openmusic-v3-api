const nodemailer = require("nodemailer")

class MailSender {
  constructor() {
    this._transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    })
  }

  sendEmail(targetEmail, content) {
    const message = {
      from: process.env.SMTP_USER,
      to: targetEmail,
      subject: "Ekspor Playlist OpenMusic",
      text: "Terlampir hasil ekspor playlist Anda",
      attachments: [
        {
          filename: "playlist.json",
          content,
        },
      ],
    }

    return this._transporter.sendMail(message)
  }
}

module.exports = MailSender
