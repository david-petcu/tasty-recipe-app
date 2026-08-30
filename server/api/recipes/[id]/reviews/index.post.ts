import prisma from '~/server/utils/prisma'
import { requireSessionChefId } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const chefId = requireSessionChefId(event)
  if (!id || !/^\d+$/.test(id)) throw createError({ statusCode: 400, message: 'The recipe ID is not valid.' })

  const recipeId = BigInt(id)
  const body = await readBody(event)
  const rating = Number(body.rating)
  const comment = String(body.comment || '').trim()

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw createError({ statusCode: 400, message: 'Choose a rating between 1 and 5 stars.' })
  }
  if (comment.length > 1000) {
    throw createError({ statusCode: 400, message: 'The review cannot exceed 1,000 characters.' })
  }

  const recipe = await prisma.recipes.findUnique({ where: { id: recipeId }, select: { id: true, chef_id: true } })
  if (!recipe) throw createError({ statusCode: 404, message: 'The recipe does not exist.' })
  if (recipe.chef_id === chefId) {
    throw createError({ statusCode: 400, message: 'You cannot review your own recipe.' })
  }

  return await prisma.recipe_reviews.upsert({
    where: { chef_id_recipe_id: { chef_id: chefId, recipe_id: recipeId } },
    create: { chef_id: chefId, recipe_id: recipeId, rating, comment: comment || null },
    update: { rating, comment: comment || null }
  })
})
