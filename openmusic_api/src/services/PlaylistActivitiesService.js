const { nanoid } = require("nanoid")
const pool = require("./database")

class PlaylistActivitiesService {
  async addActivity(playlistId, songId, userId, action) {
    const id = `activity-${nanoid(16)}`
    const time = new Date().toISOString()

    try {
      const query = {
        text: "INSERT INTO playlist_song_activities (id, playlist_id, song_id, user_id, action, time) VALUES($1, $2, $3, $4, $5, $6) RETURNING id",
        values: [id, playlistId, songId, userId, action, time],
      }

      const result = await pool.query(query)

      if (!result.rows[0].id) {
        throw new Error("Aktivitas gagal ditambahkan")
      }

      return result.rows[0].id
    } catch (error) {
      console.error("Error adding activity:", error)
      throw error // Changed from silent fail to throwing error
    }
  }

  async getPlaylistActivities(playlistId) {
    try {
      const query = {
        text: `SELECT u.username, s.title, psa.action, psa.time 
             FROM playlist_song_activities psa
             LEFT JOIN users u ON u.id = psa.user_id
             LEFT JOIN songs s ON s.id = psa.song_id
             WHERE psa.playlist_id = $1
             ORDER BY psa.time ASC`,
        values: [playlistId],
      }

      const result = await pool.query(query)
      return result.rows
    } catch (error) {
      console.error("Error getting playlist activities:", error)
      throw error // Changed from returning empty array to throwing error
    }
  }
}

module.exports = PlaylistActivitiesService
