require("dotenv").config()
const Hapi = require("@hapi/hapi")
const Jwt = require("@hapi/jwt")
const Inert = require("@hapi/inert")
const path = require("path")

// Routes
const albumsRoutes = require("./routes/albums")
const songsRoutes = require("./routes/songs")
const usersRoutes = require("./routes/users")
const authenticationsRoutes = require("./routes/authentications")
const playlistsRoutes = require("./routes/playlists")
const collaborationsRoutes = require("./routes/collaborations")
const playlistActivitiesRoutes = require("./routes/playlist-activities")
const exportsRoutes = require("./routes/exports")
const uploadsRoutes = require("./routes/uploads")
const albumLikesRoutes = require("./routes/album-likes")

const init = async () => {
  const server = Hapi.server({
    port: process.env.PORT || 5000,
    host: process.env.HOST || "localhost",
    routes: {
      cors: {
        origin: ["*"],
      },
      files: {
        relativeTo: path.join(__dirname, "uploads"),
      },
    },
  })

  // Daftarkan plugin
  await server.register([
    {
      plugin: Jwt,
    },
    {
      plugin: Inert,
    },
  ])

  // Definisikan strategi autentikasi JWT
  server.auth.strategy("openmusic_jwt", "jwt", {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
  })

  // Daftarkan routes
  server.route(albumsRoutes)
  server.route(songsRoutes)
  server.route(usersRoutes)
  server.route(authenticationsRoutes)
  server.route(playlistsRoutes)
  server.route(collaborationsRoutes)
  server.route(playlistActivitiesRoutes)
  server.route(exportsRoutes)
  server.route(uploadsRoutes)
  server.route(albumLikesRoutes)

  // Penanganan error global
  server.ext("onPreResponse", (request, h) => {
    const { response } = request

    if (response.isBoom) {
      // Tangani error payload terlalu besar (413)
      if (response.output.statusCode === 413) {
        return h
          .response({
            status: "fail",
            message: "Payload content length greater than maximum allowed: 512000",
          })
          .code(413)
      }

      if (response.output.statusCode === 400) {
        return h
          .response({
            status: "fail",
            message: response.message || "Bad request",
          })
          .code(400)
      }

      if (response.output.statusCode === 401) {
        return h
          .response({
            status: "fail",
            message: response.message || "Unauthorized",
          })
          .code(401)
      }

      if (response.output.statusCode === 403) {
        return h
          .response({
            status: "fail",
            message: response.message || "Forbidden",
          })
          .code(403)
      }

      if (response.output.statusCode === 404) {
        return h
          .response({
            status: "fail",
            message: response.message || "Not found",
          })
          .code(404)
      }

      // Server error (500)
      return h
        .response({
          status: "error",
          message: "Terjadi kegagalan pada server kami",
        })
        .code(500)
    }

    return response.continue || response
  })

  await server.start()
  console.log(`Server berjalan pada ${server.info.uri}`)
}

process.on("unhandledRejection", (err) => {
  console.log(err)
  process.exit(1)
})

init()
