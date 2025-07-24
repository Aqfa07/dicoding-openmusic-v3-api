const { nanoid } = require("nanoid")
const pool = require("./database")

class AlbumLikesService {
  async addLike(userId, albumId) {
    const id = `like-${nanoid(16)}`

    // Check if user already liked this album
    const checkQuery = {
      text: "SELECT id FROM user_album_likes WHERE user_id = $1 AND album_id = $2",
      values: [userId, albumId],
    }

    const checkResult = await pool.query(checkQuery)
    if (checkResult.rows.length > 0) {
      throw new Error("Album sudah disukai")
    }

    const query = {
      text: "INSERT INTO user_album_likes (id, user_id, album_id) VALUES($1, $2, $3) RETURNING id",
      values: [id, userId, albumId],
    }

    const result = await pool.query(query)

    if (!result.rows[0].id) {
      throw new Error("Gagal menyukai album")
    }

    return result.rows[0].id
  }

  async removeLike(userId, albumId) {
    const query = {
      text: "DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2 RETURNING id",
      values: [userId, albumId],
    }

    const result = await pool.query(query)

    if (!result.rows.length) {
      throw new Error("Gagal batal menyukai album")
    }
  }

  async getLikesCount(albumId) {
    const query = {
      text: "SELECT COUNT(*) as likes FROM user_album_likes WHERE album_id = $1",
      values: [albumId],
    }

    const result = await pool.query(query)
    return Number.parseInt(result.rows[0].likes)
  }
}

module.exports = AlbumLikesService
