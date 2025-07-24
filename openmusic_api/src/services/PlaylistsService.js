const { nanoid } = require("nanoid")
const pool = require("./database")

class PlaylistsService {
  async addPlaylist({ name, owner }) {
    const id = `playlist-${nanoid(16)}`

    try {
      const query = {
        text: "INSERT INTO playlists (id, name, owner) VALUES($1, $2, $3) RETURNING id",
        values: [id, name, owner],
      }

      const result = await pool.query(query)

      if (!result.rows[0].id) {
        throw new Error("Playlist gagal ditambahkan")
      }

      return result.rows[0].id
    } catch (error) {
      console.error("Error adding playlist:", error)
      throw new Error("Playlist gagal ditambahkan")
    }
  }

  async getPlaylists(owner) {
    try {
      const query = {
        text: `SELECT p.id, p.name, u.username 
               FROM playlists p 
               LEFT JOIN users u ON u.id = p.owner 
               LEFT JOIN collaborations c ON c.playlist_id = p.id 
               WHERE p.owner = $1 OR c.user_id = $1
               GROUP BY p.id, p.name, u.username`,
        values: [owner],
      }

      const result = await pool.query(query)
      return result.rows
    } catch (error) {
      console.error("Error getting playlists:", error)
      throw new Error("Gagal mengambil data playlist")
    }
  }

  async deletePlaylistById(id) {
    try {
      const query = {
        text: "DELETE FROM playlists WHERE id = $1 RETURNING id",
        values: [id],
      }

      const result = await pool.query(query)

      if (!result.rows.length) {
        throw new Error("Playlist gagal dihapus. Id tidak ditemukan")
      }
    } catch (error) {
      console.error("Error deleting playlist:", error)
      throw new Error("Playlist gagal dihapus. Id tidak ditemukan")
    }
  }

  async addSongToPlaylist(playlistId, songId) {
    const id = `ps-${nanoid(16)}`

    try {
      const query = {
        text: "INSERT INTO playlist_songs (id, playlist_id, song_id) VALUES($1, $2, $3) RETURNING id",
        values: [id, playlistId, songId],
      }

      const result = await pool.query(query)

      if (!result.rows[0].id) {
        throw new Error("Lagu gagal ditambahkan ke playlist")
      }

      return result.rows[0].id
    } catch (error) {
      console.error("Error adding song to playlist:", error)
      throw new Error("Lagu gagal ditambahkan ke playlist")
    }
  }

  async getPlaylistSongs(playlistId) {
    try {
      const playlistQuery = {
        text: `SELECT p.id, p.name, u.username 
               FROM playlists p 
               LEFT JOIN users u ON u.id = p.owner 
               WHERE p.id = $1`,
        values: [playlistId],
      }

      const songsQuery = {
        text: `SELECT s.id, s.title, s.performer 
               FROM songs s 
               LEFT JOIN playlist_songs ps ON ps.song_id = s.id 
               WHERE ps.playlist_id = $1`,
        values: [playlistId],
      }

      const playlistResult = await pool.query(playlistQuery)
      const songsResult = await pool.query(songsQuery)

      if (!playlistResult.rows.length) {
        throw new Error("Playlist tidak ditemukan")
      }

      return {
        ...playlistResult.rows[0],
        songs: songsResult.rows,
      }
    } catch (error) {
      console.error("Error getting playlist songs:", error)
      if (error.message === "Playlist tidak ditemukan") {
        throw error
      }
      throw new Error("Gagal mengambil lagu playlist")
    }
  }

  async deleteSongFromPlaylist(playlistId, songId) {
    try {
      const query = {
        text: "DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING id",
        values: [playlistId, songId],
      }

      const result = await pool.query(query)

      if (!result.rows.length) {
        throw new Error("Lagu gagal dihapus dari playlist")
      }
    } catch (error) {
      console.error("Error deleting song from playlist:", error)
      throw new Error("Lagu gagal dihapus dari playlist")
    }
  }

  async verifyPlaylistOwner(id, owner) {
    try {
      const query = {
        text: "SELECT * FROM playlists WHERE id = $1",
        values: [id],
      }

      const result = await pool.query(query)

      if (!result.rows.length) {
        throw new Error("Playlist tidak ditemukan")
      }

      const playlist = result.rows[0]

      if (playlist.owner !== owner) {
        throw new Error("Anda tidak berhak mengakses resource ini")
      }
    } catch (error) {
      if (error.message.includes("tidak ditemukan") || error.message.includes("tidak berhak")) {
        throw error
      }
      console.error("Error verifying playlist owner:", error)
      throw new Error("Gagal memverifikasi playlist")
    }
  }

  async verifyPlaylistExists(id) {
    try {
      const query = {
        text: "SELECT * FROM playlists WHERE id = $1",
        values: [id],
      }

      const result = await pool.query(query)

      if (!result.rows.length) {
        throw new Error("Playlist tidak ditemukan")
      }
    } catch (error) {
      if (error.message.includes("tidak ditemukan")) {
        throw error
      }
      console.error("Error verifying playlist exists:", error)
      throw new Error("Playlist tidak ditemukan")
    }
  }

  async verifyPlaylistAccess(playlistId, userId) {
    try {
      // First check if playlist exists
      await this.verifyPlaylistExists(playlistId)

      const query = {
        text: `SELECT p.id FROM playlists p 
             LEFT JOIN collaborations c ON c.playlist_id = p.id 
             WHERE p.id = $1 AND (p.owner = $2 OR c.user_id = $2)`,
        values: [playlistId, userId],
      }

      const result = await pool.query(query)

      if (!result.rows.length) {
        throw new Error("Anda tidak berhak mengakses resource ini")
      }
    } catch (error) {
      if (error.message.includes("tidak ditemukan")) {
        throw error
      }
      if (error.message.includes("tidak berhak")) {
        throw error
      }
      console.error("Error verifying playlist access:", error)
      throw new Error("Gagal memverifikasi akses playlist")
    }
  }
}

module.exports = PlaylistsService
