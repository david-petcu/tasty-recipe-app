<script setup lang="ts">
definePageMeta({ middleware: 'auth' })
const { notify } = useNotifications()
const { data: recipes, pending, error, refresh } = await useFetch('/api/favorites')
const removingId = ref<string | null>(null)
const difficultyLabel: Record<string, string> = { easy: 'Easy', medium: 'Medium', hard: 'Advanced' }
const categoryLabel: Record<string, string> = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner', dessert: 'Dessert' }

async function removeSaved(recipeId: string | number) {
  removingId.value = String(recipeId)
  try {
    await $fetch(`/api/favorites/${recipeId}`, { method: 'DELETE' })
    await refresh()
    notify('Recipe removed from your saved collection.', 'success')
  } catch (removeError: any) {
    notify(removeError.data?.message || 'The recipe could not be removed.', 'error')
  } finally { removingId.value = null }
}
</script>

<template>
  <div class="page-shell">
    <section class="mb-10 rounded-2xl border border-slate-800 bg-slate-900 p-7 sm:p-10">
      <div class="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div><p class="eyebrow">Your collection</p><h1 class="mt-3 text-4xl font-extrabold text-white sm:text-5xl">Saved recipes</h1><p class="mt-4 max-w-2xl text-slate-500">Keep your favorite recipes close and return to them whenever you want to cook.</p></div>
        <span v-if="recipes?.length" class="rounded-xl bg-slate-800 px-4 py-2 text-sm font-bold text-slate-300">{{ recipes.length }} saved</span>
      </div>
    </section>

    <div v-if="pending" class="grid gap-6 md:grid-cols-2 lg:grid-cols-3"><div v-for="item in 6" :key="item" class="h-72 animate-pulse rounded-2xl border border-slate-800 bg-slate-900"></div></div>
    <div v-else-if="error" class="panel px-6 py-16 text-center"><UiIcon name="warning" :size="30" class="mx-auto text-red-400" /><h2 class="mt-4 text-xl font-extrabold text-white">Saved recipes could not be loaded</h2><button type="button" class="button-secondary mt-6" @click="refresh()">Try again</button></div>
    <div v-else-if="!recipes?.length" class="panel px-6 py-16 text-center"><span class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-950/50 text-rose-300"><UiIcon name="heart" :size="26" /></span><h2 class="mt-5 text-xl font-extrabold text-white">No saved recipes yet</h2><p class="mt-2 text-slate-500">Open a recipe and select “Save recipe” to add it here.</p><NuxtLink to="/" class="button-primary mt-6">Explore recipes</NuxtLink></div>
    <div v-else class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <article v-for="recipe in recipes" :key="recipe.id" class="flex min-h-72 flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 transition hover:border-emerald-800">
        <NuxtLink v-if="recipe.image" :to="`/recipe/${recipe.id}`" class="block h-40 overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-400"><img :src="recipe.image" :alt="recipe.title" loading="lazy" class="h-full w-full object-cover transition duration-300 hover:scale-[1.03]" /></NuxtLink>
        <NuxtLink :to="`/recipe/${recipe.id}`" class="group flex flex-1 flex-col p-7 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-emerald-500">
          <div class="mb-5 flex flex-wrap gap-2"><span class="rounded-full bg-slate-800 px-3 py-1.5 text-xs font-bold text-slate-300">{{ difficultyLabel[recipe.difficulty || 'medium'] }}</span><span class="rounded-full bg-emerald-950 px-3 py-1.5 text-xs font-bold text-emerald-300">{{ categoryLabel[recipe.category] }}</span></div>
          <h2 class="text-xl font-extrabold text-white transition group-hover:text-emerald-300">{{ recipe.title }}</h2>
          <p class="mt-3 line-clamp-2 text-sm leading-6 text-slate-500">{{ recipe.description || 'A recipe ready to be cooked and enjoyed.' }}</p>
          <div class="mt-auto flex items-center justify-between border-t border-slate-800 pt-5 text-sm text-slate-500"><span>{{ recipe.chefs.username }}</span><span class="flex items-center gap-1.5"><UiIcon name="clock" :size="15" />{{ recipe.cooking_time }} min</span></div>
        </NuxtLink>
        <button type="button" class="flex items-center justify-center gap-2 border-t border-slate-800 px-5 py-3 text-sm font-bold text-rose-300 transition hover:bg-rose-950/40 disabled:opacity-60" :disabled="removingId === String(recipe.id)" @click="removeSaved(recipe.id)"><UiIcon name="heart" :size="17" />{{ removingId === String(recipe.id) ? 'Removing...' : 'Remove from saved' }}</button>
      </article>
    </div>
  </div>
</template>
