import prisma from '~/server/utils/prisma'
import { requireSessionChefId } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const chefId = requireSessionChefId(event)
  const body = await readBody(event)

  if (!id || !/^\d+$/.test(id)) throw createError({ statusCode: 400, message: 'The recipe ID is not valid.' })
  if (!body.title || !body.instructions) throw createError({ statusCode: 400, message: 'The title and instructions are required.' })

  const cookingTime = Number.parseInt(body.cooking_time)
  const servings = Number.parseInt(body.servings || 1)
  if (!Number.isInteger(cookingTime) || cookingTime <= 0 || !Number.isInteger(servings) || servings <= 0) {
    throw createError({ statusCode: 400, message: 'Cooking time and servings must be positive values.' })
  }
  if (!['easy', 'medium', 'hard'].includes(body.difficulty || 'medium')) {
    throw createError({ statusCode: 400, message: 'The selected difficulty is not valid.' })
  }
  if (!['breakfast', 'lunch', 'dinner', 'dessert'].includes(body.category || 'dinner')) {
    throw createError({ statusCode: 400, message: 'The selected category is not valid.' })
  }

  const image = String(body.image || '').trim()
  if (image && !/^https?:\/\//i.test(image)) {
    throw createError({ statusCode: 400, message: 'The recipe image URL is not valid.' })
  }

  const items = (body.ingredients || []).filter((item: any) => String(item.name || '').trim())
  const ingredientNames = items.map((item: any) => String(item.name).trim().toLowerCase())
  if (new Set(ingredientNames).size !== ingredientNames.length) {
    throw createError({ statusCode: 400, message: 'The same ingredient cannot be added twice.' })
  }
  if (items.some((item: any) => !String(item.quantity || '').trim())) {
    throw createError({ statusCode: 400, message: 'Every ingredient must have a quantity.' })
  }

  const recipeId = BigInt(id)
  const recipe = await prisma.recipes.findUnique({ where: { id: recipeId }, select: { chef_id: true } })
  if (!recipe) throw createError({ statusCode: 404, message: 'The recipe does not exist.' })
  if (recipe.chef_id !== chefId) throw createError({ statusCode: 403, message: 'You can only edit your own recipes.' })

  try {
    await prisma.$transaction(async (tx) => {
      await tx.recipes.update({
        where: { id: recipeId },
        data: {
          title: String(body.title).trim(),
          description: String(body.description || '').trim() || null,
          image: image || null,
          instructions: String(body.instructions).trim(),
          cooking_time: cookingTime,
          difficulty: body.difficulty || 'medium',
          category: body.category || 'dinner',
          servings
        }
      })

      await tx.recipe_ingredients.deleteMany({ where: { recipe_id: recipeId } })

      for (const item of items) {
        const normalizedName = String(item.name).trim().toLowerCase()
        const existing = await tx.ingredients.findFirst({ where: { name: { equals: normalizedName, mode: 'insensitive' } } })
        const ingredientId = existing?.id || (await tx.ingredients.create({
          data: { name: normalizedName, unit: String(item.unit || '').trim() || 'pcs' }
        })).id

        await tx.recipe_ingredients.create({
          data: {
            recipe_id: recipeId,
            ingredient_id: ingredientId,
            quantity: String(item.quantity).trim()
          }
        })
      }
    })

    return { success: true, recipeId }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('Recipe update error:', error)
    throw createError({ statusCode: 500, message: 'The recipe could not be updated.' })
  }
})
