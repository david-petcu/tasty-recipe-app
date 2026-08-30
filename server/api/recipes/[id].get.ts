import prisma from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  if (!id) throw createError({ statusCode: 400, message: 'The recipe ID is missing.' })

  const recipe = await prisma.recipes.findUnique({
    where: { id: BigInt(id) },
    include: {
      // Ingredients and details
      recipe_ingredients: {
        include: { ingredients: true }
      },
      // Chef and profile
      chefs: {
        select: {
          id: true,
          username: true,
          chef_profiles: true
        }
      }
    }
  })

  if (!recipe) {
    throw createError({ statusCode: 404, message: 'Recipe not found.' })
  }

  return recipe
})
