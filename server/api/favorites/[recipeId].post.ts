import prisma from '~/server/utils/prisma'
import { requireSessionChefId } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const chefId = requireSessionChefId(event)
  const recipeId = getRouterParam(event, 'recipeId')
  if (!recipeId || !/^\d+$/.test(recipeId)) throw createError({ statusCode: 400, message: 'The recipe ID is not valid.' })

  const parsedRecipeId = BigInt(recipeId)
  const recipeExists = await prisma.recipes.findUnique({ where: { id: parsedRecipeId }, select: { id: true } })
  if (!recipeExists) throw createError({ statusCode: 404, message: 'The recipe does not exist.' })

  await prisma.recipe_favorites.upsert({
    where: { chef_id_recipe_id: { chef_id: chefId, recipe_id: parsedRecipeId } },
    create: { chef_id: chefId, recipe_id: parsedRecipeId },
    update: {}
  })
  return { saved: true }
})
