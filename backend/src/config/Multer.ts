import multer from 'multer'
import path from 'node:path'
import crypto from 'node:crypto'

const isProduction = process.env.NODE_ENV === 'production'

const diskStorage = multer.diskStorage({
  destination: './uploads',

  filename: (_req, file, callback) => {
    const extensao = path.extname(file.originalname).toLowerCase()
    const nomeArquivo = `${crypto.randomUUID()}${extensao}`

    callback(null, nomeArquivo)
  },
})

// Em produção a imagem fica em memória e é enviada ao Neon Object Storage
// pelo controller. Em desenvolvimento continua sendo gravada em uploads/.
const storage = isProduction ? multer.memoryStorage() : diskStorage

const multerConfig = multer({
  storage,

  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
    files: 1,
  },

  fileFilter: (_req, file, callback) => {
    const tiposPermitidos = ['image/jpeg', 'image/png', 'image/webp']

    if (!tiposPermitidos.includes(file.mimetype)) {
      return callback(new Error('Formato de imagem inválido'))
    }

    callback(null, true)
  },
})

export default multerConfig
