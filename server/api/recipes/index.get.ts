import prisma from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  try {
    const filters: any = {}
    const search = String(query.search || '').trim().slice(0, 100)

    if (search) {
      const contains = `%${search}%`
      const normalizedSearch = search.toLowerCase()
      const fuzzyEnabled = normalizedSearch.length >= 3
      const matches = await prisma.$queryRaw<Array<{ id: bigint }>>`
        SELECT DISTINCT r.id
        FROM recipes r
        LEFT JOIN recipe_ingredients ri ON ri.recipe_id = r.id
        LEFT JOIN ingredients i ON i.id = ri.ingredient_id
        WHERE r.title ILIKE ${contains}
           OR i.name ILIKE ${contains}
           OR (${fuzzyEnabled} AND (
             extensions.word_similarity(${normalizedSearch}, lower(r.title)) >= 0.45
             OR extensions.word_similarity(${normalizedSearch}, lower(COALESCE(i.name, ''))) >= 0.45
             OR extensions.similarity(${normalizedSearch}, lower(r.title)) >= 0.30
             OR extensions.similarity(${normalizedSearch}, lower(COALESCE(i.name, ''))) >= 0.30
           ))
      `
      filters.id = { in: matches.map(item => item.id) }
    }

    if (query.difficulty && query.difficulty !== 'all') {
      filters.difficulty = { equals: query.difficulty as string, mode: 'insensitive' }
    }
    if (query.category && query.category !== 'all') filters.category = query.category

    const servings = Number.parseInt(String(query.servings || ''))
    if (Number.isInteger(servings) && servings > 0) filters.servings = servings

    const chefId = String(query.chefId || '')
    if (/^\d+$/.test(chefId)) filters.chef_id = BigInt(chefId)

    const ingredientId = String(query.ingredientId || '')
    if (/^\d+$/.test(ingredientId)) {
      filters.recipe_ingredients = { some: { ingredient_id: BigInt(ingredientId) } }
    }

    const maxTime = Number.parseInt(String(query.maxTime || ''))
    if (Number.isInteger(maxTime) && maxTime > 0) filters.cooking_time = { lte: maxTime }

    const page = Math.max(1, Number.parseInt(String(query.page || '1')) || 1)
    const pageSize = Math.min(24, Math.max(6, Number.parseInt(String(query.pageSize || '9')) || 9))
    const sort = String(query.sort || 'newest')
    const orderBy: any = sort === 'oldest'
      ? [{ created_at: 'asc' }]
      : sort === 'time-asc'
        ? [{ cooking_time: 'asc' }, { created_at: 'desc' }]
        : sort === 'time-desc'
          ? [{ cooking_time: 'desc' }, { created_at: 'desc' }]
          : sort === 'difficulty'
            ? [{ difficulty: 'asc' }, { created_at: 'desc' }]
            : [{ created_at: 'desc' }]

    const [total, rows] = await prisma.$transaction([
      prisma.recipes.count({ where: filters }),
      prisma.recipes.findMany({
        where: filters,
        include: {
          chefs: { select: { username: true } }
        },
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize
      })
    ])

    const ratings = rows.length
      ? await prisma.recipe_reviews.groupBy({
          by: ['recipe_id'],
          where: { recipe_id: { in: rows.map(recipe => recipe.id) } },
          _avg: { rating: true },
          _count: { rating: true }
        })
      : []
    const ratingByRecipe = new Map(ratings.map(item => [item.recipe_id.toString(), item]))
    const items = rows.map(recipe => {
      const rating = ratingByRecipe.get(recipe.id.toString())
      return {
        ...recipe,
        averageRating: rating?._avg.rating || 0,
        reviewCount: rating?._count.rating || 0
      }
    })

    return {
      items,
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / pageSize))
    }
  } catch (error) {
    console.error('Recipe filtering error:', error)
    throw createError({ statusCode: 500, message: 'The recipes could not be filtered.' })
  }
})
