import prisma from '~/server/utils/prisma'
import { getSessionChefId } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id || !/^\d+$/.test(id)) throw createError({ statusCode: 400, message: 'The recipe ID is not valid.' })

  const recipeId = BigInt(id)
  const query = getQuery(event)
  const page = Math.max(1, Number.parseInt(String(query.page || '1')) || 1)
  const pageSize = 5
  const chefId = getSessionChefId(event)

  const [items, total, aggregate, currentUserReview] = await Promise.all([
    prisma.recipe_reviews.findMany({
      where: { recipe_id: recipeId },
      orderBy: { updated_at: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        chefs: {
          select: { id: true, username: true, chef_profiles: { select: { profile_image: true } } }
        }
      }
    }),
    prisma.recipe_reviews.count({ where: { recipe_id: recipeId } }),
    prisma.recipe_reviews.aggregate({ where: { recipe_id: recipeId }, _avg: { rating: true } }),
    chefId
      ? prisma.recipe_reviews.findUnique({ where: { chef_id_recipe_id: { chef_id: chefId, recipe_id: recipeId } } })
      : null
  ])

  return {
    items,
    total,
    average: aggregate._avg.rating || 0,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
    currentUserReview
  }
})
