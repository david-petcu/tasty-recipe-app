DO $$
BEGIN
  CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA extensions;

  ALTER TABLE recipes
    ADD COLUMN IF NOT EXISTS image text;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'recipes_image_url_check'
      AND conrelid = 'recipes'::regclass
  ) THEN
    ALTER TABLE recipes
      ADD CONSTRAINT recipes_image_url_check
      CHECK (image IS NULL OR image ~ '^https?://');
  END IF;

  CREATE TABLE IF NOT EXISTS recipe_reviews (
    id bigserial PRIMARY KEY,
    chef_id bigint NOT NULL,
    recipe_id bigint NOT NULL,
    rating integer NOT NULL,
    comment text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    CONSTRAINT recipe_reviews_chef_id_fkey
      FOREIGN KEY (chef_id) REFERENCES chefs(id) ON DELETE CASCADE,
    CONSTRAINT recipe_reviews_recipe_id_fkey
      FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
    CONSTRAINT recipe_reviews_chef_id_recipe_id_key UNIQUE (chef_id, recipe_id),
    CONSTRAINT recipe_reviews_rating_check CHECK (rating BETWEEN 1 AND 5),
    CONSTRAINT recipe_reviews_comment_check
      CHECK (comment IS NULL OR (char_length(trim(comment)) BETWEEN 1 AND 1000))
  );

  CREATE INDEX IF NOT EXISTS recipe_reviews_recipe_id_created_at_idx
    ON recipe_reviews (recipe_id, created_at DESC);
  CREATE INDEX IF NOT EXISTS recipe_reviews_chef_id_idx
    ON recipe_reviews (chef_id);
  CREATE INDEX IF NOT EXISTS recipes_title_trgm_idx
    ON recipes USING gin (title extensions.gin_trgm_ops);
  CREATE INDEX IF NOT EXISTS ingredients_name_trgm_idx
    ON ingredients USING gin (name extensions.gin_trgm_ops);

  INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  VALUES (
    'recipe-images',
    'recipe-images',
    true,
    5242880,
    ARRAY['image/jpeg', 'image/png', 'image/webp']
  )
  ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;
END
$$;
