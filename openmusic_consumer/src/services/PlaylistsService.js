const pool = require("./database")

class PlaylistsService {
  async getPlaylistSongs(playlistId) {
    try {
      const playlistQuery = {
        text: `SELECT p.id, p.name 
               FROM playlists p 
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
        id: playlistResult.rows[0].id,
        name: playlistResult.rows[0].name,
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
}

module.exports = PlaylistsService
