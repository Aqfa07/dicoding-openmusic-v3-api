const { nanoid } = require("nanoid")
const pool = require("./database")

class CollaborationsService {
  async addCollaboration(playlistId, userId) {
    const id = `collab-${nanoid(16)}`

    try {
      const query = {
        text: "INSERT INTO collaborations (id, playlist_id, user_id) VALUES($1, $2, $3) RETURNING id",
        values: [id, playlistId, userId],
      }

      const result = await pool.query(query)

      if (!result.rows[0].id) {
        throw new Error("Kolaborasi gagal ditambahkan")
      }

      return result.rows[0].id
    } catch (error) {
      console.error("Error adding collaboration:", error)
      throw new Error("Kolaborasi gagal ditambahkan")
    }
  }

  async deleteCollaboration(playlistId, userId) {
    try {
      const query = {
        text: "DELETE FROM collaborations WHERE playlist_id = $1 AND user_id = $2 RETURNING id",
        values: [playlistId, userId],
      }

      const result = await pool.query(query)

      if (!result.rows.length) {
        throw new Error("Kolaborasi gagal dihapus")
      }
    } catch (error) {
      console.error("Error deleting collaboration:", error)
      throw new Error("Kolaborasi gagal dihapus")
    }
  }

  async verifyCollaborator(playlistId, userId) {
    try {
      const query = {
        text: "SELECT * FROM collaborations WHERE playlist_id = $1 AND user_id = $2",
        values: [playlistId, userId],
      }

      const result = await pool.query(query)

      if (!result.rows.length) {
        throw new Error("Kolaborasi tidak ditemukan")
      }
    } catch (error) {
      if (error.message.includes("tidak ditemukan")) {
        throw error
      }
      console.error("Error verifying collaborator:", error)
      throw new Error("Gagal memverifikasi kolaborator")
    }
  }
}

module.exports = CollaborationsService
