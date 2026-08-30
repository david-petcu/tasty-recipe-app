DO $$
BEGIN
  -- Normalize legacy nullable/defaulted fields before making them required.
  UPDATE chefs
  SET created_at = now()
  WHERE created_at IS NULL;

  UPDATE chef_profiles
  SET years_experience = 0
  WHERE years_experience IS NULL;

  UPDATE recipes
  SET difficulty = 'medium'
  WHERE difficulty IS NULL;

  UPDATE recipes
  SET servings = 1
  WHERE servings IS NULL;

  UPDATE recipes
  SET created_at = now()
  WHERE created_at IS NULL;

  UPDATE ingredients
  SET unit = 'pcs'
  WHERE unit IS NULL OR char_length(trim(unit)) = 0;

  ALTER TABLE chefs
    ALTER COLUMN created_at SET NOT NULL;

  ALTER TABLE chef_profiles
    ALTER COLUMN years_experience SET NOT NULL;

  ALTER TABLE recipes
    ALTER COLUMN difficulty SET NOT NULL,
    ALTER COLUMN servings SET NOT NULL,
    ALTER COLUMN created_at SET NOT NULL;

  ALTER TABLE ingredients
    ALTER COLUMN unit SET DEFAULT 'pcs',
    ALTER COLUMN unit SET NOT NULL;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'chef_profiles_experience_max_check'
      AND conrelid = 'chef_profiles'::regclass
  ) THEN
    ALTER TABLE chef_profiles
      ADD CONSTRAINT chef_profiles_experience_max_check
      CHECK (years_experience <= 80);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'recipes_title_not_empty_check'
      AND conrelid = 'recipes'::regclass
  ) THEN
    ALTER TABLE recipes
      ADD CONSTRAINT recipes_title_not_empty_check
      CHECK (char_length(trim(title)) > 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'recipes_instructions_not_empty_check'
      AND conrelid = 'recipes'::regclass
  ) THEN
    ALTER TABLE recipes
      ADD CONSTRAINT recipes_instructions_not_empty_check
      CHECK (char_length(trim(instructions)) > 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'ingredients_name_not_empty_check'
      AND conrelid = 'ingredients'::regclass
  ) THEN
    ALTER TABLE ingredients
      ADD CONSTRAINT ingredients_name_not_empty_check
      CHECK (char_length(trim(name)) > 0);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'ingredients_unit_not_empty_check'
      AND conrelid = 'ingredients'::regclass
  ) THEN
    ALTER TABLE ingredients
      ADD CONSTRAINT ingredients_unit_not_empty_check
      CHECK (char_length(trim(unit)) > 0);
  END IF;

  CREATE INDEX IF NOT EXISTS recipes_chef_id_idx
    ON recipes (chef_id);
  CREATE INDEX IF NOT EXISTS recipes_category_idx
    ON recipes (category);
  CREATE INDEX IF NOT EXISTS recipes_created_at_idx
    ON recipes (created_at);
  CREATE INDEX IF NOT EXISTS recipe_ingredients_ingredient_id_idx
    ON recipe_ingredients (ingredient_id);
  CREATE INDEX IF NOT EXISTS recipe_favorites_recipe_id_idx
    ON recipe_favorites (recipe_id);
END
$$;
