import prisma from '~/server/utils/prisma'
import { getSessionChefId } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const chefId = getSessionChefId(event)
  const recipeId = getRouterParam(event, 'recipeId')
  if (!chefId || !recipeId || !/^\d+$/.test(recipeId)) return { saved: false }

  const favorite = await prisma.recipe_favorites.findUnique({
    where: { chef_id_recipe_id: { chef_id: chefId, recipe_id: BigInt(recipeId) } },
    select: { id: true }
  })
  return { saved: Boolean(favorite) }
})
