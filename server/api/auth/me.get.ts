import prisma from '~/server/utils/prisma'
import { getSessionChefId } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const chefId = getSessionChefId(event)
  if (!chefId) return null

  return await prisma.chefs.findUnique({
    where: { id: chefId },
    select: {
      id: true,
      username: true,
      email: true,
      chef_profiles: true,
      _count: { select: { recipes: true } }
    }
  })
})
