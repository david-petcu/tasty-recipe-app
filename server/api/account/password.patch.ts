import prisma from '~/server/utils/prisma'
import { requireSessionChefId } from '~/server/utils/auth'
import { hashPassword, verifyPassword } from '~/server/utils/password'

export default defineEventHandler(async (event) => {
  const chefId = requireSessionChefId(event)
  const body = await readBody(event)
  const currentPassword = String(body.currentPassword || '')
  const newPassword = String(body.newPassword || '')

  if (!currentPassword) throw createError({ statusCode: 400, message: 'Enter your current password.' })
  if (newPassword.length < 8 || newPassword.length > 128) {
    throw createError({ statusCode: 400, message: 'The new password must be between 8 and 128 characters long.' })
  }
  if (currentPassword === newPassword) {
    throw createError({ statusCode: 400, message: 'Choose a password different from your current password.' })
  }

  const chef = await prisma.chefs.findUnique({ where: { id: chefId }, select: { password: true } })
  if (!chef) throw createError({ statusCode: 404, message: 'Account not found.' })
  const result = await verifyPassword(currentPassword, chef.password)
  if (!result.valid) throw createError({ statusCode: 401, message: 'The current password is incorrect.' })

  await prisma.chefs.update({ where: { id: chefId }, data: { password: await hashPassword(newPassword) } })
  return { success: true }
})
