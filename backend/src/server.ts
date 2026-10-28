import 'dotenv/config'
import express from 'express'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import router from './routes/routes'
import { assertStorageConfigured, usesObjectStorage } from './storage/storage.service'

const app = express()

const PORT = process.env.SERVER_PORT
const uploadsDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../uploads')

assertStorageConfigured()

app.use(express.json())
app.use('/uploads', express.static(uploadsDir, { maxAge: '7d' }))
app.use('/api', router)

app.listen(PORT, () => {
  console.log(`Server is running on  http://localhost:${PORT}`)
  console.log(
    `[storage] ${usesObjectStorage ? 'Neon Object Storage (produção)' : 'disco local (uploads/)'}`,
  )
})
