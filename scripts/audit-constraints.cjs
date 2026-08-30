const { createPrismaClient } = require('./prisma-client.cjs')

let prisma

async function main() {
  prisma = await createPrismaClient()
  const tables = "'chefs','chef_profiles','recipes','ingredients','recipe_ingredients','recipe_favorites','recipe_reviews'"
  const constraints = await prisma.$queryRawUnsafe(`
    SELECT conrelid::regclass::text AS table_name,
           conname,
           contype::text AS contype,
           pg_get_constraintdef(oid) AS definition
    FROM pg_constraint
    WHERE connamespace = 'public'::regnamespace
      AND conrelid::regclass::text IN (${tables})
    ORDER BY table_name, contype, conname
  `)
  const indexes = await prisma.$queryRawUnsafe(`
    SELECT tablename, indexname, indexdef
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND tablename IN (${tables})
    ORDER BY tablename, indexname
  `)
  const columns = await prisma.$queryRawUnsafe(`
    SELECT table_name, column_name, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name IN (${tables})
    ORDER BY table_name, ordinal_position
  `)

  const [violations] = await prisma.$queryRawUnsafe(`
    SELECT
      (SELECT count(*) FROM chefs WHERE created_at IS NULL) AS chefs_created_at_null,
      (SELECT count(*) FROM chef_profiles WHERE years_experience IS NULL) AS experience_null,
      (SELECT count(*) FROM chef_profiles WHERE years_experience > 80) AS experience_over_80,
      (SELECT count(*) FROM recipes WHERE difficulty IS NULL) AS difficulty_null,
      (SELECT count(*) FROM recipes WHERE servings IS NULL) AS servings_null,
      (SELECT count(*) FROM recipes WHERE created_at IS NULL) AS recipes_created_at_null,
      (SELECT count(*) FROM recipes WHERE char_length(trim(title)) = 0) AS blank_recipe_titles,
      (SELECT count(*) FROM recipes WHERE char_length(trim(instructions)) = 0) AS blank_recipe_instructions,
      (SELECT count(*) FROM ingredients WHERE unit IS NULL OR char_length(trim(unit)) = 0) AS missing_ingredient_units,
      (SELECT count(*) FROM ingredients WHERE char_length(trim(name)) = 0) AS blank_ingredient_names
  `)

  const [features] = await prisma.$queryRawUnsafe(`
    SELECT
      EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_trgm') AS pg_trgm_enabled,
      EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'recipe-images' AND public = true) AS image_bucket_ready,
      EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'recipe_reviews') AS reviews_table_ready
  `)

  console.log(JSON.stringify({ constraints, indexes, columns, violations, features }, (_, value) =>
    typeof value === 'bigint' ? value.toString() : value, 2))
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(() => prisma?.$disconnect())
