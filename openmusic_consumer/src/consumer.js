require("dotenv").config()
const amqp = require("amqplib")
const PlaylistsService = require("./services/PlaylistsService")
const MailSender = require("./services/MailSender")

const init = async () => {
  const playlistsService = new PlaylistsService()
  const mailSender = new MailSender()

  const connection = await amqp.connect(process.env.RABBITMQ_SERVER)
  const channel = await connection.createChannel()

  await channel.assertQueue("export:playlist", {
    durable: true,
  })

  console.log("Consumer is waiting for messages...")

  channel.consume("export:playlist", async (message) => {
    try {
      const { playlistId, targetEmail } = JSON.parse(message.content.toString())
      console.log(`Processing export for playlist: ${playlistId}`)

      const playlist = await playlistsService.getPlaylistSongs(playlistId)
      const result = JSON.stringify({ playlist })

      await mailSender.sendEmail(targetEmail, result)
      console.log(`Playlist exported and sent to ${targetEmail}`)
    } catch (error) {
      console.error("Export error:", error)
    }

    channel.ack(message)
  })
}

init().catch(console.error)
