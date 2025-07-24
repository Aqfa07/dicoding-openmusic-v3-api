const pool = require("./database")

class AuthenticationsService {
  async addRefreshToken(token) {
    try {
      const query = {
        text: "INSERT INTO authentications (token) VALUES($1)",
        values: [token],
      }

      await pool.query(query)
    } catch (error) {
      console.error("Error adding refresh token:", error)
      throw new Error("Gagal menambahkan refresh token")
    }
  }

  async verifyRefreshToken(token) {
    try {
      const query = {
        text: "SELECT token FROM authentications WHERE token = $1",
        values: [token],
      }

      const result = await pool.query(query)

      if (!result.rows.length) {
        throw new Error("Refresh token tidak valid")
      }
    } catch (error) {
      if (error.message.includes("Refresh token tidak valid")) {
        throw error
      }
      console.error("Error verifying refresh token:", error)
      throw new Error("Refresh token tidak valid")
    }
  }

  async deleteRefreshToken(token) {
    try {
      const query = {
        text: "DELETE FROM authentications WHERE token = $1",
        values: [token],
      }

      await pool.query(query)
    } catch (error) {
      console.error("Error deleting refresh token:", error)
      throw new Error("Gagal menghapus refresh token")
    }
  }
}

module.exports = AuthenticationsService
