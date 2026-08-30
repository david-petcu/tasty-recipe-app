import prisma from '~/server/utils/prisma'
import { requireSessionChefId } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const chefId = requireSessionChefId(event)

  if (!id) {
    throw createError({ statusCode: 400, message: 'The recipe ID is missing.' })
  }

  try {
    const recipeId = BigInt(id)
    const recipe = await prisma.recipes.findUnique({ where: { id: recipeId }, select: { chef_id: true } })
    if (!recipe) throw createError({ statusCode: 404, message: 'The recipe does not exist.' })
    if (recipe.chef_id !== chefId) throw createError({ statusCode: 403, message: 'You can only delete your own recipes.' })

    await prisma.recipes.delete({ where: { id: recipeId } })

    return { success: true, message: 'Recipe deleted.' }

  } catch (error: any) {
    console.error("Recipe deletion error:", error)
    if (error.statusCode) throw error
    throw createError({ statusCode: 500, message: 'The recipe could not be deleted.' })
  }
})
