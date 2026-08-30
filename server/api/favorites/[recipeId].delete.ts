import prisma from '~/server/utils/prisma'
import { requireSessionChefId } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const chefId = requireSessionChefId(event)
  const recipeId = getRouterParam(event, 'recipeId')
  if (!recipeId || !/^\d+$/.test(recipeId)) throw createError({ statusCode: 400, message: 'The recipe ID is not valid.' })

  await prisma.recipe_favorites.deleteMany({
    where: { chef_id: chefId, recipe_id: BigInt(recipeId) }
  })
  return { saved: false }
})
