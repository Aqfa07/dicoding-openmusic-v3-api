const ProducerService = require("../services/ProducerService")
const PlaylistsService = require("../services/PlaylistsService")
const ExportsValidator = require("../validator/exports")

const playlistsService = new PlaylistsService()

const routes = [
  {
    method: "POST",
    path: "/export/playlists/{playlistId}",
    options: {
      auth: "openmusic_jwt",
    },
    handler: async (request, h) => {
      try {
        ExportsValidator.validateExportPlaylistPayload(request.payload)
        const { playlistId } = request.params
        const { targetEmail } = request.payload
        const { id: credentialId } = request.auth.credentials

        // Verify playlist owner
        await playlistsService.verifyPlaylistOwner(playlistId, credentialId)

        const message = {
          playlistId,
          targetEmail,
        }

        await ProducerService.sendMessage("export:playlist", JSON.stringify(message))

        const response = h.response({
          status: "success",
          message: "Permintaan Anda sedang kami proses",
        })
        response.code(201)
        return response
      } catch (error) {
        console.error("Export playlist error:", error)
        if (error.message.includes("tidak ditemukan")) {
          const response = h.response({
            status: "fail",
            message: error.message,
          })
          response.code(404)
          return response
        }

        if (error.message.includes("tidak berhak")) {
          const response = h.response({
            status: "fail",
            message: error.message,
          })
          response.code(403)
          return response
        }

        const response = h.response({
          status: "fail",
          message: error.message,
        })
        response.code(400)
        return response
      }
    },
  },
]

module.exports = routes
