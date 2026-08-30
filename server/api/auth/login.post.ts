import prisma from '~/server/utils/prisma'
import { createSession } from '~/server/utils/auth'
import { hashPassword, verifyPassword } from '~/server/utils/password'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const identifier = String(body.identifier || '').trim()
  const password = String(body.password || '')

  if (!identifier || !password) throw createError({ statusCode: 400, message: 'Enter your email and password.' })

  const chef = await prisma.chefs.findFirst({
    where: {
      OR: [
        { email: { equals: identifier.toLowerCase(), mode: 'insensitive' } },
        { username: { equals: identifier, mode: 'insensitive' } }
      ]
    },
    include: { chef_profiles: true }
  })

  if (!chef) throw createError({ statusCode: 401, message: 'Incorrect sign-in details.' })
  const result = await verifyPassword(password, chef.password)
  if (!result.valid) throw createError({ statusCode: 401, message: 'Incorrect sign-in details.' })

  if (result.needsUpgrade) {
    await prisma.chefs.update({ where: { id: chef.id }, data: { password: await hashPassword(password) } })
  }

  createSession(event, chef.id)
  return { id: chef.id, username: chef.username, email: chef.email, chef_profiles: chef.chef_profiles }
})
