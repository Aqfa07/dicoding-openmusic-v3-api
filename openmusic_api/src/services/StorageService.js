const fs = require("fs")
const path = require("path")
const AWS = require("aws-sdk")

class StorageService {
  constructor() {
    this._useS3 = process.env.AWS_BUCKET_NAME && process.env.AWS_ACCESS_KEY_ID

    if (this._useS3) {
      this._S3 = new AWS.S3({
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION,
      })
    } else {
      // Pastikan direktori uploads ada untuk penyimpanan lokal
      const uploadsDir = path.resolve(__dirname, "../uploads")
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true })
        console.log("Created uploads directory:", uploadsDir)
      }
    }
  }

  async writeFile(file, meta) {
    const filename = +new Date() + meta.filename

    if (this._useS3) {
      try {
        // Untuk upload S3
        let fileBuffer
        if (file._data) {
          fileBuffer = file._data
        } else {
          // Jika file adalah stream, konversi ke buffer
          const chunks = []
          for await (const chunk of file) {
            chunks.push(chunk)
          }
          fileBuffer = Buffer.concat(chunks)
        }

        const parameter = {
          Bucket: process.env.AWS_BUCKET_NAME,
          Key: filename,
          Body: fileBuffer,
          ContentType: meta.headers["content-type"],
        }

        const result = await this._S3.upload(parameter).promise()
        return result.Location
      } catch (error) {
        console.error("S3 upload error:", error)
        throw new Error("Gagal mengunggah file ke S3")
      }
    } else {
      // Penyimpanan file lokal
      try {
        const filePath = path.resolve(__dirname, "../uploads", filename)
        console.log("Saving file to:", filePath)

        return new Promise((resolve, reject) => {
          const fileStream = fs.createWriteStream(filePath)

          fileStream.on("error", (error) => {
            console.error("File write error:", error)
            reject(new Error("Gagal menyimpan file"))
          })

          file.on("error", (error) => {
            console.error("File stream error:", error)
            reject(new Error("Gagal membaca file"))
          })

          file.on("end", () => {
            console.log("File stream ended")
          })

          file.pipe(fileStream)

          fileStream.on("finish", () => {
            console.log("File saved successfully:", filename)
            const host = process.env.HOST || "localhost"
            const port = process.env.PORT || 5000
            resolve(`http://${host}:${port}/uploads/${filename}`)
          })
        })
      } catch (error) {
        console.error("Local storage error:", error)
        throw new Error("Gagal menyimpan file")
      }
    }
  }
}

module.exports = StorageService
