BEGIN;

-- Normalize values used for authentication and ingredient searches.
UPDATE chefs SET email = lower(trim(email));

-- Merge case-insensitive duplicate ingredients, keeping the oldest ID.
WITH canonical AS (
  SELECT id, min(id) OVER (PARTITION BY lower(name)) AS canonical_id
  FROM ingredients
)
UPDATE recipe_ingredients ri
SET ingredient_id = canonical.canonical_id
FROM canonical
WHERE ri.ingredient_id = canonical.id
  AND canonical.id <> canonical.canonical_id;

DELETE FROM ingredients duplicate
USING ingredients canonical
WHERE lower(duplicate.name) = lower(canonical.name)
  AND duplicate.id > canonical.id;

UPDATE ingredients SET name = lower(trim(name));

-- Relationships required by the application no longer accept NULL values.
ALTER TABLE chef_profiles ALTER COLUMN chef_id SET NOT NULL;
ALTER TABLE recipes ALTER COLUMN chef_id SET NOT NULL;
ALTER TABLE recipe_ingredients ALTER COLUMN recipe_id SET NOT NULL;
ALTER TABLE recipe_ingredients ALTER COLUMN ingredient_id SET NOT NULL;

-- Deleting a parent record automatically removes dependent data.
ALTER TABLE chef_profiles DROP CONSTRAINT chef_profiles_chef_id_fkey;
ALTER TABLE chef_profiles ADD CONSTRAINT chef_profiles_chef_id_fkey FOREIGN KEY (chef_id) REFERENCES chefs(id) ON DELETE CASCADE;
ALTER TABLE recipes DROP CONSTRAINT recipes_chef_id_fkey;
ALTER TABLE recipes ADD CONSTRAINT recipes_chef_id_fkey FOREIGN KEY (chef_id) REFERENCES chefs(id) ON DELETE CASCADE;
ALTER TABLE recipe_ingredients DROP CONSTRAINT recipe_ingredients_recipe_id_fkey;
ALTER TABLE recipe_ingredients ADD CONSTRAINT recipe_ingredients_recipe_id_fkey FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE;
ALTER TABLE recipe_ingredients DROP CONSTRAINT recipe_ingredients_ingredient_id_fkey;
ALTER TABLE recipe_ingredients ADD CONSTRAINT recipe_ingredients_ingredient_id_fkey FOREIGN KEY (ingredient_id) REFERENCES ingredients(id) ON DELETE CASCADE;

-- Case-insensitive uniqueness.
CREATE UNIQUE INDEX chefs_email_lower_key ON chefs (lower(email));
CREATE UNIQUE INDEX chefs_username_lower_key ON chefs (lower(username));
CREATE UNIQUE INDEX ingredients_name_lower_key ON ingredients (lower(name));
ALTER TABLE recipe_ingredients ADD CONSTRAINT recipe_ingredients_recipe_id_ingredient_id_key UNIQUE (recipe_id, ingredient_id);

-- Integrity constraints for values submitted through forms.
ALTER TABLE chefs ADD CONSTRAINT chefs_username_length_check CHECK (char_length(trim(username)) >= 3);
ALTER TABLE chefs ADD CONSTRAINT chefs_email_format_check CHECK (position('@' in email) > 1);
ALTER TABLE chefs ADD CONSTRAINT chefs_password_not_empty_check CHECK (char_length(password) > 0);
ALTER TABLE chef_profiles ADD CONSTRAINT chef_profiles_experience_check CHECK (years_experience IS NULL OR years_experience >= 0);
ALTER TABLE recipes ADD CONSTRAINT recipes_cooking_time_check CHECK (cooking_time > 0);
ALTER TABLE recipes ADD CONSTRAINT recipes_servings_check CHECK (servings IS NULL OR servings > 0);
ALTER TABLE recipes ADD CONSTRAINT recipes_difficulty_check CHECK (difficulty IN ('easy', 'medium', 'hard'));
ALTER TABLE recipe_ingredients ADD CONSTRAINT recipe_ingredients_quantity_check CHECK (char_length(trim(quantity)) > 0);

COMMIT;
