import prisma from '~/server/utils/prisma'
import { requireSessionChefId } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const chefId = requireSessionChefId(event)
  const favorites = await prisma.recipe_favorites.findMany({
    where: { chef_id: chefId },
    orderBy: { created_at: 'desc' },
    select: {
      created_at: true,
      recipes: {
        select: {
          id: true,
          title: true,
          description: true,
          cooking_time: true,
          difficulty: true,
          category: true,
          servings: true,
          chefs: { select: { id: true, username: true } }
        }
      }
    }
  })

  return favorites.map(item => ({ ...item.recipes, saved_at: item.created_at }))
})
