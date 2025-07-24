const { nanoid } = require("nanoid")
const pool = require("./database")

class AlbumsService {
  async addAlbum({ name, year }) {
    const id = `album-${nanoid(16)}`

    try {
      const query = {
        text: "INSERT INTO albums (id, name, year) VALUES($1, $2, $3) RETURNING id",
        values: [id, name, year],
      }

      const result = await pool.query(query)

      if (!result.rows[0].id) {
        throw new Error("Album gagal ditambahkan")
      }

      return result.rows[0].id
    } catch (error) {
      console.error("Error adding album:", error)
      throw new Error("Album gagal ditambahkan")
    }
  }

  async getAlbumById(id) {
    try {
      const query = {
        text: "SELECT * FROM albums WHERE id = $1",
        values: [id],
      }

      const result = await pool.query(query)

      if (!result.rows.length) {
        throw new Error("Album tidak ditemukan")
      }

      return result.rows[0]
    } catch (error) {
      console.error("Error getting album:", error)
      throw new Error("Album tidak ditemukan")
    }
  }

  async getAlbumWithSongs(id) {
    try {
      const albumQuery = {
        text: "SELECT id, name, year, cover_url FROM albums WHERE id = $1",
        values: [id],
      }

      const songsQuery = {
        text: "SELECT id, title, performer FROM songs WHERE album_id = $1",
        values: [id],
      }

      const albumResult = await pool.query(albumQuery)

      if (!albumResult.rows.length) {
        throw new Error("Album tidak ditemukan")
      }

      const songsResult = await pool.query(songsQuery)
      const album = albumResult.rows[0]
      const songs = songsResult.rows

      return {
        id: album.id,
        name: album.name,
        year: album.year,
        coverUrl: album.cover_url,
        songs,
      }
    } catch (error) {
      console.error("Error getting album with songs:", error)
      if (error.message === "Album tidak ditemukan") {
        throw error
      }
      throw new Error("Album tidak ditemukan")
    }
  }

  async editAlbumById(id, { name, year }) {
    try {
      const query = {
        text: "UPDATE albums SET name = $1, year = $2 WHERE id = $3 RETURNING id",
        values: [name, year, id],
      }

      const result = await pool.query(query)

      if (!result.rows.length) {
        throw new Error("Gagal memperbarui album. Id tidak ditemukan")
      }
    } catch (error) {
      console.error("Error editing album:", error)
      throw new Error("Gagal memperbarui album. Id tidak ditemukan")
    }
  }

  async deleteAlbumById(id) {
    try {
      const query = {
        text: "DELETE FROM albums WHERE id = $1 RETURNING id",
        values: [id],
      }

      const result = await pool.query(query)

      if (!result.rows.length) {
        throw new Error("Album gagal dihapus. Id tidak ditemukan")
      }
    } catch (error) {
      console.error("Error deleting album:", error)
      throw new Error("Album gagal dihapus. Id tidak ditemukan")
    }
  }

  async updateAlbumCover(id, coverUrl) {
    try {
      const query = {
        text: "UPDATE albums SET cover_url = $1 WHERE id = $2 RETURNING id",
        values: [coverUrl, id],
      }

      const result = await pool.query(query)

      if (!result.rows.length) {
        throw new Error("Album tidak ditemukan")
      }
    } catch (error) {
      console.error("Error updating album cover:", error)
      if (error.message === "Album tidak ditemukan") {
        throw error
      }
      throw new Error("Gagal mengupdate sampul album")
    }
  }
}

module.exports = AlbumsService
