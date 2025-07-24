const AlbumLikesService = require("../services/AlbumLikesService")
const AlbumsService = require("../services/AlbumsService")
const CacheService = require("../services/CacheService")

const albumLikesService = new AlbumLikesService()
const albumsService = new AlbumsService()
const cacheService = new CacheService()

const routes = [
  {
    method: "POST",
    path: "/albums/{id}/likes",
    options: {
      auth: "openmusic_jwt",
    },
    handler: async (request, h) => {
      try {
        const { id: albumId } = request.params
        const { id: credentialId } = request.auth.credentials

        // Verify album exists
        await albumsService.getAlbumById(albumId)

        await albumLikesService.addLike(credentialId, albumId)

        // Delete cache
        await cacheService.delete(`album_likes:${albumId}`)

        const response = h.response({
          status: "success",
          message: "Album berhasil disukai",
        })
        response.code(201)
        return response
      } catch (error) {
        console.error("Like album error:", error)
        if (error.message.includes("tidak ditemukan")) {
          const response = h.response({
            status: "fail",
            message: error.message,
          })
          response.code(404)
          return response
        }

        if (error.message.includes("sudah disukai")) {
          const response = h.response({
            status: "fail",
            message: error.message,
          })
          response.code(400)
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
    path: "/albums/{id}/likes",
    options: {
      auth: "openmusic_jwt",
    },
    handler: async (request, h) => {
      try {
        const { id: albumId } = request.params
        const { id: credentialId } = request.auth.credentials

        // Verify album exists
        await albumsService.getAlbumById(albumId)

        await albumLikesService.removeLike(credentialId, albumId)

        // Delete cache
        await cacheService.delete(`album_likes:${albumId}`)

        return {
          status: "success",
          message: "Album batal disukai",
        }
      } catch (error) {
        console.error("Unlike album error:", error)
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
    method: "GET",
    path: "/albums/{id}/likes",
    handler: async (request, h) => {
      try {
        const { id: albumId } = request.params

        // Try to get from cache first
        const cacheKey = `album_likes:${albumId}`
        const cachedLikes = await cacheService.get(cacheKey)

        if (cachedLikes !== null) {
          const response = h.response({
            status: "success",
            data: {
              likes: cachedLikes,
            },
          })
          response.header("X-Data-Source", "cache")
          return response
        }

        // Verify album exists
        await albumsService.getAlbumById(albumId)

        const likes = await albumLikesService.getLikesCount(albumId)

        // Store in cache for 30 minutes (1800 seconds)
        await cacheService.set(cacheKey, likes, 1800)

        return {
          status: "success",
          data: {
            likes,
          },
        }
      } catch (error) {
        console.error("Get album likes error:", error)
        if (error.message.includes("tidak ditemukan")) {
          const response = h.response({
            status: "fail",
            message: error.message,
          })
          response.code(404)
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
