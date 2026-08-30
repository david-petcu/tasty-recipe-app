import prisma from '~/server/utils/prisma'
import { createSession } from '~/server/utils/auth'
import { hashPassword } from '~/server/utils/password'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const username = String(body.username || '').trim()
  const email = String(body.email || '').trim().toLowerCase()
  const password = String(body.password || '')

  if (username.length < 3) throw createError({ statusCode: 400, message: 'The username must be at least 3 characters long.' })
  if (!/^\S+@\S+\.\S+$/.test(email)) throw createError({ statusCode: 400, message: 'The email address is not valid.' })
  if (password.length < 8) throw createError({ statusCode: 400, message: 'The password must be at least 8 characters long.' })

  try {
    const chef = await prisma.chefs.create({
      data: {
        username,
        email,
        password: await hashPassword(password),
        chef_profiles: {
          create: {
            location: String(body.location || '').trim() || null,
            bio: String(body.bio || '').trim() || null
          }
        }
      },
      include: { chef_profiles: true }
    })

    createSession(event, chef.id)
    return { id: chef.id, username: chef.username, email: chef.email, chef_profiles: chef.chef_profiles }
  } catch (error: any) {
    if (error.code === 'P2002') throw createError({ statusCode: 409, message: 'That email address or username is already in use.' })
    throw error
  }
})
