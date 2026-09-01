-- Tasty uses custom, server-side authentication rather than Supabase Auth.
-- All application data must therefore be accessed through the Nuxt API, where
-- session and ownership checks are enforced. RLS remains default-deny for any
-- direct Data API access made with the Supabase anon/authenticated roles.

ALTER TABLE public.chefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chef_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_ingredients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipe_reviews ENABLE ROW LEVEL SECURITY;

-- No permissive policies are intentionally created. With RLS enabled, the
-- absence of policies is a default-deny policy for non-bypass roles.

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    REVOKE ALL PRIVILEGES ON TABLE
      public.chefs,
      public.chef_profiles,
      public.recipes,
      public.ingredients,
      public.recipe_ingredients,
      public.recipe_favorites,
      public.recipe_reviews
    FROM anon;

    REVOKE ALL PRIVILEGES ON SEQUENCE
      public.chefs_id_seq,
      public.chef_profiles_id_seq,
      public.recipes_id_seq,
      public.ingredients_id_seq,
      public.recipe_ingredients_id_seq,
      public.recipe_favorites_id_seq,
      public.recipe_reviews_id_seq
    FROM anon;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    REVOKE ALL PRIVILEGES ON TABLE
      public.chefs,
      public.chef_profiles,
      public.recipes,
      public.ingredients,
      public.recipe_ingredients,
      public.recipe_favorites,
      public.recipe_reviews
    FROM authenticated;

    REVOKE ALL PRIVILEGES ON SEQUENCE
      public.chefs_id_seq,
      public.chef_profiles_id_seq,
      public.recipes_id_seq,
      public.ingredients_id_seq,
      public.recipe_ingredients_id_seq,
      public.recipe_favorites_id_seq,
      public.recipe_reviews_id_seq
    FROM authenticated;
  END IF;
END
$$;

COMMENT ON TABLE public.chefs IS
  'Server-only table. Direct Supabase Data API access is denied by RLS.';
COMMENT ON TABLE public.chef_profiles IS
  'Server-only table. Direct Supabase Data API access is denied by RLS.';
COMMENT ON TABLE public.recipes IS
  'Server-only table. Public reads are exposed through the Nuxt API.';
COMMENT ON TABLE public.ingredients IS
  'Server-only table. Public reads are exposed through the Nuxt API.';
COMMENT ON TABLE public.recipe_ingredients IS
  'Server-only table. Public reads are exposed through the Nuxt API.';
COMMENT ON TABLE public.recipe_favorites IS
  'Server-only table. Access is scoped to the signed-in chef by the Nuxt API.';
COMMENT ON TABLE public.recipe_reviews IS
  'Server-only table. Mutations are scoped to the signed-in chef by the Nuxt API.';
