import prisma from '~/server/utils/prisma'
import { clearAuthSession, requireSessionChefId } from '~/server/utils/auth'
import { verifyPassword } from '~/server/utils/password'

export default defineEventHandler(async (event) => {
  const chefId = requireSessionChefId(event)
  const body = await readBody(event)
  const password = String(body.password || '')

  if (!password) throw createError({ statusCode: 400, message: 'Enter your password to delete the account.' })
  const chef = await prisma.chefs.findUnique({ where: { id: chefId }, select: { password: true } })
  if (!chef) throw createError({ statusCode: 404, message: 'Account not found.' })
  const result = await verifyPassword(password, chef.password)
  if (!result.valid) throw createError({ statusCode: 401, message: 'The password is incorrect.' })

  await prisma.chefs.delete({ where: { id: chefId } })
  clearAuthSession(event)
  return { success: true }
})
