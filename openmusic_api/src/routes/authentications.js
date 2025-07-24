const AuthenticationsService = require("../services/AuthenticationsService")
const UsersService = require("../services/UsersService")
const TokenManager = require("../tokenize/TokenManager")
const AuthenticationsValidator = require("../validator/authentications")

const authenticationsService = new AuthenticationsService()
const usersService = new UsersService()

const routes = [
  {
    method: "POST",
    path: "/authentications",
    handler: async (request, h) => {
      try {
        AuthenticationsValidator.validatePostAuthenticationPayload(request.payload)
        const { username, password } = request.payload
        const id = await usersService.verifyUserCredential(username, password)

        const accessToken = TokenManager.generateAccessToken({ id })
        const refreshToken = TokenManager.generateRefreshToken({ id })

        await authenticationsService.addRefreshToken(refreshToken)

        const response = h.response({
          status: "success",
          message: "Authentication berhasil ditambahkan",
          data: {
            accessToken,
            refreshToken,
          },
        })
        response.code(201)
        return response
      } catch (error) {
        console.error("Authentication POST error:", error)

        // Check if it's a validation error (invalid payload structure)
        if (
          error.name === "ValidationError" ||
          error.message.includes("required") ||
          error.message.includes("must be")
        ) {
          const response = h.response({
            status: "fail",
            message: error.message,
          })
          response.code(400)
          return response
        }

        // Authentication errors (wrong credentials)
        const response = h.response({
          status: "fail",
          message: error.message,
        })
        response.code(401)
        return response
      }
    },
  },
  {
    method: "PUT",
    path: "/authentications",
    handler: async (request, h) => {
      try {
        AuthenticationsValidator.validatePutAuthenticationPayload(request.payload)
        const { refreshToken } = request.payload

        await authenticationsService.verifyRefreshToken(refreshToken)
        const { id } = TokenManager.verifyRefreshToken(refreshToken)

        const accessToken = TokenManager.generateAccessToken({ id })
        return {
          status: "success",
          message: "Access Token berhasil diperbarui",
          data: {
            accessToken,
          },
        }
      } catch (error) {
        console.error("Authentication PUT error:", error)
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
    path: "/authentications",
    handler: async (request, h) => {
      try {
        AuthenticationsValidator.validateDeleteAuthenticationPayload(request.payload)
        const { refreshToken } = request.payload

        await authenticationsService.verifyRefreshToken(refreshToken)
        await authenticationsService.deleteRefreshToken(refreshToken)

        return {
          status: "success",
          message: "Refresh token berhasil dihapus",
        }
      } catch (error) {
        console.error("Authentication DELETE error:", error)
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
