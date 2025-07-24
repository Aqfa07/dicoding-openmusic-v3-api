const SongsService = require("../services/SongsService")
const SongsValidator = require("../validator/songs")

const songsService = new SongsService()

const routes = [
  {
    method: "POST",
    path: "/songs",
    handler: async (request, h) => {
      try {
        SongsValidator.validateSongPayload(request.payload)
        const { title, year, genre, performer, duration, albumId } = request.payload
        const songId = await songsService.addSong({
          title,
          year,
          genre,
          performer,
          duration,
          albumId,
        })

        const response = h.response({
          status: "success",
          data: {
            songId,
          },
        })
        response.code(201)
        return response
      } catch (error) {
        console.error("Song POST error:", error)
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
    path: "/songs",
    handler: async (request, h) => {
      try {
        const { title, performer } = request.query
        const songs = await songsService.getSongs(title, performer)

        return {
          status: "success",
          data: {
            songs,
          },
        }
      } catch (error) {
        console.error("Songs GET error:", error)
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
    method: "GET",
    path: "/songs/{id}",
    handler: async (request, h) => {
      try {
        const { id } = request.params
        const song = await songsService.getSongById(id)

        return {
          status: "success",
          data: {
            song,
          },
        }
      } catch (error) {
        console.error("Song GET error:", error)
        const response = h.response({
          status: "fail",
          message: error.message,
        })
        response.code(404)
        return response
      }
    },
  },
  {
    method: "PUT",
    path: "/songs/{id}",
    handler: async (request, h) => {
      try {
        SongsValidator.validateSongPayload(request.payload)
        const { id } = request.params
        const { title, year, genre, performer, duration, albumId } = request.payload

        await songsService.editSongById(id, {
          title,
          year,
          genre,
          performer,
          duration,
          albumId,
        })

        return {
          status: "success",
          message: "Lagu berhasil diperbarui",
        }
      } catch (error) {
        console.error("Song PUT error:", error)
        if (error.message.includes("tidak ditemukan")) {
          const response = h.response({
            status: "fail",
            message: error.message,
          })
          response.code(404)
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
    path: "/songs/{id}",
    handler: async (request, h) => {
      try {
        const { id } = request.params
        await songsService.deleteSongById(id)

        return {
          status: "success",
          message: "Lagu berhasil dihapus",
        }
      } catch (error) {
        console.error("Song DELETE error:", error)
        const response = h.response({
          status: "fail",
          message: error.message,
        })
        response.code(404)
        return response
      }
    },
  },
]

module.exports = routes
