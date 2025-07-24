const path = require("path")

const routes = [
  {
    method: "GET",
    path: "/uploads/{file*}",
    handler: {
      directory: {
        path: path.resolve(__dirname, "../uploads"),
      },
    },
  },
]

module.exports = routes
