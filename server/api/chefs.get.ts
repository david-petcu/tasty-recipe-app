import prisma from '~/server/utils/prisma'

export default defineEventHandler(async () => {
  return await prisma.chefs.findMany({
    select: {
      id: true,
      username: true,
      chef_profiles: true, // Profile details (bio and experience)
      _count: {
        select: { recipes: true } // Number of recipes per chef
      }
    }
  })
})
