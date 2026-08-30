import { randomBytes, scrypt as nodeScrypt, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'

const scrypt = promisify(nodeScrypt)
const PREFIX = 'scrypt'

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex')
  const derivedKey = await scrypt(password, salt, 64) as Buffer
  return `${PREFIX}$${salt}$${derivedKey.toString('hex')}`
}

export async function verifyPassword(password: string, storedPassword: string) {
  const [prefix, salt, storedHash] = storedPassword.split('$')

  // Temporary compatibility with users created before authentication was added.
  if (prefix !== PREFIX || !salt || !storedHash) {
    return { valid: password === storedPassword, needsUpgrade: password === storedPassword }
  }

  const derivedKey = await scrypt(password, salt, 64) as Buffer
  const storedKey = Buffer.from(storedHash, 'hex')
  const valid = storedKey.length === derivedKey.length && timingSafeEqual(storedKey, derivedKey)
  return { valid, needsUpgrade: false }
}
