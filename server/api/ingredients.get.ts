// server/api/ingredients.get.ts
import prisma from '~/server/utils/prisma'

export default defineEventHandler(async () => {
  // Return ingredients in alphabetical order.
  return await prisma.ingredients.findMany({
    orderBy: { name: 'asc' }
  })
})
