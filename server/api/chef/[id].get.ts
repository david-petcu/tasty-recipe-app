// server/api/chef/[id].get.ts
import prisma from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  const chef = await prisma.chefs.findUnique({
    where: {
      id: BigInt(id)
    },
    select: {
      id: true,
      username: true,
      chef_profiles: true,
      recipes: {
        select: {
          id: true,
          title: true,
          description: true,
          image: true,
          cooking_time: true,
          difficulty: true,
          servings: true,
          created_at: true
        }
      }
    }
  })

  if (!chef) {
    throw createError({ statusCode: 404, statusMessage: 'Chef not found.' })
  }

  return chef
})
