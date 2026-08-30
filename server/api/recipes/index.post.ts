import prisma from '~/server/utils/prisma'
import { requireSessionChefId } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const chefId = requireSessionChefId(event)

  if (!body.title || !body.instructions) {
    throw createError({ statusCode: 400, message: 'The title and instructions are required.' })
  }

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

  const ingredientNames = (body.ingredients || []).filter((item: any) => item.name).map((item: any) => item.name.trim().toLowerCase())
  if (new Set(ingredientNames).size !== ingredientNames.length) {
    throw createError({ statusCode: 400, message: 'The same ingredient cannot be added twice.' })
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const newRecipe = await tx.recipes.create({
        data: {
          title: String(body.title).trim(),
          description: String(body.description || '').trim() || null,
          image: image || null,
          instructions: String(body.instructions).trim(),
          cooking_time: cookingTime,
          difficulty: body.difficulty || 'medium',
          category: body.category || 'dinner',
          servings,
          chef_id: chefId
        }
      })

      if (body.ingredients && body.ingredients.length > 0) {
        for (const item of body.ingredients) {
          if (!item.name) continue
          const normalizedName = String(item.name).trim().toLowerCase()

          const existingIng = await tx.ingredients.findFirst({
              where: { name: { equals: normalizedName, mode: 'insensitive' } }
          })

          const ingredientId = existingIng?.id || (await tx.ingredients.create({
                  data: {
                      name: normalizedName,
                      unit: String(item.unit || '').trim() || 'pcs'
                  }
              })).id

          await tx.recipe_ingredients.create({
            data: {
              recipe_id: newRecipe.id,
              ingredient_id: ingredientId,
              quantity: String(item.quantity || '').trim()
            }
          })
        }
      }

      return newRecipe
    })

    return { success: true, recipeId: result.id }

  } catch (e: any) {
    console.error("Server error:", e)
    if (e.statusCode) throw e
    throw createError({
        statusCode: 500,
        message: e.code === 'P2002' ? 'This recipe contains a duplicate ingredient.' : 'The recipe could not be saved.'
    })
  }
})
