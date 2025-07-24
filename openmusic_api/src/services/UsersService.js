const { nanoid } = require("nanoid")
const bcrypt = require("bcrypt")
const pool = require("./database")

class UsersService {
  async addUser({ username, password, fullname }) {
    await this.verifyNewUsername(username)

    const id = `user-${nanoid(16)}`
    const hashedPassword = await bcrypt.hash(password, 10)

    try {
      const query = {
        text: "INSERT INTO users (id, username, password, fullname) VALUES($1, $2, $3, $4) RETURNING id",
        values: [id, username, hashedPassword, fullname],
      }

      const result = await pool.query(query)

      if (!result.rows[0].id) {
        throw new Error("User gagal ditambahkan")
      }

      return result.rows[0].id
    } catch (error) {
      console.error("Error adding user:", error)
      throw new Error("User gagal ditambahkan")
    }
  }

  async verifyNewUsername(username) {
    try {
      const query = {
        text: "SELECT username FROM users WHERE username = $1",
        values: [username],
      }

      const result = await pool.query(query)

      if (result.rows.length > 0) {
        throw new Error("Gagal menambahkan user. Username sudah digunakan.")
      }
    } catch (error) {
      if (error.message.includes("Username sudah digunakan")) {
        throw error
      }
      throw new Error("Database error")
    }
  }

  async getUserById(userId) {
    try {
      const query = {
        text: "SELECT id, username, fullname FROM users WHERE id = $1",
        values: [userId],
      }

      const result = await pool.query(query)

      if (!result.rows.length) {
        throw new Error("User tidak ditemukan")
      }

      return result.rows[0]
    } catch (error) {
      console.error("Error getting user:", error)
      throw new Error("User tidak ditemukan")
    }
  }

  async verifyUserCredential(username, password) {
    try {
      const query = {
        text: "SELECT id, password FROM users WHERE username = $1",
        values: [username],
      }

      const result = await pool.query(query)

      if (!result.rows.length) {
        throw new Error("Kredensial yang Anda berikan salah")
      }

      const { id, password: hashedPassword } = result.rows[0]
      const match = await bcrypt.compare(password, hashedPassword)

      if (!match) {
        throw new Error("Kredensial yang Anda berikan salah")
      }

      return id
    } catch (error) {
      if (error.message.includes("Kredensial yang Anda berikan salah")) {
        throw error
      }
      console.error("Error verifying credentials:", error)
      throw new Error("Kredensial yang Anda berikan salah")
    }
  }
}

module.exports = UsersService
