const AlbumsService = require("../services/AlbumsService")
const AlbumsValidator = require("../validator/albums")
const StorageService = require("../services/StorageService")
const UploadsValidator = require("../validator/uploads")

const albumsService = new AlbumsService()
const storageService = new StorageService()

const routes = [
  {
    method: "POST",
    path: "/albums",
    handler: async (request, h) => {
      try {
        AlbumsValidator.validateAlbumPayload(request.payload)
        const { name, year } = request.payload
        const albumId = await albumsService.addAlbum({ name, year })

        const response = h.response({
          status: "success",
          data: {
            albumId,
          },
        })
        response.code(201)
        return response
      } catch (error) {
        console.error("Album POST error:", error)
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
    path: "/albums/{id}",
    handler: async (request, h) => {
      try {
        const { id } = request.params

        // Periksa apakah lagu harus disertakan (kriteria opsional 1)
        const album = await albumsService.getAlbumWithSongs(id)

        return {
          status: "success",
          data: {
            album,
          },
        }
      } catch (error) {
        console.error("Album GET error:", error)
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
    path: "/albums/{id}",
    handler: async (request, h) => {
      try {
        AlbumsValidator.validateAlbumPayload(request.payload)
        const { id } = request.params
        const { name, year } = request.payload

        await albumsService.editAlbumById(id, { name, year })

        return {
          status: "success",
          message: "Album berhasil diperbarui",
        }
      } catch (error) {
        console.error("Album PUT error:", error)
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
    path: "/albums/{id}",
    handler: async (request, h) => {
      try {
        const { id } = request.params
        await albumsService.deleteAlbumById(id)

        return {
          status: "success",
          message: "Album berhasil dihapus",
        }
      } catch (error) {
        console.error("Album DELETE error:", error)
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
    method: "POST",
    path: "/albums/{id}/covers",
    options: {
      payload: {
        allow: "multipart/form-data",
        multipart: true,
        output: "stream",
        maxBytes: 512000, // Batas 500KB
        timeout: false,
      },
    },
    handler: async (request, h) => {
      try {
        const { id } = request.params
        const { cover } = request.payload

        // Periksa apakah file cover ada
        if (!cover || !cover.hapi) {
          const response = h.response({
            status: "fail",
            message: "File cover tidak ditemukan",
          })
          response.code(400)
          return response
        }

        // Verifikasi album ada terlebih dahulu
        try {
          await albumsService.getAlbumById(id)
        } catch (albumError) {
          const response = h.response({
            status: "fail",
            message: "Album tidak ditemukan",
          })
          response.code(404)
          return response
        }

        // Validasi header file
        try {
          UploadsValidator.validateImageHeaders(cover.hapi.headers)
        } catch (validationError) {
          console.error("Validation error:", validationError)
          const response = h.response({
            status: "fail",
            message: "Format file tidak valid. Hanya file gambar yang diperbolehkan",
          })
          response.code(400)
          return response
        }

        // Upload file
        const coverUrl = await storageService.writeFile(cover, cover.hapi)
        await albumsService.updateAlbumCover(id, coverUrl)

        const response = h.response({
          status: "success",
          message: "Sampul berhasil diunggah",
        })
        response.code(201)
        return response
      } catch (error) {
        console.error("Album cover upload error:", error)

        // Tangani error spesifik
        if (error.message.includes("tidak ditemukan")) {
          const response = h.response({
            status: "fail",
            message: error.message,
          })
          response.code(404)
          return response
        }

        if (error.message.includes("Format file") || error.message.includes("valid")) {
          const response = h.response({
            status: "fail",
            message: error.message,
          })
          response.code(400)
          return response
        }

        // Error umum
        const response = h.response({
          status: "fail",
          message: "Terjadi kesalahan saat mengunggah sampul",
        })
        response.code(400)
        return response
      }
    },
  },
]

module.exports = routes
