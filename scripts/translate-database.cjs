const { createPrismaClient } = require('./prisma-client.cjs')

let prisma

const profiles = {
  1: { bio: 'Passionate about reinventing traditional Romanian cuisine.', location: 'Bucharest' },
  2: { bio: 'Mother of three and a specialist in comforting homemade desserts.', location: 'Cluj-Napoca' },
  3: { bio: 'Bringing the honest flavors of Italy to every plate.', location: 'Timisoara' },
  4: { bio: 'Nutritionist and chef creating healthy food that still tastes great.', location: 'Brasov' },
  5: { bio: 'Grill enthusiast who believes good barbecue works in any weather.', location: 'Sibiu' },
  6: { bio: 'Preserving treasured family recipes passed down through generations.', location: 'Iasi' },
  7: { bio: 'Street-food enthusiast focused on great burgers and crisp fries.', location: 'Constanta' },
  16: { bio: 'Home cook focused on simple, balanced, and flavorful meals.', location: 'Bucharest' }
}

const recipes = {
  1: {
    title: 'Romanian Stuffed Cabbage Rolls',
    description: 'Tender cabbage rolls filled with savory meat and rice.',
    instructions: 'Mix the ground meat with the rinsed rice and softened onion. Fill each cabbage leaf and roll it tightly. Arrange the rolls over shredded cabbage, add tomato juice and enough water to cover, then simmer gently for about 3 hours.'
  },
  2: {
    title: 'Creamy Polenta with Cheese',
    description: 'Warm polenta served with cottage cheese and sour cream.',
    instructions: 'Bring salted water to a boil. Gradually whisk in the cornmeal and cook over low heat until thick and smooth. Serve hot with cottage cheese and sour cream.'
  },
  3: {
    title: 'Light and Tender Crepes',
    description: 'Thin, soft crepes made for an easy breakfast.',
    instructions: 'Whisk the eggs with the milk, then gradually add the flour until smooth. Stir in a little oil. Pour a thin layer into a hot pan and cook each crepe on both sides until lightly golden.'
  },
  4: {
    title: 'Romanian Cheese Doughnuts',
    description: 'Soft cheese doughnuts served with sour cream and fruit preserve.',
    instructions: 'Mix the cottage cheese, flour, eggs, and sugar into a soft dough. Shape rings and small dough balls, then fry until evenly golden. Serve warm with sour cream and fruit preserve.'
  },
  5: {
    title: 'Cocoa Marble Loaf',
    description: 'A soft marbled loaf that pairs perfectly with coffee.',
    instructions: 'Whip the egg whites with the sugar, then fold in the yolks, oil, and flour. Divide the batter and mix cocoa into one half. Alternate both batters in a loaf pan and bake for about 40 minutes.'
  },
  6: {
    title: 'Classic Spaghetti Carbonara',
    description: 'A creamy Roman pasta made without added cream.',
    instructions: 'Cook the spaghetti in salted water and crisp the bacon in a pan. Mix the eggs with grated Parmesan and black pepper. Toss the hot pasta with the bacon and egg mixture, adding a little pasta water until glossy.'
  },
  7: {
    title: 'Spaghetti Aglio e Olio',
    description: 'Simple Italian pasta with garlic, olive oil, and parsley.',
    instructions: 'Cook the spaghetti until al dente. Gently sauté the sliced garlic in olive oil, then add chili if desired. Toss with the drained pasta and chopped parsley until evenly coated.'
  },
  8: {
    title: 'Grilled Chicken Salad',
    description: 'A fresh, protein-rich salad for a light meal.',
    instructions: 'Season and grill the chicken breast until cooked through. Chop the fresh vegetables and place them in a bowl. Slice the chicken, add it to the salad, and finish with olive oil and lemon juice.'
  },
  9: {
    title: 'Creamy Carrot Soup',
    description: 'A smooth, comforting soup with gentle sweetness.',
    instructions: 'Chop the carrots, potatoes, and onion, then simmer until tender. Reserve a little cooking liquid and blend the vegetables until smooth. Stir in the sour cream and adjust the consistency before serving.'
  },
  10: {
    title: 'Grilled Pork Neck',
    description: 'Juicy marinated pork with a deeply browned crust.',
    instructions: 'Coat the pork with oil and seasoning, then chill for several hours. Heat the grill well and cook the pieces for 6–7 minutes per side, or until browned and safely cooked through. Rest briefly before serving.'
  },
  11: {
    title: 'Romanian Meatball Soup',
    description: 'A bright, hearty soup filled with tender meatballs.',
    instructions: 'Simmer the chopped vegetables in a large pot. Mix the ground meat with rice, onion, and seasoning, then shape small meatballs. Add them to the soup, cook until tender, and finish with a sour note and fresh parsley.'
  },
  12: {
    title: 'Rustic Bean Stew',
    description: 'A rich, satisfying bean stew with a savory tomato base.',
    instructions: 'Soak the beans overnight, then cook them until tender. Soften the onion and carrot, stir in the tomato paste, and combine with the beans. Simmer briefly so the flavors come together.'
  },
  13: {
    title: 'Country-Style Potatoes',
    description: 'Golden potatoes with crisp bacon and sweet onion.',
    instructions: 'Boil the potatoes in their skins, then peel and cube them. Crisp the bacon with the onion in a large pan. Add the potatoes and cook gently until golden and well coated in the pan juices.'
  },
  14: {
    title: 'Classic Cheeseburger',
    description: 'A juicy homemade burger with melted cheese and tomato.',
    instructions: 'Shape and season the beef patty, then cook it on a hot griddle. Toast the sliced bun and melt the cheese over the meat. Assemble with sauce, lettuce, and fresh tomato.'
  },
  15: {
    title: 'Parmesan Fries',
    description: 'Crisp golden fries finished with finely grated Parmesan.',
    instructions: 'Cut the peeled potatoes into even batons. Fry until golden and crisp, then drain well. Season immediately with salt and finely grated Parmesan.'
  }
}

const ingredients = {
  35: ['allspice', 'tsp'],
  24: ['bacon', 'g'],
  27: ['cottage cheese', 'g'],
  29: ['cocoa powder', 'tbsp'],
  14: ['mixed ground meat', 'g'],
  12: ['potatoes', 'g'],
  18: ['cheddar cheese', 'g'],
  30: ['pork neck', 'g'],
  9: ['onion', 'pcs'],
  23: ['yeast', 'g'],
  28: ['fruit preserve', 'tbsp'],
  5: ['flour', 'g'],
  22: ['dried beans', 'g'],
  8: ['milk', 'ml'],
  26: ['cornmeal', 'g'],
  13: ['carrots', 'pcs'],
  17: ['rice', 'g'],
  6: ['eggs', 'pcs'],
  32: ['bread', 'slices'],
  19: ['Parmesan', 'g'],
  31: ['tomato paste', 'tbsp'],
  16: ['spaghetti', 'g'],
  25: ['parsley', 'bunch'],
  15: ['chicken breast', 'g'],
  2: ['black pepper', 'tsp'],
  11: ['tomatoes', 'pcs'],
  1: ['salt', 'tsp'],
  20: ['sour cream', 'g'],
  36: ['spinach', 'g'],
  3: ['sunflower oil', 'ml'],
  4: ['olive oil', 'ml'],
  10: ['garlic', 'cloves'],
  21: ['cabbage', 'pcs'],
  7: ['sugar', 'g']
}

async function ingredientId(tx, name, unit) {
  const existing = await tx.ingredients.findFirst({ where: { name: { equals: name, mode: 'insensitive' } } })
  if (existing) return existing.id
  return (await tx.ingredients.create({ data: { name, unit } })).id
}

async function addRecipe(tx, chefId, recipe) {
  const existing = await tx.recipes.findFirst({ where: { chef_id: chefId, title: recipe.title } })
  if (existing) return

  const created = await tx.recipes.create({
    data: {
      chef_id: chefId,
      title: recipe.title,
      description: recipe.description,
      instructions: recipe.instructions,
      cooking_time: recipe.cooking_time,
      difficulty: recipe.difficulty,
      servings: recipe.servings
    }
  })

  for (const item of recipe.ingredients) {
    const id = await ingredientId(tx, item.name, item.unit)
    await tx.recipe_ingredients.create({
      data: { recipe_id: created.id, ingredient_id: id, quantity: item.quantity }
    })
  }
}

async function main() {
  prisma = await createPrismaClient()
  await prisma.$transaction(async (tx) => {
    for (const [chefId, data] of Object.entries(profiles)) {
      await tx.chef_profiles.updateMany({ where: { chef_id: BigInt(chefId) }, data })
    }

    for (const [recipeId, data] of Object.entries(recipes)) {
      await tx.recipes.update({ where: { id: BigInt(recipeId) }, data })
    }

    for (const [ingredientIdValue, [name, unit]] of Object.entries(ingredients)) {
      await tx.ingredients.update({ where: { id: BigInt(ingredientIdValue) }, data: { name, unit } })
    }

    await tx.recipe_ingredients.updateMany({ where: { recipe_id: 4n, ingredient_id: 20n }, data: { quantity: '120' } })
    await tx.recipe_ingredients.updateMany({ where: { recipe_id: 8n, ingredient_id: 4n }, data: { quantity: '15' } })
    await tx.recipe_ingredients.updateMany({ where: { recipe_id: 9n, ingredient_id: 13n }, data: { quantity: '4' } })
    await tx.recipe_ingredients.updateMany({ where: { recipe_id: 14n, ingredient_id: 18n }, data: { quantity: '40' } })

    const radu = await tx.chefs.findUnique({ where: { id: 5n }, select: { id: true } })
    if (!radu) throw new Error('RaduGrill was not found.')

    if (await tx.recipes.count({ where: { chef_id: radu.id } }) < 2) {
      await addRecipe(tx, radu.id, {
        title: 'Grilled Chicken Skewers',
        description: 'Juicy chicken and vegetables with a lightly smoky finish.',
        instructions: 'Cut the chicken and vegetables into even pieces. Toss with olive oil, salt, and black pepper, then thread onto skewers. Grill, turning regularly, until browned and cooked through.',
        cooking_time: 30,
        difficulty: 'easy',
        servings: 4,
        ingredients: [
          { name: 'chicken breast', unit: 'g', quantity: '600' },
          { name: 'onion', unit: 'pcs', quantity: '2' },
          { name: 'tomatoes', unit: 'pcs', quantity: '3' },
          { name: 'olive oil', unit: 'ml', quantity: '30' },
          { name: 'black pepper', unit: 'tsp', quantity: '0.5' }
        ]
      })
    }

    const david = await tx.chefs.findUnique({ where: { id: 16n }, select: { id: true } })
    if (!david) throw new Error('Chef David was not found.')

    const additions = [
      {
        title: 'Garlic Mushroom Pasta',
        description: 'A quick, savory pasta with golden mushrooms and Parmesan.',
        instructions: 'Cook the spaghetti until al dente. Brown the sliced mushrooms in olive oil, then add the garlic. Toss with the pasta, a splash of cooking water, and grated Parmesan.',
        cooking_time: 25,
        difficulty: 'easy',
        servings: 2,
        ingredients: [
          { name: 'spaghetti', unit: 'g', quantity: '200' },
          { name: 'mushrooms', unit: 'g', quantity: '250' },
          { name: 'garlic', unit: 'cloves', quantity: '3' },
          { name: 'olive oil', unit: 'ml', quantity: '30' },
          { name: 'Parmesan', unit: 'g', quantity: '50' }
        ]
      },
      {
        title: 'Spinach and Feta Omelet',
        description: 'A fluffy omelet filled with spinach and tangy feta.',
        instructions: 'Whisk the eggs with the milk and a pinch of salt. Wilt the spinach in a nonstick pan, pour in the eggs, and cook gently. Add the feta, fold the omelet, and serve immediately.',
        cooking_time: 15,
        difficulty: 'easy',
        servings: 1,
        ingredients: [
          { name: 'eggs', unit: 'pcs', quantity: '3' },
          { name: 'spinach', unit: 'g', quantity: '60' },
          { name: 'feta cheese', unit: 'g', quantity: '50' },
          { name: 'milk', unit: 'ml', quantity: '30' },
          { name: 'salt', unit: 'tsp', quantity: '0.25' }
        ]
      }
    ]

    for (const recipe of additions) {
      const count = await tx.recipes.count({ where: { chef_id: david.id } })
      if (count >= 2) break
      await addRecipe(tx, david.id, recipe)
    }
  }, { timeout: 30000 })

  const verification = await prisma.chefs.findMany({
    select: { username: true, _count: { select: { recipes: true } } },
    orderBy: { id: 'asc' }
  })

  const romanianText = await prisma.$queryRaw`
    SELECT
      (SELECT count(*) FROM recipes WHERE concat_ws(' ', title, description, instructions) ~* '[ăâîșț]')::int AS recipes,
      (SELECT count(*) FROM chef_profiles WHERE concat_ws(' ', bio, location) ~* '[ăâîșț]')::int AS profiles,
      (SELECT count(*) FROM ingredients WHERE concat_ws(' ', name, unit) ~* '[ăâîșț]')::int AS ingredients
  `

  const chefsBelowMinimum = verification.filter((chef) => chef._count.recipes < 2)
  if (chefsBelowMinimum.length) {
    throw new Error(`Chefs below the two-recipe minimum: ${chefsBelowMinimum.map((chef) => chef.username).join(', ')}`)
  }

  console.log(JSON.stringify({
    chefs: verification,
    romanianText: romanianText[0]
  }, (_, value) => typeof value === 'bigint' ? value.toString() : value, 2))
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(() => prisma?.$disconnect())
