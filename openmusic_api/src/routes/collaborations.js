const CollaborationsService = require("../services/CollaborationsService")
const PlaylistsService = require("../services/PlaylistsService")
const UsersService = require("../services/UsersService")
const CollaborationsValidator = require("../validator/collaborations")

const collaborationsService = new CollaborationsService()
const playlistsService = new PlaylistsService()
const usersService = new UsersService()

const routes = [
  {
    method: "POST",
    path: "/collaborations",
    options: {
      auth: "openmusic_jwt",
    },
    handler: async (request, h) => {
      try {
        CollaborationsValidator.validateCollaborationPayload(request.payload)
        const { id: credentialId } = request.auth.credentials
        const { playlistId, userId } = request.payload

        await playlistsService.verifyPlaylistOwner(playlistId, credentialId)
        await usersService.getUserById(userId)
        const collaborationId = await collaborationsService.addCollaboration(playlistId, userId)

        const response = h.response({
          status: "success",
          data: {
            collaborationId,
          },
        })
        response.code(201)
        return response
      } catch (error) {
        console.error("Collaboration POST error:", error)
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
  {
    method: "DELETE",
    path: "/collaborations",
    options: {
      auth: "openmusic_jwt",
    },
    handler: async (request, h) => {
      try {
        CollaborationsValidator.validateCollaborationPayload(request.payload)
        const { id: credentialId } = request.auth.credentials
        const { playlistId, userId } = request.payload

        await playlistsService.verifyPlaylistOwner(playlistId, credentialId)
        await collaborationsService.deleteCollaboration(playlistId, userId)

        return {
          status: "success",
          message: "Kolaborasi berhasil dihapus",
        }
      } catch (error) {
        console.error("Collaboration DELETE error:", error)
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
