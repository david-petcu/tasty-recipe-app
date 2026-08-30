ALTER TABLE recipes ADD COLUMN category text NOT NULL DEFAULT 'dinner';

UPDATE recipes SET category = CASE
  WHEN lower(title) ~ '(crepe|omelet|polenta)' THEN 'breakfast'
  WHEN lower(title) ~ '(doughnut|loaf)' THEN 'dessert'
  WHEN lower(title) ~ '(soup|salad|burger|fries|potatoes)' THEN 'lunch'
  ELSE 'dinner'
END;

ALTER TABLE recipes ADD CONSTRAINT recipes_category_check
CHECK (category IN ('breakfast', 'lunch', 'dinner', 'dessert'));
