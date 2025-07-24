const { ExportPlaylistPayloadSchema } = require("./schema")

const ExportsValidator = {
  validateExportPlaylistPayload: (payload) => {
    const validationResult = ExportPlaylistPayloadSchema.validate(payload)
    if (validationResult.error) {
      throw new Error(validationResult.error.message)
    }
  },
}

module.exports = ExportsValidator
