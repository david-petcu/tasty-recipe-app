import prisma from '~/server/utils/prisma'
import { requireSessionChefId } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const chefId = requireSessionChefId(event)
  if (!id || !/^\d+$/.test(id)) throw createError({ statusCode: 400, message: 'The recipe ID is not valid.' })

  await prisma.recipe_reviews.deleteMany({
    where: { chef_id: chefId, recipe_id: BigInt(id) }
  })
  return { success: true }
})
