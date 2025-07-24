const { nanoid } = require("nanoid")
const pool = require("./database")

class SongsService {
  async addSong({ title, year, genre, performer, duration, albumId }) {
    const id = `song-${nanoid(16)}`

    try {
      const query = {
        text: "INSERT INTO songs (id, title, year, genre, performer, duration, album_id) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id",
        values: [id, title, year, genre, performer, duration, albumId],
      }

      const result = await pool.query(query)

      if (!result.rows[0].id) {
        throw new Error("Lagu gagal ditambahkan")
      }

      return result.rows[0].id
    } catch (error) {
      console.error("Error adding song:", error)
      throw new Error("Lagu gagal ditambahkan")
    }
  }

  async getSongs(title, performer) {
    try {
      let query = "SELECT id, title, performer FROM songs"
      const values = []
      const conditions = []

      if (title) {
        conditions.push(`title ILIKE $${conditions.length + 1}`)
        values.push(`%${title}%`)
      }

      if (performer) {
        conditions.push(`performer ILIKE $${conditions.length + 1}`)
        values.push(`%${performer}%`)
      }

      if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(" AND ")}`
      }

      const result = await pool.query({
        text: query,
        values,
      })

      return result.rows
    } catch (error) {
      console.error("Error getting songs:", error)
      throw new Error("Gagal mengambil data lagu")
    }
  }

  async getSongById(id) {
    try {
      const query = {
        text: "SELECT * FROM songs WHERE id = $1",
        values: [id],
      }

      const result = await pool.query(query)

      if (!result.rows.length) {
        throw new Error("Lagu tidak ditemukan")
      }

      const song = result.rows[0]
      return {
        id: song.id,
        title: song.title,
        year: song.year,
        performer: song.performer,
        genre: song.genre,
        duration: song.duration,
        albumId: song.album_id,
      }
    } catch (error) {
      console.error("Error getting song:", error)
      throw new Error("Lagu tidak ditemukan")
    }
  }

  async editSongById(id, { title, year, genre, performer, duration, albumId }) {
    try {
      const query = {
        text: "UPDATE songs SET title = $1, year = $2, genre = $3, performer = $4, duration = $5, album_id = $6 WHERE id = $7 RETURNING id",
        values: [title, year, genre, performer, duration, albumId, id],
      }

      const result = await pool.query(query)

      if (!result.rows.length) {
        throw new Error("Gagal memperbarui lagu. Id tidak ditemukan")
      }
    } catch (error) {
      console.error("Error editing song:", error)
      throw new Error("Gagal memperbarui lagu. Id tidak ditemukan")
    }
  }

  async deleteSongById(id) {
    try {
      const query = {
        text: "DELETE FROM songs WHERE id = $1 RETURNING id",
        values: [id],
      }

      const result = await pool.query(query)

      if (!result.rows.length) {
        throw new Error("Lagu gagal dihapus. Id tidak ditemukan")
      }
    } catch (error) {
      console.error("Error deleting song:", error)
      throw new Error("Lagu gagal dihapus. Id tidak ditemukan")
    }
  }
}

module.exports = SongsService
