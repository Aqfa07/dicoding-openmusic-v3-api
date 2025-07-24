const UsersService = require("../services/UsersService")
const UsersValidator = require("../validator/users")

const usersService = new UsersService()

const routes = [
  {
    method: "POST",
    path: "/users",
    handler: async (request, h) => {
      try {
        UsersValidator.validateUserPayload(request.payload)
        const { username, password, fullname } = request.payload

        const userId = await usersService.addUser({
          username,
          password,
          fullname,
        })

        const response = h.response({
          status: "success",
          data: {
            userId,
          },
        })
        response.code(201)
        return response
      } catch (error) {
        console.error("User POST error:", error)
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
