const PlaylistsService = require("../services/PlaylistsService")
const PlaylistActivitiesService = require("../services/PlaylistActivitiesService")

const playlistsService = new PlaylistsService()
const playlistActivitiesService = new PlaylistActivitiesService()

const routes = [
  {
    method: "GET",
    path: "/playlists/{id}/activities",
    options: {
      auth: "openmusic_jwt",
    },
    handler: async (request, h) => {
      try {
        const { id: playlistId } = request.params
        const { id: credentialId } = request.auth.credentials

        await playlistsService.verifyPlaylistAccess(playlistId, credentialId)
        const activities = await playlistActivitiesService.getPlaylistActivities(playlistId)

        return {
          status: "success",
          data: {
            playlistId,
            activities,
          },
        }
      } catch (error) {
        console.error("Playlist activities GET error:", error)
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
          status: "error",
          message: "Terjadi kegagalan pada server kami",
        })
        response.code(500)
        return response
      }
    },
  },
]

module.exports = routes
