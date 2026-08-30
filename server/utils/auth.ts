import { createHmac, timingSafeEqual } from 'node:crypto'
import type { H3Event } from 'h3'
import { deleteCookie, getCookie, setCookie } from 'h3'

const COOKIE_NAME = 'tasty_session'
const SESSION_DURATION = 60 * 60 * 24 * 30

function signature(value: string, secret: string) {
  return createHmac('sha256', secret).update(value).digest('base64url')
}

function getSecret(event: H3Event) {
  return useRuntimeConfig(event).authSecret as string
}

export function createSession(event: H3Event, chefId: bigint) {
  const expires = Math.floor(Date.now() / 1000) + SESSION_DURATION
  const payload = `${chefId.toString()}.${expires}`
  const token = `${payload}.${signature(payload, getSecret(event))}`

  setCookie(event, COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_DURATION
  })
}

export function clearAuthSession(event: H3Event) {
  deleteCookie(event, COOKIE_NAME, { path: '/' })
}

export function getSessionChefId(event: H3Event): bigint | null {
  const token = getCookie(event, COOKIE_NAME)
  if (!token) return null

  const [id, expires, receivedSignature] = token.split('.')
  if (!id || !expires || !receivedSignature || Number(expires) < Date.now() / 1000) return null

  const payload = `${id}.${expires}`
  const expectedSignature = signature(payload, getSecret(event))
  const expected = Buffer.from(expectedSignature)
  const received = Buffer.from(receivedSignature)

  if (expected.length !== received.length || !timingSafeEqual(expected, received)) return null
  try { return BigInt(id) } catch { return null }
}

export function requireSessionChefId(event: H3Event) {
  const chefId = getSessionChefId(event)
  if (!chefId) throw createError({ statusCode: 401, message: 'You must be signed in.' })
  return chefId
}
