const PlaylistsService = require("../services/PlaylistsService")
const SongsService = require("../services/SongsService")
const PlaylistActivitiesService = require("../services/PlaylistActivitiesService")
const PlaylistsValidator = require("../validator/playlists")

const playlistsService = new PlaylistsService()
const songsService = new SongsService()
const playlistActivitiesService = new PlaylistActivitiesService()

const routes = [
  {
    method: "POST",
    path: "/playlists",
    options: {
      auth: "openmusic_jwt",
    },
    handler: async (request, h) => {
      try {
        PlaylistsValidator.validatePlaylistPayload(request.payload)
        const { name } = request.payload
        const { id: credentialId } = request.auth.credentials

        const playlistId = await playlistsService.addPlaylist({
          name,
          owner: credentialId,
        })

        const response = h.response({
          status: "success",
          data: {
            playlistId,
          },
        })
        response.code(201)
        return response
      } catch (error) {
        console.error("Playlist POST error:", error)
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
    method: "GET",
    path: "/playlists",
    options: {
      auth: "openmusic_jwt",
    },
    handler: async (request, h) => {
      try {
        const { id: credentialId } = request.auth.credentials
        const playlists = await playlistsService.getPlaylists(credentialId)

        return {
          status: "success",
          data: {
            playlists,
          },
        }
      } catch (error) {
        console.error("Playlists GET error:", error)
        const response = h.response({
          status: "error",
          message: "Terjadi kegagalan pada server kami",
        })
        response.code(500)
        return response
      }
    },
  },
  {
    method: "DELETE",
    path: "/playlists/{id}",
    options: {
      auth: "openmusic_jwt",
    },
    handler: async (request, h) => {
      try {
        const { id } = request.params
        const { id: credentialId } = request.auth.credentials

        await playlistsService.verifyPlaylistOwner(id, credentialId)
        await playlistsService.deletePlaylistById(id)

        return {
          status: "success",
          message: "Playlist berhasil dihapus",
        }
      } catch (error) {
        console.error("Playlist DELETE error:", error)
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
  {
    method: "POST",
    path: "/playlists/{id}/songs",
    options: {
      auth: "openmusic_jwt",
    },
    handler: async (request, h) => {
      try {
        PlaylistsValidator.validatePlaylistSongPayload(request.payload)
        const { songId } = request.payload
        const { id: playlistId } = request.params
        const { id: credentialId } = request.auth.credentials

        await playlistsService.verifyPlaylistAccess(playlistId, credentialId)
        await songsService.getSongById(songId)
        await playlistsService.addSongToPlaylist(playlistId, songId)

        // Log activity
        await playlistActivitiesService.addActivity(playlistId, songId, credentialId, "add")

        const response = h.response({
          status: "success",
          message: "Lagu berhasil ditambahkan ke playlist",
        })
        response.code(201)
        return response
      } catch (error) {
        console.error("Playlist song POST error:", error)
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
    method: "GET",
    path: "/playlists/{id}/songs",
    options: {
      auth: "openmusic_jwt",
    },
    handler: async (request, h) => {
      try {
        const { id: playlistId } = request.params
        const { id: credentialId } = request.auth.credentials

        await playlistsService.verifyPlaylistAccess(playlistId, credentialId)
        const playlist = await playlistsService.getPlaylistSongs(playlistId)

        return {
          status: "success",
          data: {
            playlist,
          },
        }
      } catch (error) {
        console.error("Playlist songs GET error:", error)
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
  {
    method: "DELETE",
    path: "/playlists/{id}/songs",
    options: {
      auth: "openmusic_jwt",
    },
    handler: async (request, h) => {
      try {
        PlaylistsValidator.validatePlaylistSongPayload(request.payload)
        const { songId } = request.payload
        const { id: playlistId } = request.params
        const { id: credentialId } = request.auth.credentials

        await playlistsService.verifyPlaylistAccess(playlistId, credentialId)
        await playlistsService.deleteSongFromPlaylist(playlistId, songId)

        // Log activity
        await playlistActivitiesService.addActivity(playlistId, songId, credentialId, "delete")

        return {
          status: "success",
          message: "Lagu berhasil dihapus dari playlist",
        }
      } catch (error) {
        console.error("Playlist song DELETE error:", error)
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
