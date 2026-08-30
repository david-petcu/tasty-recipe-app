CREATE TABLE recipe_favorites (
  id bigserial PRIMARY KEY,
  chef_id bigint NOT NULL,
  recipe_id bigint NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT recipe_favorites_chef_id_fkey
    FOREIGN KEY (chef_id) REFERENCES chefs(id) ON DELETE CASCADE,
  CONSTRAINT recipe_favorites_recipe_id_fkey
    FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE CASCADE,
  CONSTRAINT recipe_favorites_chef_id_recipe_id_key UNIQUE (chef_id, recipe_id)
);

CREATE INDEX recipe_favorites_chef_id_created_at_idx
ON recipe_favorites (chef_id, created_at);
