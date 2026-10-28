import { randomUUID } from 'node:crypto'
import { unlink } from 'node:fs/promises'
import path from 'node:path'
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const isProduction = process.env.NODE_ENV === 'production'
const bucket = process.env.S3_BUCKET ?? 'uploads'
const uploadsDir = path.resolve('uploads')

const OBJECT_PREFIX = 'avatars/'
const SIGNED_URL_TTL = 60 * 60 * 24 * 7 // 7 dias

const EXTENSIONS: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
}

export interface UploadedImage {
  buffer?: Buffer
  filename?: string
  mimetype: string
  originalname: string
}

let client: S3Client | null = null

/**
 * O Neon Object Storage é usado somente em produção. Em desenvolvimento
 * as imagens continuam no disco local, em backend/uploads.
 */
export const usesObjectStorage = isProduction

function getClient() {
  if (client) return client

  const required = [
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
    'AWS_ENDPOINT_URL_S3',
    'AWS_REGION',
  ] as const

  const missing = required.filter((key) => !process.env[key])

  if (missing.length > 0) {
    throw new Error(
      `Neon Object Storage mal configurado. Defina: ${missing.join(', ')}. ` +
        'Puxe as credenciais do branch de produção com `neon env pull`.',
    )
  }

  client = new S3Client({
    region: process.env.AWS_REGION!,
    endpoint: process.env.AWS_ENDPOINT_URL_S3!,
    forcePathStyle: true,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  })

  return client
}

export function assertStorageConfigured() {
  if (isProduction) getClient()
}

function isObjectKey(key: string) {
  return key.startsWith(OBJECT_PREFIX)
}

function isUrl(value: string) {
  return /^https?:\/\//i.test(value)
}

/**
 * Salva a imagem e devolve a referência que será persistida no banco.
 * Em produção a referência é a key do objeto; em desenvolvimento é o
 * nome do arquivo gravado pelo Multer em uploads/.
 */
export async function saveProfilePic(file: UploadedImage): Promise<string> {
  if (!isProduction) {
    if (!file.filename) {
      throw new Error('Não foi possível gravar a imagem no disco local.')
    }

    return file.filename
  }

  if (!file.buffer) {
    throw new Error('Buffer da imagem indisponível para envio ao object storage.')
  }

  const extension = EXTENSIONS[file.mimetype] ?? path.extname(file.originalname).toLowerCase()
  const key = `${OBJECT_PREFIX}${randomUUID()}${extension}`

  await getClient().send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
      CacheControl: 'public, max-age=31536000, immutable',
    }),
  )

  return key
}

/**
 * Remove uma imagem do storage. Falhas são registradas no log e não
 * interrompem a operação principal (ex.: excluir o usuário).
 */
export async function deleteProfilePic(reference: string | null | undefined) {
  if (!reference || isUrl(reference)) return

  if (!isProduction) {
    const filename = path.basename(reference)

    await unlink(path.join(uploadsDir, filename)).catch((error: NodeJS.ErrnoException) => {
      if (error.code !== 'ENOENT') {
        console.error('Erro ao remover imagem local:', error)
      }
    })

    return
  }

  // Referências antigas (arquivos locais) não existem no bucket.
  if (!isObjectKey(reference)) return

  try {
    await getClient().send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: reference,
      }),
    )
  } catch (error) {
    console.error('Erro ao remover imagem do Neon Object Storage:', error)
  }
}

/**
 * Converte a referência salva no banco na URL usada pelo frontend.
 * Em produção gera uma URL assinada (bucket privado). Referências
 * antigas continuam apontando para /uploads.
 */
export async function resolveProfilePicUrl(reference: string | null) {
  if (!reference || isUrl(reference) || !isProduction) return reference
  if (!isObjectKey(reference)) return reference

  try {
    return await getSignedUrl(
      getClient(),
      new GetObjectCommand({
        Bucket: bucket,
        Key: reference,
      }),
      { expiresIn: SIGNED_URL_TTL },
    )
  } catch (error) {
    console.error('Erro ao assinar URL da imagem:', error)
    return null
  }
}
