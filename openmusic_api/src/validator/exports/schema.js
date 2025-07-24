const Joi = require("@hapi/joi")

const ExportPlaylistPayloadSchema = Joi.object({
  targetEmail: Joi.string().email({ tlds: true }).required(),
})

module.exports = { ExportPlaylistPayloadSchema }
