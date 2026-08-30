import { randomUUID } from 'node:crypto'
import type { H3Event, MultiPartData } from 'h3'

const BUCKET = 'recipe-images'
const MAX_FILE_SIZE = 5 * 1024 * 1024
const extensions: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp'
}

function storageConfig(event: H3Event) {
  const config = useRuntimeConfig(event)
  let url = String(config.supabaseUrl || '').replace(/\/$/, '')
  const key = String(config.supabaseServiceRoleKey || '')
  if (!url) {
    try {
      const databaseUrl = new URL(process.env.DIRECT_URL || process.env.DATABASE_URL || '')
      const projectRef = databaseUrl.hostname.startsWith('db.')
        ? databaseUrl.hostname.split('.')[1]
        : decodeURIComponent(databaseUrl.username).split('.')[1]
      if (projectRef) url = `https://${projectRef}.supabase.co`
    } catch {
      // The explicit SUPABASE_URL below remains the reliable fallback.
    }
  }
  if (!url || !key) {
    throw createError({
      statusCode: 503,
      message: 'Image uploads are not configured. Add SUPABASE_SERVICE_ROLE_KEY and, if needed, SUPABASE_URL to .env.'
    })
  }
  return { url, key }
}

export function validateImagePart(part: MultiPartData | undefined) {
  if (!part?.data?.length || !part.type || !extensions[part.type]) {
    throw createError({ statusCode: 400, message: 'Choose a JPEG, PNG, or WebP image.' })
  }
  if (part.data.length > MAX_FILE_SIZE) {
    throw createError({ statusCode: 413, message: 'The image cannot exceed 5 MB.' })
  }
}

export async function uploadImage(event: H3Event, chefId: bigint, part: MultiPartData, kind: 'profiles' | 'recipes') {
  validateImagePart(part)
  const { url, key } = storageConfig(event)
  const extension = extensions[part.type!]
  const objectPath = `${kind}/${chefId}/${Date.now()}-${randomUUID()}.${extension}`
  const encodedPath = objectPath.split('/').map(encodeURIComponent).join('/')
  const imageBytes = new Uint8Array(part.data.length)
  imageBytes.set(part.data)
  const response = await fetch(`${url}/storage/v1/object/${BUCKET}/${encodedPath}`, {
    method: 'POST',
    headers: {
      apikey: key,
      authorization: `Bearer ${key}`,
      'content-type': part.type!,
      'x-upsert': 'false'
    },
    body: imageBytes
  })

  if (!response.ok) {
    const detail = await response.text()
    console.error('Supabase Storage upload error:', response.status, detail)
    throw createError({ statusCode: 502, message: 'The image could not be uploaded.' })
  }

  return `${url}/storage/v1/object/public/${BUCKET}/${encodedPath}`
}
