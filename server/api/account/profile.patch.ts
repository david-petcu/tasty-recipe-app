import prisma from '~/server/utils/prisma'
import { requireSessionChefId } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const chefId = requireSessionChefId(event)
  const body = await readBody(event)

  const username = String(body.username || '').trim()
  const email = String(body.email || '').trim().toLowerCase()
  const bio = String(body.bio || '').trim()
  const location = String(body.location || '').trim()
  const profileImage = String(body.profile_image || '').trim()
  const yearsExperience = Number(body.years_experience)

  if (username.length < 3 || username.length > 40) {
    throw createError({ statusCode: 400, message: 'The username must be between 3 and 40 characters long.' })
  }
  if (!/^\S+@\S+\.\S+$/.test(email) || email.length > 254) {
    throw createError({ statusCode: 400, message: 'Enter a valid email address.' })
  }
  if (bio.length > 500) {
    throw createError({ statusCode: 400, message: 'The bio cannot exceed 500 characters.' })
  }
  if (location.length > 100) {
    throw createError({ statusCode: 400, message: 'The location cannot exceed 100 characters.' })
  }
  if (!Number.isInteger(yearsExperience) || yearsExperience < 0 || yearsExperience > 80) {
    throw createError({ statusCode: 400, message: 'Years of experience must be a whole number between 0 and 80.' })
  }
  if (profileImage) {
    try {
      const url = new URL(profileImage)
      if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Invalid protocol')
    } catch {
      throw createError({ statusCode: 400, message: 'The profile image must be a valid HTTP or HTTPS URL.' })
    }
  }

  try {
    return await prisma.$transaction(async (tx) => {
      await tx.chefs.update({
        where: { id: chefId },
        data: { username, email }
      })

      await tx.chef_profiles.upsert({
        where: { chef_id: chefId },
        create: {
          chef_id: chefId,
          bio: bio || null,
          location: location || null,
          profile_image: profileImage || null,
          years_experience: yearsExperience
        },
        update: {
          bio: bio || null,
          location: location || null,
          profile_image: profileImage || null,
          years_experience: yearsExperience
        }
      })

      return await tx.chefs.findUnique({
        where: { id: chefId },
        select: {
          id: true,
          username: true,
          email: true,
          chef_profiles: true,
          _count: { select: { recipes: true } }
        }
      })
    })
  } catch (error: any) {
    if (error.statusCode) throw error
    if (error.code === 'P2002') {
      throw createError({ statusCode: 409, message: 'That username or email address is already in use.' })
    }
    console.error('Profile update error:', error)
    throw createError({ statusCode: 500, message: 'The profile could not be updated.' })
  }
})
