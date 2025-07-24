const { PlaylistPayloadSchema, PlaylistSongPayloadSchema } = require("./schema")

const PlaylistsValidator = {
  validatePlaylistPayload: (payload) => {
    const validationResult = PlaylistPayloadSchema.validate(payload)
    if (validationResult.error) {
      throw new Error(validationResult.error.message)
    }
  },
  validatePlaylistSongPayload: (payload) => {
    const validationResult = PlaylistSongPayloadSchema.validate(payload)
    if (validationResult.error) {
      throw new Error(validationResult.error.message)
    }
  },
}

module.exports = PlaylistsValidator
