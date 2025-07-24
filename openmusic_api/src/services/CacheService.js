const redis = require("redis")

class CacheService {
  constructor() {
    this._client = redis.createClient({
      socket: {
        host: process.env.REDIS_SERVER.split(":")[0] || "localhost",
        port: process.env.REDIS_SERVER.split(":")[1] || 6379,
      },
    })

    this._client.on("error", (error) => {
      console.error("Redis Client Error:", error)
    })

    this._client.connect()
  }

  async set(key, value, expirationInSecond = 1800) {
    await this._client.setEx(key, expirationInSecond, JSON.stringify(value))
  }

  async get(key) {
    const result = await this._client.get(key)
    if (result === null) return result

    return JSON.parse(result)
  }

  async delete(key) {
    return this._client.del(key)
  }
}

module.exports = CacheService
