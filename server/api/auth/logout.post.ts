import { clearAuthSession } from '~/server/utils/auth'

export default defineEventHandler((event) => {
  clearAuthSession(event)
  return { success: true }
})
